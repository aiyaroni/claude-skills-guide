import { useState, useMemo } from 'react'
import { extractHeadings, countQuoteBlocks } from '../lib/markdown.js'

/**
 * שורת ערך מעל התוכן — מה יש כאן, לפני שקוראים.
 * הכל מחושב מהטקסט עצמו (ראה markdown.js). אפס תלות במודל, אפס סיכון להמצאה.
 * אין זמן קריאה ואין מספר סעיפים נפרד — הוסרו במפורש, ראה docs/PLAN.md.
 */
export default function ValueHeader({ body, seriesPosition }) {
  const [expanded, setExpanded] = useState(false)
  const headings = useMemo(() => extractHeadings(body), [body])
  const quoteCount = useMemo(() => countQuoteBlocks(body), [body])

  if (!headings.length && !quoteCount) return null

  const visible = expanded ? headings : headings.slice(0, 5)
  const hasMore = headings.length > 5

  return (
    <div className="value-header">
      {seriesPosition && (
        // אין מכנה כולל ("מתוך N") — אין series_total בסכמה, ואין מקור אמת
        // שני לגודל הסדרה. ראה docs/PLAN.md, החלטת "מסלול צומח אורגני"
        <div className="vh-series">{seriesPosition}</div>
      )}

      {quoteCount > 0 && (
        <div className="vh-stat">
          <bdi>{quoteCount}</bdi> {quoteCount === 1 ? 'פרומפט להעתקה' : 'פרומפטים להעתקה'}
        </div>
      )}

      {headings.length > 0 && (
        <div className="vh-toc">
          <div className="vh-toc-head">
            <span>מה יש כאן</span>
            {hasMore && (
              <button className="vh-toc-toggle" onClick={() => setExpanded(e => !e)}>
                {expanded ? 'הסתר' : 'הצג הכל'} {expanded ? '▴' : '▾'}
              </button>
            )}
          </div>
          <ul>
            {visible.map(h => (
              <li key={h.slug}><a href={`#${h.slug}`}>{h.text}</a></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
