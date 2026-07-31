import { useEffect, Fragment } from 'react'
import {
  TYPE_LABELS, TYPE_COLORS, TAG_LABELS,
  INSTALL_STATE_LABELS, SECURITY_LABELS, securityCheckPrompt,
} from '../data/config.js'
import { ALL_ITEMS, hrefOf, seriesPositionLabel } from '../data/items.js'
import { splitBlocks, autoLink } from '../lib/markdown.js'
import { Ic } from '../lib/icons.jsx'
import ValueHeader from './ValueHeader.jsx'

const NOT_FOUND = 'not-found'
const isNotFound = v => v === NOT_FOUND || (Array.isArray(v) && v[0] === NOT_FOUND)

/**
 * חוסר מוצהר נשאר בדאטה (provenance.reason) אבל לא בתצוגה הציבורית —
 * הנימוק הפנימי של הסוכן ("המדריך לא מציין רמה") הוא ראיה לאימות, לא
 * מידע לקורא. רואים אותו רק בדשבורד המקומי. ראה docs/PLAN.md.
 */
function Field({ label, value }) {
  if (value === undefined || value === null || isNotFound(value)) return null
  const list = [].concat(value)
  return (
    <div className="psec">
      <h3>{label}</h3>
      {list.length > 1
        ? <ul className="field-list">{list.map((v, i) => <li key={i}>{v}</li>)}</ul>
        : <p>{list[0]}</p>}
    </div>
  )
}

function Code({ text, onCopy }) {
  return (
    <div className="code copyable" dir="ltr" onClick={() => onCopy(text)} title="לחץ להעתקה">
      <span>{text}</span>
      <Ic.copy />
    </div>
  )
}

/** `**טקסט**` → הדגשה. רק על מחרוזות רגילות, לא על טקסט קישור */
function renderBold(text, keyPrefix) {
  const segs = text.split(/\*\*(.+?)\*\*/g)
  return segs.map((s, i) => (i % 2 === 1 ? <strong key={`${keyPrefix}-${i}`}>{s}</strong> : s))
}

/** מרנדר מקטע autoLink (מערך של מחרוזות ו-{href,text}) לרכיבי React */
function Linked({ parts }) {
  return parts.map((p, i) =>
    typeof p === 'string'
      ? <Fragment key={i}>{renderBold(p, `bd${i}`)}</Fragment>
      : <a key={i} href={p.href}>{p.text}</a>
  )
}

/**
 * שורה בודדת בתוך בלוק פסקה. מזהה רשימה ממוספרת ("1. ") ורשימת מקפים/נקודות
 * ("- "/"* ") ומקבצת שורות עוקבות מאותו סוג לרשימה אחת — בדיוק התקלה
 * שתוקנה ב-DetailPanel, רק כאן על markdown אמיתי במקום פורמט legacy.
 */
function renderParagraphBlock(text, linkCtx, keyPrefix) {
  const lines = text.split('\n').filter(l => l.trim() !== '')
  const out = []
  let i = 0
  while (i < lines.length) {
    const numbered = /^\d+\.\s+/.exec(lines[i])
    const bulleted = /^[-*]\s+/.exec(lines[i])
    if (numbered) {
      const items = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''))
        i++
      }
      out.push(
        <ol key={`${keyPrefix}-${out.length}`}>
          {items.map((t, j) => <li key={j}><Linked parts={autoLink(t, linkCtx)} /></li>)}
        </ol>
      )
    } else if (bulleted) {
      const items = []
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ''))
        i++
      }
      out.push(
        <ul key={`${keyPrefix}-${out.length}`}>
          {items.map((t, j) => <li key={j}><Linked parts={autoLink(t, linkCtx)} /></li>)}
        </ul>
      )
    } else {
      out.push(<p key={`${keyPrefix}-${out.length}`}><Linked parts={autoLink(lines[i], linkCtx)} /></p>)
      i++
    }
  }
  return out
}

/**
 * הגוף כולו: כותרות ## מקבלות עוגן (תואם ל-TOC ב-ValueHeader), כותרות
 * ### מוצגות בלי עוגן (לא ב-TOC, ראה תוכנית), כל blockquote מקבל כפתור
 * העתקה בלי אבחנה בין פרומפט לציטוט רגיל, ואזכורים בין פריטים הופכים לקישור.
 */
