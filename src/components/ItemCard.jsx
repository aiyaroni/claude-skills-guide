import { TYPE_LABELS, TYPE_COLORS, TAG_LABELS, UC_LABELS } from '../data/config.js'
import { Ic } from '../lib/icons.jsx'

const cx = (...a) => a.filter(Boolean).join(' ')

/**
 * כרטיס אחד לכל סוג פריט — מדריך, פרומפט, סקיל, MCP.
 * החליף את SkillCard, שהכיר רק סקילים.
 */
export default function ItemCard({ item, isFav, onFav, onOpen, onCopy }) {
  const color = TYPE_COLORS[item.kind] || '#94a3b8'
  const isCollected = item.install_state === 'collected'
  const unverified = item.security === 'unverified'
  const partial = item.completeness === 'partial'

  // מה שמעתיקים בקליק מהכרטיס: פקודה אם יש, אחרת הפרומפט עצמו
  const quickCopy = item.cmd || (item.kind === 'prompt' ? item.raw?.prompt_text : null)

  return (
    <div className="skill-card" onClick={() => onOpen(item)}>
      <div className="sc-head">
        <span className="sc-cat">
          <span className="dot" style={{ background: color }} />
          {TYPE_LABELS[item.kind] || item.kind}
        </span>
        <button
          className={cx('sc-fav', isFav && 'on')}
          onClick={(e) => { e.stopPropagation(); onFav(item.id) }}
          aria-label={isFav ? 'הסר ממועדפים' : 'הוסף למועדפים'}
        >
          <Ic.star filled={isFav} />
        </button>
      </div>

      <div className={cx('sc-cmd', item.kind === 'mcp' && 'alt')} dir={item.cmd ? 'ltr' : undefined}>
        {item.cmd || item.title}
      </div>
      <div className="sc-desc">{item.desc}</div>

      {(isCollected || unverified || partial) && (
        <div className="sc-flags">
          {isCollected && <span className="flag collected">אספתי, לא התקנתי</span>}
          {unverified && <span className="flag unverified"><span className="dot" />לא נבדק</span>}
          {partial && <span className="flag partial">חלקי</span>}
        </div>
      )}

      <div className="sc-foot">
        <div className="sc-uc">
          {(item.tags || []).slice(0, 3).map(t => <span key={t}>{TAG_LABELS[t] || t}</span>)}
          {(item.uc || []).slice(0, 3).map(u => <span key={u}>{UC_LABELS[u] || u}</span>)}
        </div>
        {quickCopy && (
          <button
            className="sc-copy"
            onClick={(e) => { e.stopPropagation(); onCopy(quickCopy) }}
            aria-label="העתק"
            title="העתק"
          >
            <Ic.copy /> העתק
          </button>
        )}
      </div>
    </div>
  )
}
