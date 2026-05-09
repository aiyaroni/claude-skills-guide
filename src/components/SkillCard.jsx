import { CAT_LABELS, CAT_COLORS, UC_LABELS } from '../data/config.js'
import { Ic } from '../lib/icons.jsx'

const cx = (...args) => args.filter(Boolean).join(' ')

export default function SkillCard({ item, isFav, onFav, onOpen, onCopy }) {
  const cat = item.cat || 'mcp'
  const color = CAT_COLORS[cat] || '#94a3b8'
  const isMcp = item.kind === 'mcp'

  return (
    <div className="skill-card" onClick={() => onOpen(item)}>
      <div className="sc-head">
        <span className="sc-cat">
          <span className="dot" style={{ background: color }}></span>
          {CAT_LABELS[cat] || cat}
        </span>
        <button
          className={cx('sc-fav', isFav && 'on')}
          onClick={(e) => { e.stopPropagation(); onFav(item.cmd) }}
          aria-label="הוסף למועדפים"
        >
          <Ic.star filled={isFav} />
        </button>
      </div>
      <div className={cx('sc-cmd', isMcp && 'alt')}>{item.cmd}</div>
      <div className="sc-desc">{item.desc}</div>
      <div className="sc-foot">
        <div className="sc-uc">
          {(item.uc || []).slice(0, 3).map(u => (
            <span key={u}>{UC_LABELS[u] || u}</span>
          ))}
        </div>
        <button
          className="sc-copy"
          onClick={(e) => { e.stopPropagation(); onCopy(item.cmd) }}
          aria-label="העתק פקודה"
          title="העתק פקודה"
        >
          <Ic.copy /> העתק
        </button>
      </div>
    </div>
  )
}