function Body({ item, onCopy }) {
  const blocks = splitBlocks(item.body)
  const linkCtx = { items: ALL_ITEMS, currentItem: item, hrefOf }

  const slugify = (text) =>
    text.trim().replace(/[`*_]/g, '').replace(/\s+/g, '-').replace(/[^א-ת0-9A-Za-z-]/g, '')

  return (
    <>
      {blocks.map((b, i) => {
        if (b.type === 'heading' && b.level === 2) {
          return <h2 key={i} id={slugify(b.text)}>{b.text}</h2>
        }
        if (b.type === 'heading') {
          const Tag = `h${Math.min(b.level, 6)}`
          return <Tag key={i}>{b.text}</Tag>
        }
        if (b.type === 'quote') {
          return (
            <pre key={i} className="prompt-block copyable" dir="auto" onClick={() => onCopy(b.text)} title="לחץ להעתקה">
              {b.text}
            </pre>
          )
        }
        return <Fragment key={i}>{renderParagraphBlock(b.text, linkCtx, `b${i}`)}</Fragment>
      })}
    </>
  )
}

export default function ContentDetail({ item, onClose, onCopy }) {
  const c = item.raw

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="detail-view">
      <div className="detail-head">
        <div className="crumb">
          <a onClick={onClose} style={{ cursor: 'pointer' }}>← חזרה</a>
          <span style={{ color: 'var(--mute)' }}>·</span>
          <span className="cat">
            <span className="dot" style={{ background: TYPE_COLORS[item.kind] }} />
            {TYPE_LABELS[item.kind]}
          </span>
          {item.kind === 'skill' && (
            <>
              <span style={{ color: 'var(--mute)' }}>·</span>
              <span className={`state ${item.install_state}`}>
                {INSTALL_STATE_LABELS[item.install_state]}
              </span>
            </>
          )}
        </div>

        <h1 className="dh-cmd">{c.title}</h1>
        <p className="dh-desc">{c.summary}</p>

        {c.completeness === 'partial' && (
          <div className="banner partial">
            חילוץ חלקי — {c.extraction_notes}
          </div>
        )}

        <div className="dh-actions">
          {item.kind === 'prompt' && (
            <button className="btn primary big" onClick={() => onCopy(c.prompt_text)}>
              <Ic.copy /> העתק פרומפט
            </button>
          )}
          {item.kind === 'skill' && c.cmd && (
            <button className="btn primary big" onClick={() => onCopy(c.cmd)}>
              <Ic.copy /> העתק פקודה
            </button>
          )}
          {c.source_url && (
            <a className="btn big" href={c.source_url} target="_blank" rel="noopener noreferrer">
              המקור ↗
            </a>
          )}
        </div>

        <ValueHeader body={item.body} seriesPosition={seriesPositionLabel(item)} />
      </div>

      <div className="detail-body">
        <div className="detail-main">
          {item.kind === 'prompt' && (
            <div className="psec">
              <h3>הפרומפט</h3>
              <pre className="prompt-block copyable" dir="auto" onClick={() => onCopy(c.prompt_text)} title="לחץ להעתקה">
                {c.prompt_text}
              </pre>
              <p className="hint-line">נשמר מילה במילה מהמקור. לא נערך ולא שופר</p>
            </div>
          )}

          {item.kind === 'skill' && (
            <>
              <div className="psec">
                <h3>התקנה</h3>
                {isNotFound(c.install_cmd)
                  ? <p className="not-found">לא צוינה פקודת התקנה במקור</p>
                  : <>
                      <Code text={c.install_cmd} onCopy={onCopy} />
                      <div className={`security-row ${c.security}`}>
                        <span className="dot" />
                        <span>אבטחה: {SECURITY_LABELS[c.security] || c.security}</span>
                        {c.security === 'unverified' && (
                          <button className="btn small" onClick={() => onCopy(securityCheckPrompt(item))}>
                            העתק בקשת security-check
                          </button>
                        )}
                      </div>
                      <p className="hint-line">
                        הפקודה נשמרה כטקסט. הפייפליין לא מריץ התקנות — הבדיקה וההתקנה שלך
                      </p>
                    </>}
              </div>

              <Field label="יתרונות"        value={c.pros} />
              <Field label="חסרונות"        value={c.cons} />
              <Field label="מתי לא להשתמש"  value={c.when_not} />
              <Field label="דרישות מוקדמות" value={c.prereq} />
              <Field label="עלות"           value={c.cost_note} />
              <Field label="מתי זה קופץ"    value={c.triggers} />
            </>
          )}

          {item.kind === 'guide' && <Field label="רמה" value={c.level} />}
          {item.kind === 'prompt' && <>
            <Field label="מתי להשתמש" value={c.use_when} />
            <Field label="מודל מומלץ" value={c.model} />
          </>}

          {item.body && (
            <div className="psec body-prose">
              <Body item={item} onCopy={onCopy} />
            </div>
          )}

          <div className="psec meta-sec">
            <h3>מקור</h3>
            <dl className="meta">
              {c.source_name && <><dt>נאסף מ</dt><dd>{c.source_name}</dd></>}
              {c.source_date && <><dt>תאריך החומר</dt><dd>{c.source_date}</dd></>}
              <dt>נקלט לארכיון</dt><dd>{c.ingested_at}</dd>
              {(c.tags || []).length > 0 && <>
                <dt>תגיות</dt>
                <dd>{c.tags.map(t => TAG_LABELS[t] || t).join(' · ')}</dd>
              </>}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
