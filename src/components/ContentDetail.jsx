import { useEffect } from 'react'
import {
  TYPE_LABELS, TYPE_COLORS, TAG_LABELS,
  INSTALL_STATE_LABELS, SECURITY_LABELS, securityCheckPrompt,
} from '../data/config.js'
import { Ic } from '../lib/icons.jsx'

const NOT_FOUND = 'not-found'
const isNotFound = v => v === NOT_FOUND || (Array.isArray(v) && v[0] === NOT_FOUND)

/** חוסר מוצהר הוא מידע. הוא נראה אחרת ממידע קיים, אבל הוא לא נעלם */
function Field({ label, value, reason }) {
  if (value === undefined || value === null) return null
  if (isNotFound(value)) {
    return (
      <div className="psec">
        <h3>{label}</h3>
        <p className="not-found">לא צוין במקור{reason ? ` — ${reason}` : ''}</p>
      </div>
    )
  }
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

export default function ContentDetail({ item, onClose, onCopy }) {
  const c = item.raw
  const prov = c.provenance || {}
  const reason = f => prov[f]?.from === NOT_FOUND ? prov[f].reason : null

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
      </div>

      <div className="detail-body">
        <div className="detail-main">
          {item.kind === 'prompt' && (
            <div className="psec">
              <h3>הפרומפט</h3>
              <pre className="prompt-block copyable" onClick={() => onCopy(c.prompt_text)} title="לחץ להעתקה">
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

              <Field label="יתרונות"        value={c.pros}      reason={reason('pros')} />
              <Field label="חסרונות"        value={c.cons}      reason={reason('cons')} />
              <Field label="מתי לא להשתמש"  value={c.when_not}  reason={reason('when_not')} />
              <Field label="דרישות מוקדמות" value={c.prereq}    reason={reason('prereq')} />
              <Field label="עלות"           value={c.cost_note} reason={reason('cost_note')} />
              <Field label="מתי זה קופץ"    value={c.triggers}  reason={reason('triggers')} />
            </>
          )}

          {item.kind === 'guide' && <Field label="רמה" value={c.level} reason={reason('level')} />}
          {item.kind === 'prompt' && <>
            <Field label="מתי להשתמש" value={c.use_when} reason={reason('use_when')} />
            <Field label="מודל מומלץ" value={c.model} reason={reason('model')} />
          </>}

          {item.body && (
            <div className="psec body-prose">
              <h3>{item.kind === 'guide' ? 'התוכן' : 'הרחבה'}</h3>
              {item.body.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
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
