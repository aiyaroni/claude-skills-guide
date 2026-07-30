/**
 * dashboard.mjs — מה קרה בכל ריצה, בקובץ HTML עצמאי.
 *
 * למה נפרד ולא route באתר: הדשבורד צריך לעבוד כשהבנייה שבורה,
 * וזה בדיוק הרגע שבו צריך אותו. route שלא נבנה לא עוזר.
 *
 * בלי תלויות חוץ, CSS מוטבע, נפתח בדאבל-קליק.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = f => existsSync(join(ROOT, f)) ? readFileSync(join(ROOT, f), 'utf8') : ''

const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// ── איסוף ───────────────────────────────────────────────────────────────

/** failures.md: תאריך | קובץ | שלב | סוכן | סוג | שגיאה | מה חולץ | איפה */
const failures = read('failures.md').split('\n')
  .filter(l => l.includes('|'))
  .map(l => l.split('|').map(s => s.trim()))
  .filter(p => p.length >= 8 && /^\d{4}-\d{2}-\d{2}/.test(p[0]))
  .map(([at, file, stage, agent, kind, error, got, where]) =>
    ({ at, file, stage, agent, kind, error, got, where }))
  .reverse()

const log = read('ingest-log.md')
const loopState = read('LOOP-STATE.md')

/** מה נקלט, מכל המניפסטים ב-processed/ */
function manifests() {
  const dir = join(ROOT, 'processed')
  if (!existsSync(dir)) return []
  const out = []
  for (const day of readdirSync(dir).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().reverse()) {
    const m = read(join('processed', day, '_manifest.md'))
    for (const line of m.split('\n')) {
      const [left, ...rest] = line.split('|').map(s => s.trim())
      if (!left?.includes('→')) continue
      const [src, target] = left.split('→').map(s => s.trim())
      out.push({ day, src, target, type: rest[0] || '', tags: rest[1] || '', completeness: rest[2] || '' })
    }
  }
  return out
}

let gaps = []
try {
  const { scanInstalled, gaps: findGaps } = await import(join(ROOT, 'scripts/install-state.mjs'))
  const gen = join(ROOT, 'src/data/generated/content.js')
  let items = existsSync(gen) ? (await import(`file://${gen}?t=${Date.now()}`)).CONTENT : []
  const legacy = join(ROOT, 'src/data/skills.js')
  if (existsSync(legacy)) {
    const { SKILLS } = await import(`file://${legacy}`)
    items = [...items, ...SKILLS.map(s => ({ type: 'skill', cmd: s.cmd, id: s.cmd })),
             ...new Set(SKILLS.map(s => s.source).filter(Boolean))].map(x =>
               typeof x === 'string' ? { type: 'skill', cmd: x, id: x } : x)
  }
  gaps = findGaps(items, scanInstalled())
} catch { /* הדשבורד נכתב גם כשהבנייה שבורה — זו כל הנקודה שלו */ }

const pending = log.split('\n').filter(l => /ממתין לאישור|tag-unknown/.test(l))
const items = manifests()
const lastRun = items[0]?.day || failures[0]?.at?.slice(0, 10) || '—'
const status = failures.some(f => f.at?.startsWith(lastRun)) ? 'חלקי' : items.length ? 'הצליח' : 'אין ריצה'

// ── תצוגה ───────────────────────────────────────────────────────────────

const rows = (arr, cols, fn) => arr.length
  ? `<table><thead><tr>${cols.map(c => `<th>${c}</th>`).join('')}</tr></thead><tbody>${arr.map(fn).join('')}</tbody></table>`
  : `<p class="muted">אין</p>`

