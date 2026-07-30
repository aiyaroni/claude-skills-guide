/**
 * install-state.mjs — מחשב מצב התקנה מסריקת המחשב.
 *
 * מצב התקנה אף פעם לא נכתב ביד. הוא מתגלה מסריקה בכל בנייה,
 * ולכן הדף לא יכול להשקר לגבי מה מותקן.
 *
 * installed  — נמצא בסריקה
 * collected  — יש install_cmd, לא נמצא. זו רשימת ההמתנה
 * reference  — אין install_cmd. אין מה להתקין
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

const HOME = homedir()

/**
 * סקיל מותקן הוא תיקייה **או קישור סימבולי** אליה.
 * 29 מהסקילים כאן מותקנים כקישורים, וסינון לפי isDirectory בלבד
 * סימן את כולם כ"לא מותקן". בדיוק הכשל שהפיצ'ר הזה נועד למנוע.
 */
function readDirSafe(p) {
  try {
    return readdirSync(p, { withFileTypes: true })
      .filter(d => (d.isDirectory() || d.isSymbolicLink()) && !d.name.startsWith('.'))
      .map(d => d.name)
  } catch { return [] }
}

function readJsonSafe(p) {
  try { return JSON.parse(readFileSync(p, 'utf8')) } catch { return null }
}

/** כל מה שמותקן על המחשב, כסט של מזהים מנורמלים */
export function scanInstalled() {
  const found = new Set()

  for (const name of readDirSafe(join(HOME, '.claude', 'skills'))) found.add(norm(name))

  // installed_plugins.json v2: { version, plugins: { "name@marketplace": [...] } }
  // רק המפתחות. סריקה רקורסיבית אוספת חותמות זמן וגרסאות ומנפחת את הספירה
  const plugins = readJsonSafe(join(HOME, '.claude', 'plugins', 'installed_plugins.json'))
  for (const k of Object.keys(plugins?.plugins ?? {})) found.add(norm(k))

  const mcp = readJsonSafe(join(HOME, '.mcp.json'))
  for (const k of Object.keys(mcp?.mcpServers ?? {})) found.add(norm(k))

  return found
}

/** `/post:post-linkedin` ו-`post-linkedin@marketplace` שניהם → `post-linkedin` */
function norm(s) {
  return String(s)
    .trim()
    .replace(/^\//, '')
    .replace(/@.*$/, '')
    .split(':').pop()
    .toLowerCase()
}

export function installStateFor(item, installed) {
  if (item.type !== 'skill') return 'reference'
  const keys = [item.cmd, item.id].filter(Boolean).map(norm)
  if (keys.some(k => installed.has(k))) return 'installed'
  return item.install_cmd && item.install_cmd !== 'not-found' ? 'collected' : 'reference'
}

/** סקילים שמותקנים במחשב ואין להם רשומה — הדף לא מתיימר לכסות אותם */
export function gaps(items, installed) {
  const covered = new Set(
    items.filter(i => i.type === 'skill')
      .flatMap(i => [i.cmd, i.id].filter(Boolean).map(norm))
  )
  return [...installed].filter(k => !covered.has(k)).sort()
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const assert = (cond, msg) => { if (!cond) { console.error(`✗ ${msg}`); process.exitCode = 1 } }

  assert(norm('/post:post-linkedin') === 'post-linkedin', 'norm מסיר לוכסן ומרחב שמות')
  assert(norm('ponytail@ponytail') === 'ponytail', 'norm מסיר שוק')
  assert(norm('Caveman') === 'caveman', 'norm מוריד רישיות')

  // רגרסיה: 29 סקילים מותקנים כקישורים סימבוליים. סינון לפי isDirectory
  // בלבד סימן אותם כלא-מותקנים. אם המספר כאן צונח, הבאג חזר
  const dir = join(HOME, '.claude', 'skills')
  const links = readdirSync(dir, { withFileTypes: true }).filter(d => d.isSymbolicLink()).length
  const installed = scanInstalled()
  assert(installed.size > links, 'הסריקה כוללת גם קישורים סימבוליים')

  console.log(`מותקן במחשב: ${installed.size} (מהם ${links} קישורים סימבוליים)`)
  console.log([...installed].sort().slice(0, 15).join(', ') + ' …')
  if (!process.exitCode) console.log('✓ בדיקות עברו')
}
