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
