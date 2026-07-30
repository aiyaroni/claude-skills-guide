/**
 * prerender.mjs — הופך כל פריט ל-HTML סטטי משלו.
 *
 * בלי זה גוגל מקבל <div id="root"></div> ריק, ו-198 הפריטים לא קיימים
 * מבחינת אף מנוע חיפוש. חשוב לא פחות: בלי כתובת לפריט אי אפשר לשמור
 * סימנייה ולא לשלוח לינק — וזה הכאב שהפרויקט הזה נולד לפתור.
 *
 * רץ אחרי vite build, על dist/.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createServer } from 'vite'
// react-dom/server ו-react-router-dom/server הם מודולים היברידיים.
// טעינה שלהם דרך ssrLoadModule נכשלת ב-ERR_AMBIGUOUS_MODULE_SYNTAX,
// ולכן הם נטענים ישירות. vite נשאר רק למה שדורש טרנספורם JSX
import { renderToString } from 'react-dom/server'
// ב-react-router v7 אין `react-router-dom/server`. StaticRouter יושב ב-react-router
import { StaticRouter } from 'react-router'
import { createElement as h } from 'react'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const SITE = process.env.SITE_URL || 'https://claude-skills-guide.vercel.app'

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('✗ dist/index.html חסר — להריץ vite build קודם')
  process.exit(1)
}

// vite ב-SSR מריץ את קוד המקור כמו שהוא, כולל JSX ו-CSS.
// זה חוסך צינור בנייה שני רק בשביל ה-prerender
const vite = await createServer({
  root: ROOT,
  logLevel: 'error',
  server: { middlewareMode: true },
  appType: 'custom',
})

const { default: AppRoutes } = await vite.ssrLoadModule('/src/routes.jsx')
const { ALL_ITEMS, hrefOf } = await vite.ssrLoadModule('/src/data/items.js')

const shell = readFileSync(join(DIST, 'index.html'), 'utf8')

const esc = s => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')

/** JSON-LD לפי סוג — מה שמנועי חיפוש ומודלים קוראים כדי להבין מה הפריט */
function jsonLd(item, url) {
  const base = { '@context': 'https://schema.org', name: item.title, description: item.desc, url, inLanguage: 'he' }
  if (item.kind === 'skill' || item.kind === 'mcp') {
    return { ...base, '@type': 'SoftwareApplication', applicationCategory: 'DeveloperApplication', operatingSystem: 'macOS, Windows, Linux' }
  }
  if (item.kind === 'guide') return { ...base, '@type': 'HowTo' }
  return { ...base, '@type': 'Article', headline: item.title }
}

function head(item, url) {
  const title = `${item.title} · מרכז הידע`
  const src = item.raw?.source_url
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(item.desc)}">`,
    `<link rel="canonical" href="${esc(url)}">`,
    `<meta property="og:type" content="article">`,
    `<meta property="og:title" content="${esc(title)}">`,
    `<meta property="og:description" content="${esc(item.desc)}">`,
    `<meta property="og:url" content="${esc(url)}">`,
    `<meta property="og:locale" content="he_IL">`,
    `<meta name="twitter:card" content="summary">`,
    src ? `<link rel="alternate" href="${esc(src)}" title="המקור">` : '',
    `<script type="application/ld+json">${JSON.stringify(jsonLd(item, url))}</script>`,
  ].filter(Boolean).join('\n    ')
}

let ok = 0, failed = 0
const written = []

for (const item of ALL_ITEMS) {
  const path = hrefOf(item)
  const url = SITE + path
  try {
    const html = renderToString(h(StaticRouter, { location: path }, h(AppRoutes)))
    const page = shell
      .replace('<title>Claude Skills Guide</title>', head(item, url))
      .replace('<div id="root"></div>', `<div id="root">${html}</div>`)

    const dir = join(DIST, path)
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, 'index.html'), page)
    written.push({ path, item })
    ok++
  } catch (e) {
    console.error(`✗ ${path}: ${e.message}`)
    failed++
  }
}

await vite.close()

writeFileSync(join(DIST, '_prerendered.json'), JSON.stringify(
  written.map(w => ({ path: w.path, id: w.item.id, kind: w.item.kind })), null, 1))

console.log(`✓ prerender — ${ok} עמודים${failed ? `, ${failed} נכשלו` : ''}`)
process.exit(failed ? 1 : 0)
