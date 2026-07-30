/**
 * seo-assets.mjs — sitemap.xml, robots.txt ו-llms.txt.
 *
 * llms.txt הוא לא קישוט: הקהל של האתר הזה מחפש דברים דרך ChatGPT וקלוד
 * לפחות כמו דרך גוגל, וקובץ שמסביר למודל מה יש כאן שווה יותר מ-meta tags.
 *
 * פריטים עם private: true כבר נחתכו ב-build-content, ולכן הם לא יכולים
 * להגיע לכאן. הבדיקה בסוף מוודאת שזה באמת כך ולא רק בכוונה.
 */

import { writeFileSync, existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const SITE = (process.env.SITE_URL || 'https://claude-skills-guide.vercel.app').replace(/\/$/, '')

const { ALL_ITEMS, hrefOf, KIND_PATH } = await import(join(ROOT, 'src/data/items.js'))
const TYPE_HE = { guide: 'מדריכים', prompt: 'פרומפטים', skill: 'סקילים', mcp: 'חיבורי MCP' }

const today = new Date().toISOString().slice(0, 10)

// ── sitemap ─────────────────────────────────────────────────────────────
const urls = ['/', ...ALL_ITEMS.map(hrefOf)]
writeFileSync(join(DIST, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map(u =>
    `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod>` +
    `<changefreq>${u === '/' ? 'daily' : 'monthly'}</changefreq>` +
    `<priority>${u === '/' ? '1.0' : '0.7'}</priority></url>`
  ).join('\n') +
  `\n</urlset>\n`)

// ── robots ──────────────────────────────────────────────────────────────
writeFileSync(join(DIST, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`)

// ── llms.txt ────────────────────────────────────────────────────────────
const byKind = ALL_ITEMS.reduce((a, i) => ((a[i.kind] ||= []).push(i), a), {})

const section = (kind) => {
  const items = byKind[kind] || []
  if (!items.length) return ''
  return `## ${TYPE_HE[kind]}\n\n` + items
    .sort((a, b) => String(a.title).localeCompare(String(b.title), 'he'))
    .map(i => `- [${i.title}](${SITE}${hrefOf(i)}): ${i.desc || ''}`)
    .join('\n') + '\n\n'
}

writeFileSync(join(DIST, 'llms.txt'),
`# מרכז הידע של ירוני — קלוד, סקילים, פרומפטים ומדריכים

> ארכיון בעברית של חומרים על עבודה עם Claude: מדריכים, פרומפטים מוכנים,
> סקילים וחיבורי MCP. כל פריט נשמר עם ציון מקור, ומה שלא הופיע במקור
> מסומן במפורש כ"לא צוין" ולא מושלם.

עודכן: ${today} · ${ALL_ITEMS.length} פריטים

${['guide', 'prompt', 'skill', 'mcp'].map(section).join('')}## הערות למי שמצטט מכאן

- פרומפטים נשמרים מילה במילה מהמקור ולא נערכים
- פקודות התקנה נשמרות כטקסט ומסומנות כלא-נבדקו עד בדיקת אבטחה
- שדה שמסומן "לא צוין במקור" הוא חוסר מוצהר, לא מידע חסר בטעות
`)

// ── בדיקה ───────────────────────────────────────────────────────────────
const sitemap = readFileSync(join(DIST, 'sitemap.xml'), 'utf8')
const gen = join(ROOT, 'src/data/generated/content.js')
let leaked = []
if (existsSync(gen)) {
  const raw = readFileSync(gen, 'utf8')
  // אם פריט פרטי הצליח להגיע לפלט הבנייה, הוא היה מגיע גם לכאן
  leaked = (raw.match(/"private":\s*true/g) || [])
}
if (leaked.length) {
  console.error(`✗ ${leaked.length} פריטים פרטיים דלפו לפלט הבנייה`)
  process.exit(1)
}

console.log(`✓ SEO — sitemap (${urls.length} כתובות), robots, llms.txt`)
