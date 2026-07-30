/**
 * build-content.mjs — קורא content/, מוודא, ומייצר src/data/generated/.
 *
 * נכשל ביציאה לא-אפס על כל תוכן לא תקין. זה העיקר:
 * שדה חסר נתפס בזמן בנייה עם שם קובץ ושם שדה, לא בזמן ריצה מול המשתמש.
 *
 * ראה docs/adr/001 (למה בלי zod) ו-002 (למה provenance חובה).
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import { scanInstalled, installStateFor } from './install-state.mjs'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const CONTENT = join(ROOT, 'content')
const OUT = join(ROOT, 'src', 'data', 'generated')

const TYPES = ['guides', 'prompts', 'skills']
const TYPE_OF = { guides: 'guide', prompts: 'prompt', skills: 'skill' }

// ── סכמה ────────────────────────────────────────────────────────────────
// factual = חייב provenance. ראה ADR 002.

const COMMON = ['id', 'type', 'title', 'summary', 'tags', 'ingested_at', 'completeness']

const BY_TYPE = {
  guide:  { required: ['level'], factual: ['level', 'part_of'] },
  prompt: { required: ['use_when', 'model', 'prompt_text'], factual: ['use_when', 'model', 'prompt_text'] },
  skill:  {
    required: ['cmd', 'install_cmd', 'triggers', 'security', 'pros', 'cons', 'when_not', 'prereq', 'cost_note'],
    factual:  ['install_cmd', 'triggers', 'security', 'pros', 'cons', 'when_not', 'prereq', 'cost_note'],
  },
}

const SECURITY = ['unverified', 'verified', 'rejected']
const COMPLETENESS = ['full', 'partial']
const MODELS = ['fable', 'opus', 'sonnet', 'haiku', 'any']
const NOT_FOUND = 'not-found'

// ── ולידציה ─────────────────────────────────────────────────────────────

const errors = []
const warnings = []

const fail = (file, field, msg) => errors.push({ file, field, msg })
const warn = (file, field, msg) => warnings.push({ file, field, msg })

const isEmpty = v =>
  v == null || v === '' || (Array.isArray(v) && v.length === 0)

const isNotFound = v =>
  v === NOT_FOUND || (Array.isArray(v) && v.length === 1 && v[0] === NOT_FOUND)

/**
 * YAML הופך `2026-07-30` לא מצוטט לאובייקט Date.
 * מנרמלים במקום לדרוש מרכאות — מי שכותב קובץ תוכן ביד ישכח אותן.
 * שעון מקומי ולא toISOString, שאחרת חצות מקומית נופלת ליום הקודם ב-UTC.
 */
const asDateStr = v => {
  if (!(v instanceof Date)) return v
  const p = n => String(n).padStart(2, '0')
  return `${v.getFullYear()}-${p(v.getMonth() + 1)}-${p(v.getDate())}`
}

/** ערך סגור, כש-not-found תמיד לגיטימי — כלל הברזל גובר על רשימת הערכים */
const badEnum = (v, allowed) => v != null && v !== NOT_FOUND && !allowed.includes(v)

function validate(file, fm, body, tagList, seenIds) {
  const type = fm.type

  for (const f of COMMON) {
    if (isEmpty(fm[f])) fail(file, f, 'שדה חובה חסר')
  }
  if (!TYPE_OF[basename(dirname(file)) + ''] && !type) return

  const spec = BY_TYPE[type]
  if (!spec) { fail(file, 'type', `סוג לא מוכר: ${type}`); return }

  for (const f of spec.required) {
    if (fm[f] === undefined || fm[f] === null) fail(file, f, 'שדה חובה חסר (ערך not-found תקין)')
  }

  // id
  if (fm.id) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(fm.id)) fail(file, 'id', `חייב kebab-case באנגלית, התקבל "${fm.id}"`)
    if (seenIds.has(fm.id)) fail(file, 'id', `כפול — כבר קיים ב-${seenIds.get(fm.id)}`)
    else seenIds.set(fm.id, file)
  }

  // summary
  if (fm.summary) {
    if (fm.summary.length > 120) fail(file, 'summary', `${fm.summary.length} תווים, מקסימום 120`)
    if (/\n/.test(fm.summary)) fail(file, 'summary', 'שורה אחת בלבד')
    if (/[.。]$/.test(fm.summary.trim())) fail(file, 'summary', 'בלי נקודה בסוף')
  }

  // tags
  for (const t of fm.tags || []) {
    if (!tagList.includes(t)) fail(file, 'tags', `תג "${t}" לא ב-content/tags.json. תג חדש דורש אישור אנושי`)
  }

  // תאריכים — מנורמלים חזרה למחרוזת כדי שהפלט יהיה עקבי
  fm.ingested_at = asDateStr(fm.ingested_at)
  fm.source_date = asDateStr(fm.source_date)
  if (fm.source_date && !/^\d{4}-\d{2}$/.test(String(fm.source_date))) {
    fail(file, 'source_date', `פורמט YYYY-MM, התקבל "${fm.source_date}"`)
  }
  if (fm.ingested_at && !/^\d{4}-\d{2}-\d{2}$/.test(String(fm.ingested_at))) {
    fail(file, 'ingested_at', `פורמט YYYY-MM-DD, התקבל "${fm.ingested_at}"`)
  }

  // ערכים סגורים
  if (badEnum(fm.completeness, COMPLETENESS))
    fail(file, 'completeness', `אחד מ-${COMPLETENESS.join(' / ')}`)
  if (type === 'skill' && badEnum(fm.security, SECURITY))
    fail(file, 'security', `אחד מ-${SECURITY.join(' / ')}`)
  if (type === 'prompt' && badEnum(fm.model, MODELS))
    fail(file, 'model', `אחד מ-${MODELS.join(' / ')}`)

  // חלקי חייב להסביר מה חסר
  if (fm.completeness === 'partial' && isEmpty(fm.extraction_notes))
    fail(file, 'extraction_notes', 'completeness: partial מחייב פירוט מה חסר')

  // ── כלל הברזל ──
  const prov = fm.provenance || {}
  for (const f of spec.factual) {
    const val = fm[f]
    if (val === undefined) continue

    const p = prov[f]
    if (!p) { fail(file, f, 'חסר provenance. כלל הברזל — ראה ADR 002'); continue }
    if (!['source', 'cross-ref', 'not-found'].includes(p.from)) {
      fail(file, `provenance.${f}`, `from חייב source / cross-ref / not-found, התקבל "${p.from}"`)
      continue
    }
    // עקביות בין הערך למקור שלו
    if (isNotFound(val) && p.from !== 'not-found')
      fail(file, `provenance.${f}`, `הערך not-found אבל from="${p.from}"`)
    if (!isNotFound(val) && p.from === 'not-found')
      fail(file, `provenance.${f}`, 'from=not-found אבל יש ערך')

    if (p.from === 'not-found' && isEmpty(p.reason))
      fail(file, `provenance.${f}`, 'not-found מחייב reason')
    if (p.from === 'source' && isEmpty(p.loc))
      warn(file, `provenance.${f}`, 'from=source בלי loc — קשה לאמת מאוחר יותר')
    if (p.from === 'cross-ref' && isEmpty(p.ref))
      fail(file, `provenance.${f}`, 'cross-ref מחייב ref ל-id')
  }

  // גוף
  if (!body || body.trim().length < 40) warn(file, 'body', 'גוף קצר מ-40 תווים')

  return prov
}

