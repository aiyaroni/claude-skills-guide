/**
 * items.js — מקור אחד לכל הפריטים באתר.
 *
 * שני מקורות נתונים חיים כרגע במקביל:
 *   1. הקטלוג הישן  — skills.js / mcp.js, מגונרט פעם אחת מ-HTML
 *   2. הארכיון החדש — content/*.md דרך build-content.mjs
 *
 * שניהם מנורמלים כאן לצורה אחת, כדי שהקומפוננטות לא יכירו שני מודלים.
 * בשלב 9 המקור הישן ייעלם והקובץ הזה יישאר כמו שהוא.
 */

import { SKILLS } from './skills.js'
import { MCP_SKILLS } from './mcp.js'
import { CONTENT } from './generated/content.js'
import { TASKS } from './config.js'

/** הקטלוג הישן — id הוא ה-cmd, כדי שמועדפים שמורים לא יאבדו */
const fromLegacy = (s, kind) => ({
  id: s.cmd,
  kind,
  title: s.cmd,
  desc: s.desc,
  body: s.detail || '',
  cmd: s.cmd,
  cat: s.cat || 'mcp',
  uc: s.uc || [],
  tags: [],
  triggers: s.triggers || [],
  install_state: 'installed',
  security: null,
  completeness: 'full',
  origin: 'legacy',
  raw: s,
})

const fromContent = (c) => ({
  id: c.id,
  kind: c.type,
  title: c.title,
  desc: c.summary,
  body: c.body || '',
  cmd: c.cmd || null,
  cat: c.type === 'skill' ? 'plugins' : c.type,
  uc: [],
  tags: c.tags || [],
  triggers: Array.isArray(c.triggers) ? c.triggers : [],
  install_state: c.install_state || 'reference',
  security: c.security || null,
  completeness: c.completeness || 'full',
  origin: 'content',
  raw: c,
})

/** פריט מהארכיון גובר על רשומה ישנה עם אותו מזהה — הארכיון הוא היעד */
function merge(legacy, content) {
  const byId = new Map(legacy.map(i => [i.id, i]))
  for (const c of content) byId.set(c.id, c)
  return [...byId.values()]
}

export const ALL_ITEMS = merge(
  [...SKILLS.map(s => fromLegacy(s, 'skill')), ...MCP_SKILLS.map(m => fromLegacy(m, 'mcp'))],
  CONTENT.map(fromContent),
)

export const KINDS = ['guide', 'prompt', 'skill', 'mcp']

/** ה-URL ברבים, המודל ביחיד */
export const KIND_PATH = { guide: 'guides', prompt: 'prompts', skill: 'skills', mcp: 'mcp' }
export const PATH_KIND = Object.fromEntries(Object.entries(KIND_PATH).map(([k, v]) => [v, k]))

/** מזהה בכתובת — cmd של סקיל מכיל / ו-: שלא עוברים ב-URL */
export const slugOf = (item) =>
  String(item.id).replace(/^\//, '').replace(/[:/]/g, '-').replace(/\s+/g, '-')

export const hrefOf = (item) => `/${KIND_PATH[item.kind] || item.kind}/${slugOf(item)}`

export const findBySlug = (kindPath, slug) => {
  const kind = PATH_KIND[kindPath]
  return ALL_ITEMS.find(i => i.kind === kind && slugOf(i) === slug) || null
}

export const countBy = (items, key) =>
  items.reduce((acc, i) => {
    for (const v of [].concat(i[key] ?? [])) acc[v] = (acc[v] || 0) + 1
    return acc
  }, {})

// ── שערי משימה ──────────────────────────────────────────────────────────

/** פריט שמתאים לכמה שערים מופיע בכולם — לא סיווג בלעדי. ראה docs/PLAN.md */
export function byTask(taskKey, items = ALL_ITEMS) {
  const spec = TASKS[taskKey]
  if (!spec) return []
  return items.filter(i =>
    (spec.uc || []).some(u => (i.uc || []).includes(u)) ||
    (spec.tags || []).some(t => (i.tags || []).includes(t)) ||
    (spec.state && i.install_state === spec.state)
  )
}

export function taskCounts(items = ALL_ITEMS) {
  const out = {}
  for (const key of Object.keys(TASKS)) out[key] = byTask(key, items).length
  return out
}

// ── מסלולי לימוד ────────────────────────────────────────────────────────

const partOf = (item) => item?.raw?.part_of ?? null
const orderOf = (item) => item?.raw?.order ?? null

/**
 * קבוצות part_of עם לפחות 2 פריטים ו-order לא-null (סף מהתוכנית — שאלה 8).
 * מציג רק מה שכבר נקלט, בלי placeholder rows למה שטרם נקלט (שאלה 1) —
 * גדל אוטומטית כשעוד פריטים מאותה סדרה נכנסים לארכיון.
 */
export function tracks(items = ALL_ITEMS) {
  const groups = new Map()
  for (const i of items) {
    const p = partOf(i)
    if (!p || orderOf(i) == null) continue
    if (!groups.has(p)) groups.set(p, [])
    groups.get(p).push(i)
  }
  return [...groups.entries()]
    .map(([part_of, list]) => ({ part_of, items: list.slice().sort((a, b) => orderOf(a) - orderOf(b)) }))
    .filter(t => t.items.length >= 2)
}

/** "מדריך 2 · האקדמיה של טל" — בלי "מתוך N", ראה הערה ב-ValueHeader.jsx */
export function seriesPositionLabel(item) {
  const o = orderOf(item)
  const p = partOf(item)
  if (o == null || !p) return null
  return `מדריך ${o} · ${p}`
}

// ── נקלט לאחרונה ────────────────────────────────────────────────────────

/** חלון 7 ימים, נעלם אם ריק — ראה docs/PLAN.md, שאלה 6 */
export function recentlyIngested(items = ALL_ITEMS, days = 7) {
  const cutoff = Date.now() - days * 86400000
  return items
    .filter(i => i.origin === 'content' && i.raw?.ingested_at)
    .filter(i => new Date(i.raw.ingested_at).getTime() >= cutoff)
    .sort((a, b) => new Date(b.raw.ingested_at) - new Date(a.raw.ingested_at))
}
