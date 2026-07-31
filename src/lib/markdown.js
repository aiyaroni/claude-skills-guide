/**
 * markdown.js — עיבוד מכני של גוף markdown, בלי ספריית markdown חיצונית.
 *
 * שלושה דברים, כולם מחושבים מהטקסט עצמו — אפס תלות במודל, אפס סיכון להמצאה:
 *   1. תוכן עניינים מכותרות ## בלבד (לא ###, כמוגדר בתוכנית)
 *   2. ספירת בלוקי ציטוט (blockquote) — כל אחד נספר, בלי סינון "האם זה פרומפט"
 *   3. רינדור הגוף לרכיבי React: כותרות עם עוגן, בלוקים עם כפתור העתקה,
 *      וקישור אוטומטי בין פריטים (ראה autoLink)
 */

const isWordChar = (ch) => !!ch && /[A-Za-z0-9א-ת]/.test(ch)

const slugify = (text) =>
  text.trim()
    .replace(/[`*_]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^א-ת0-9A-Za-z-]/g, '')

/** רשימת כותרות H2 בלבד, לפי הסדר שהן מופיעות בגוף */
export function extractHeadings(body) {
  const out = []
  for (const line of (body || '').split('\n')) {
    const m = /^##\s+(.+?)\s*$/.exec(line)
    if (m) out.push({ text: m[1], slug: slugify(m[1]) })
  }
  return out
}

/**
 * מפרק את הגוף לבלוקים: פסקה / כותרת (# עד ###) / בלוק ציטוט (> רצוף).
 * זו היחידה הבסיסית גם לרינדור וגם לספירה — כדי ששני הדברים יראו אותו דבר.
 */
function splitBlocks(body) {
  const lines = (body || '').split('\n')
  const blocks = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (/^#{1,6}\s+/.test(line)) {
      const level = line.match(/^(#{1,6})/)[1].length
      blocks.push({ type: 'heading', level, text: line.replace(/^#{1,6}\s+/, '').trim() })
      i++
    } else if (/^>\s?/.test(line)) {
      const quoted = []
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoted.push(lines[i].replace(/^>\s?/, ''))
        i++
      }
      blocks.push({ type: 'quote', text: quoted.join('\n').trim() })
    } else if (line.trim() === '') {
      i++
    } else {
      const para = []
      while (i < lines.length && lines[i].trim() !== '' && !/^#{1,6}\s+/.test(lines[i]) && !/^>\s?/.test(lines[i])) {
        para.push(lines[i])
        i++
      }
      blocks.push({ type: 'p', text: para.join('\n').trim() })
    }
  }
  return blocks
}

/** מספר בלוקי הציטוט בגוף — כל blockquote נספר, בלי אבחנה בין פרומפט לציטוט רגיל */
export function countQuoteBlocks(body) {
  return splitBlocks(body).filter(b => b.type === 'quote').length
}

/**
 * קישור אוטומטי בין פריטים בתוך פסקת טקסט חופשי. שני דפוסים בלבד:
 *   1. "מדריך N" / "מדריכים N, M ו-K" → order בתוך אותה part_of
 *   2. התאמה מדויקת ומלאה של title פריט אחר, בגבול מילה/ביטוי
 * מחזיר מערך של מחרוזות ו-{href, text} — לא JSX, כדי שהקובץ יישאר טהור וניתן לבדיקה.
 */
export function autoLink(text, { items, currentItem, hrefOf }) {
  const parts = [{ text }]

  // דפוס 1: "מדריך/מדריכים" + רצף מספרים/מחברים, מוגבל לאותה סדרה
  const seriesItems = currentItem?.raw?.part_of
    ? items.filter(i => i.raw?.part_of === currentItem.raw.part_of && i.raw?.order != null)
    : []
  const byOrder = new Map(seriesItems.map(i => [i.raw.order, i]))

  function linkGuideNumbers(str) {
    const out = []
    let last = 0
    // "מדריך" מסתיים בכ' סופית (ך, U+05DA) — אות יוניקוד שונה מכ' רגילה (כ, U+05DB)
    // שבה משתמשים "מדריכים"/"מדריכי". מחלקת תווים [כך] מכסה את שתיהן
    const spanRe = /מדרי[כך](?:ים|י)?\s+((?:\d+\s*[-–,ו]?\s*)+)/g
    let m
    while ((m = spanRe.exec(str))) {
      const spanStart = m.index
      const spanText = m[0]
      out.push(str.slice(last, spanStart))
      const numRe = /\d+/g
      let ni, nLast = 0
      const pieces = []
      while ((ni = numRe.exec(spanText))) {
        const n = Number(ni[0])
        pieces.push(spanText.slice(nLast, ni.index))
        const target = byOrder.get(n)
        if (target && target.id !== currentItem?.id) pieces.push({ href: hrefOf(target), text: ni[0] })
        else pieces.push(ni[0])
        nLast = ni.index + ni[0].length
      }
      pieces.push(spanText.slice(nLast))
      out.push(...pieces)
      last = spanStart + spanText.length
    }
    out.push(str.slice(last))
    return out
  }

  // דפוס 2: התאמה מדויקת של title, בגבול מילה/ביטוי, לא מקשר לעצמו
  function linkTitles(chunks) {
    const candidates = items
      .filter(i => i.id !== currentItem?.id && i.title && i.title.length >= 3)
      .sort((a, b) => b.title.length - a.title.length) // ארוך קודם, כדי לא לתפוס תת-ביטוי של ביטוי ארוך יותר

    const result = []
    for (const chunk of chunks) {
      if (typeof chunk !== 'string' || !chunk) { if (chunk) result.push(chunk); continue }
      let str = chunk
      let cursor = 0
      const pieces = []
      outer: while (cursor < str.length) {
        for (const cand of candidates) {
          const idx = str.indexOf(cand.title, cursor)
          if (idx === -1) continue
          const before = str[idx - 1]
          const after = str[idx + cand.title.length]
          if (isWordChar(before) || isWordChar(after)) continue
          // ודא שזו ההתאמה הכי מוקדמת מבין המועמדים בסיבוב הזה
          let earliest = idx
          let winner = cand
          for (const other of candidates) {
            const oi = str.indexOf(other.title, cursor)
            if (oi !== -1 && oi < earliest) {
              const ob = str[oi - 1], oa = str[oi + other.title.length]
              if (!isWordChar(ob) && !isWordChar(oa)) { earliest = oi; winner = other }
            }
          }
          if (earliest > cursor) pieces.push(str.slice(cursor, earliest))
          pieces.push({ href: hrefOf(winner), text: winner.title })
          cursor = earliest + winner.title.length
          continue outer
        }
        break
      }
      pieces.push(str.slice(cursor))
      result.push(...pieces.filter(p => p !== ''))
    }
    return result
  }

  const afterGuides = linkGuideNumbers(text)
  return linkTitles(afterGuides)
}

export { splitBlocks }
