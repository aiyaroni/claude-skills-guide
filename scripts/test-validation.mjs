/**
 * test-validation.mjs — מוודא שהוולידטור נכשל כשהוא צריך.
 *
 * ולידטור שלא נבדק על קלט שבור הוא ולידטור שלא יודעים אם הוא עובד.
 * הרצה: node scripts/test-validation.mjs
 */

import { writeFileSync, unlinkSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TMP_ID = 'zz-test-fixture'

const GOOD = `---
id: ${TMP_ID}
type: skill
title: פריט בדיקה
summary: קובץ זמני שנוצר על ידי test-validation
tags: [tokens]
source_date: 2026-07
ingested_at: 2026-07-30
completeness: full
private: false
cmd: zz-test
install_cmd: "echo hello"
security: unverified
triggers: ["בדיקה"]
pros: [יתרון]
cons: not-found
when_not: not-found
prereq: not-found
cost_note: not-found
provenance:
  install_cmd: { from: source, loc: "בדיקה" }
  triggers:    { from: source, loc: "בדיקה" }
  security:    { from: source, loc: "בדיקה" }
  pros:        { from: source, loc: "בדיקה" }
  cons:        { from: not-found, reason: "בדיקה" }
  when_not:    { from: not-found, reason: "בדיקה" }
  prereq:      { from: not-found, reason: "בדיקה" }
  cost_note:   { from: not-found, reason: "בדיקה" }
---

גוף ארוך מספיק כדי לא להפעיל אזהרה על גוף קצר מדי בבדיקה הזאת.
`

const path = join(ROOT, 'content', 'skills', `${TMP_ID}.md`)

/** מריץ את הבנייה ומחזיר { ok, out } */
function build() {
  try {
    const out = execFileSync('node', ['scripts/build-content.mjs'], { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' })
    return { ok: true, out }
  } catch (e) {
    return { ok: false, out: (e.stdout || '') + (e.stderr || '') }
  }
}

const cases = [
  {
    name: 'קובץ תקין עובר',
    md: GOOD,
    expectPass: true,
  },
  {
    name: 'שדה חובה חסר → נכשל ומצביע על השדה',
    md: GOOD.replace(/^cons: not-found$/m, ''),
    expect: ['cons'],
  },
  {
    name: 'תג שלא ברשימה → נכשל',
    md: GOOD.replace('tags: [tokens]', 'tags: [tokens, המצאתי-תג]'),
    expect: ['tags', 'אישור אנושי'],
  },
  {
    name: 'המצאה — שדה בלי provenance → נכשל',
    md: GOOD.replace(/^  cost_note:   \{ from: not-found, reason: "בדיקה" \}$/m, '')
            .replace('cost_note: not-found', 'cost_note: עולה 20 דולר לחודש'),
    expect: ['provenance', 'ADR 002'],
  },
  {
    name: 'not-found עם ערך אמיתי → סתירה נתפסת',
    md: GOOD.replace('cost_note: not-found', 'cost_note: חינמי'),
    expect: ['from=not-found אבל יש ערך'],
  },
  {
    name: 'cross-ref לפריט שלא קיים → נכשל',
    md: GOOD.replace('  cons:        { from: not-found, reason: "בדיקה" }',
                     '  cons:        { from: cross-ref, ref: אין-כזה-פריט }')
            .replace('cons: not-found', 'cons: [חיסרון כלשהו]'),
    expect: ['cross-ref', 'לא קיים בארכיון'],
  },
  {
    name: 'summary ארוך מדי → נכשל',
    md: GOOD.replace('summary: קובץ זמני שנוצר על ידי test-validation',
                     `summary: ${'א'.repeat(130)}`),
    expect: ['summary', '130'],
  },
  {
    name: 'id לא kebab-case → נכשל',
    md: GOOD.replace(`id: ${TMP_ID}`, 'id: Test_Fixture'),
    expect: ['kebab-case'],
  },
  {
    name: 'private: true נחתך מהפלט',
    md: GOOD.replace('private: false', 'private: true'),
    expectPass: true,
    then: () => {
      const gen = join(ROOT, 'src', 'data', 'generated', 'content.js')
      const txt = existsSync(gen) ? readFile(gen) : ''
      if (txt.includes(TMP_ID)) throw new Error('פריט private הופיע בפלט הבנייה')
    },
  },
]

function readFile(p) {
  return execFileSync('cat', [p], { encoding: 'utf8' })
}

let pass = 0, failed = 0

try {
  for (const c of cases) {
    writeFileSync(path, c.md)
    const r = build()

    if (c.expectPass) {
      if (!r.ok) { console.error(`✗ ${c.name}\n   ציפינו שיעבור, נכשל:\n${r.out}`); failed++; continue }
      try { c.then?.() } catch (e) { console.error(`✗ ${c.name}\n   ${e.message}`); failed++; continue }
    } else {
      if (r.ok) { console.error(`✗ ${c.name}\n   ציפינו לכשל, הבנייה עברה`); failed++; continue }
      const missing = c.expect.filter(s => !r.out.includes(s))
      if (missing.length) {
        console.error(`✗ ${c.name}\n   השגיאה לא הזכירה: ${missing.join(', ')}\n${r.out}`); failed++; continue
      }
    }
    console.log(`✓ ${c.name}`)
    pass++
  }
} finally {
  if (existsSync(path)) unlinkSync(path)
  build() // מחזיר את הפלט למצב נקי אחרי מחיקת הפיקסצ'ר
}

console.log(`\n${pass} עברו, ${failed} נכשלו`)
process.exit(failed ? 1 : 0)