const html = `<!doctype html>
<html lang="he" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>מרכז הידע — יומן קליטה</title>
<style>
  :root{--cream:#F5F0E8;--paper:#FAF7F2;--ink:#0D0D0D;--mute:#6B6B6B;
        --line:rgba(0,0,0,.10);--lime:#C8FF00;--fuchsia:#FF2D78}
  *{box-sizing:border-box}
  body{margin:0;padding:28px 20px;background:var(--cream);color:var(--ink);
       font:15px/1.6 -apple-system,'Segoe UI',Heebo,sans-serif}
  .wrap{max-width:1000px;margin:0 auto}
  h1{font-size:26px;margin:0 0 4px} h2{font-size:16px;margin:0 0 12px}
  .sub{color:var(--mute);font-size:13.5px;margin-bottom:22px}
  section{background:var(--paper);border:1px solid var(--line);border-radius:14px;
          padding:18px 20px;margin-bottom:14px}
  section.alert{border-color:rgba(255,45,120,.4);background:rgba(255,45,120,.04)}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th{text-align:right;color:var(--mute);font-weight:600;padding:6px 8px;
     border-bottom:1px solid var(--line);white-space:nowrap}
  td{padding:7px 8px;border-bottom:1px solid var(--line);vertical-align:top}
  tr:last-child td{border-bottom:0}
  code{font:12px/1.5 'JetBrains Mono',monospace;direction:ltr;display:inline-block}
  .muted{color:var(--mute);font-size:13.5px;margin:0}
  .pill{display:inline-block;padding:3px 9px;border-radius:999px;font-size:11.5px;font-weight:600}
  .ok{background:var(--lime)} .bad{background:var(--fuchsia);color:#fff} .warn{background:#fde68a}
  .err{color:var(--fuchsia);font-size:12px;word-break:break-word}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px}
  .stat{background:var(--paper);border:1px solid var(--line);border-radius:12px;padding:14px 16px}
  .stat b{display:block;font-size:24px;line-height:1.2}
  .stat span{color:var(--mute);font-size:12.5px}
  pre{background:var(--cream);border:1px solid var(--line);border-radius:8px;
      padding:12px;overflow-x:auto;font-size:12px;margin:0}
</style></head><body><div class="wrap">

<h1>יומן קליטה</h1>
<div class="sub">
  ריצה אחרונה: ${esc(lastRun)} ·
  <span class="pill ${status === 'הצליח' ? 'ok' : status === 'חלקי' ? 'warn' : 'bad'}">${status}</span> ·
  נוצר ${new Date().toLocaleString('he-IL')}
</div>

<div class="grid" style="margin-bottom:14px">
  <div class="stat"><b>${items.length}</b><span>נקלטו לארכיון</span></div>
  <div class="stat"><b>${failures.length}</b><span>כשלונות</span></div>
  <div class="stat"><b>${gaps.length}</b><span>פערי כיסוי</span></div>
  <div class="stat"><b>${pending.length}</b><span>ממתין לאישורך</span></div>
</div>

${failures.length ? `<section class="alert">
  <h2>כשלונות</h2>
  ${rows(failures, ['מתי', 'קובץ', 'שלב', 'סוג', 'השגיאה', 'מה כן חולץ', 'איפה הקובץ'], f => `
    <tr><td>${esc(f.at)}</td><td><code>${esc(f.file)}</code></td>
    <td>${esc(f.stage)}</td><td><span class="pill bad">${esc(f.kind)}</span></td>
    <td class="err">${esc(f.error)}</td><td>${esc(f.got)}</td>
    <td><code>${esc(f.where)}</code></td></tr>`)}
</section>` : ''}

<section>
  <h2>מה נקלט</h2>
  ${rows(items, ['יום', 'מקור', 'נכנס כ', 'סוג', 'תגיות', 'שלמות'], i => `
    <tr><td>${esc(i.day)}</td><td><code>${esc(i.src)}</code></td>
    <td><code>${esc(i.target)}</code></td><td>${esc(i.type)}</td>
    <td>${esc(i.tags)}</td><td>${esc(i.completeness)}</td></tr>`)}
</section>

${pending.length ? `<section>
  <h2>ממתין לאישורך</h2>
  <pre>${esc(pending.join('\n'))}</pre>
</section>` : ''}

<section>
  <h2>פערי כיסוי</h2>
  ${gaps.length
    ? `<p class="muted">מותקן במחשב ואין לו רשומה בארכיון:</p><p><code>${gaps.map(esc).join(' · ')}</code></p>`
    : '<p class="muted">אין פערים</p>'}
</section>

${loopState ? `<section><h2>מצב הלופ</h2><pre>${esc(loopState)}</pre></section>` : ''}

</div></body></html>
`

writeFileSync(join(ROOT, 'dashboard.html'), html)
console.log(`✓ dashboard.html — ${items.length} נקלטו, ${failures.length} כשלונות, ${gaps.length} פערים`)