// ── קריאה ───────────────────────────────────────────────────────────────

function loadTags() {
  const p = join(CONTENT, 'tags.json')
  if (!existsSync(p)) { console.error('✗ content/tags.json חסר'); process.exit(1) }
  return Object.keys(JSON.parse(readFileSync(p, 'utf8')).tags)
}

function loadAll(tagList) {
  const items = []
  const seenIds = new Map()
  const crossRefs = []

  for (const dir of TYPES) {
    const full = join(CONTENT, dir)
    if (!existsSync(full)) continue
    for (const f of readdirSync(full).filter(f => f.endsWith('.md'))) {
      const file = join('content', dir, f)
      const { data: fm, content: body } = matter(readFileSync(join(full, f), 'utf8'))

      if (fm.type && fm.type !== TYPE_OF[dir])
        fail(file, 'type', `הקובץ ב-${dir}/ אבל type="${fm.type}"`)
      fm.type ||= TYPE_OF[dir]

      const prov = validate(file, fm, body, tagList, seenIds) || {}
      for (const [field, p] of Object.entries(prov))
        if (p?.from === 'cross-ref' && p.ref) crossRefs.push({ file, field, ref: p.ref })

      items.push({ ...fm, body: body.trim(), _file: file })
    }
  }

  // cross-ref חייב להצביע על id שקיים באמת
  for (const { file, field, ref } of crossRefs) {
    if (!seenIds.has(ref)) fail(file, `provenance.${field}`, `cross-ref ל-"${ref}" — לא קיים בארכיון`)
  }

  return items
}

// ── פלט ─────────────────────────────────────────────────────────────────

function emit(items) {
  mkdirSync(OUT, { recursive: true })

  const installed = scanInstalled()
  const withState = items.map(i => ({ ...i, install_state: installStateFor(i, installed) }))

  // private נחתך כאן, לפני שהוא מגיע לאתר או לאינדקס
  const publicItems = withState.filter(i => !i.private)
  const cut = withState.length - publicItems.length

  writeFileSync(join(OUT, 'content.js'),
    `// נוצר על ידי scripts/build-content.mjs — לא לערוך ביד\n` +
    `export const CONTENT = ${JSON.stringify(publicItems, null, 1)}\n`)

  writeFileSync(join(OUT, 'search-index.json'), JSON.stringify(
    publicItems.map(i => ({
      id: i.id, type: i.type, title: i.title, summary: i.summary,
      tags: i.tags || [], cmd: i.cmd || null, install_state: i.install_state,
    })), null, 1))

  return { total: withState.length, published: publicItems.length, cut, installed: installed.size }
}

// ── ריצה ────────────────────────────────────────────────────────────────

const tagList = loadTags()
const items = loadAll(tagList)

for (const w of warnings) console.warn(`⚠ ${w.file} → ${w.field}: ${w.msg}`)

if (errors.length) {
  console.error(`\n✗ הבנייה נכשלה — ${errors.length} שגיאות תוכן:\n`)
  for (const e of errors) console.error(`  ${e.file}\n    → ${e.field}: ${e.msg}`)
  console.error('')
  process.exit(1)
}

const s = emit(items)
console.log(`✓ תוכן תקין — ${s.total} פריטים${s.cut ? `, ${s.cut} פרטיים נחתכו` : ''} · ${s.installed} סקילים מותקנים במחשב`)
