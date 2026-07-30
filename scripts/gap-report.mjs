/**
 * gap-report.mjs — מה מותקן במחשב ואין לו רשומה בארכיון.
 *
 * בלי זה הדף מתיימר לכסות את מה שיש, ולא באמת יודע.
 * הרצה: node scripts/gap-report.mjs
 */

import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { scanInstalled, gaps } from './install-state.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const GEN = join(ROOT, 'src', 'data', 'generated', 'content.js')

const installed = scanInstalled()

let items = []
if (existsSync(GEN)) {
  ({ CONTENT: items } = await import(`file://${GEN}?t=${Date.now()}`))
}

// גם הקטלוג הישן נחשב כיסוי — עד שלב 9 הוא עדיין מקור אמת חי
const legacy = join(ROOT, 'src', 'data', 'skills.js')
if (existsSync(legacy)) {
  const { SKILLS } = await import(`file://${legacy}`)
  items = [...items, ...SKILLS.map(s => ({ type: 'skill', cmd: s.cmd, id: s.cmd }))]

  // פלאגין שהסקילים שלו מתועדים נחשב מכוסה. בלי זה כל פלאגין
  // מופיע כפער רק בגלל שאין לו רשומה בשם שלו, וזה רעש שמסתיר פערים אמיתיים
  items.push(...new Set(SKILLS.map(s => s.source).filter(Boolean))
    .values()
    .map(src => ({ type: 'skill', cmd: src, id: src })))
}

const missing = gaps(items, installed)

console.log(`מותקן במחשב: ${installed.size} · מכוסה בארכיון: ${installed.size - missing.length}`)

if (!missing.length) {
  console.log('אין פערים')
} else {
  console.log(`\nמותקן ואין לו רשומה — ${missing.length}:`)
  for (const m of missing) console.log(`  ${m}`)
}

export { missing }
