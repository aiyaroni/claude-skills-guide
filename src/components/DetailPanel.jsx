import { useMemo, useEffect } from 'react'
import { CAT_LABELS, CAT_COLORS } from '../data/config.js'
import { PIPELINES } from '../data/pipelines.js'
import { Ic } from '../lib/icons.jsx'

const MODE_LABELS = {
  inline:   { txt: 'פקודה → ואז הנחייה',     bg: 'var(--accent-soft)' },
  combined: { txt: 'פקודה + הנחייה ביחד',     bg: 'var(--surface2)' },
  auto:     { txt: 'אוטומטי — תאר מה צריך',  bg: 'rgba(179,157,219,0.22)' },
}

export default function DetailPanel({ item, onClose, onOpen, onCopy, onRunPipeline }) {
  const cat = item.cat || 'mcp'
  const color = CAT_COLORS[cat] || '#94a3b8'

  const inPipelines = useMemo(() =>
    PIPELINES.filter(p => (p.skills || []).some(s => s.cmd === item.cmd)).slice(0, 4),
    [item.cmd]
  )

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const detailParas = (item.detail || '').split('\n\n').filter(Boolean)

  return (
    <div className="detail-view">
      <div className="detail-head">
        <div className="crumb">
          <a onClick={onClose} style={{ cursor: 'pointer' }}>← חזרה</a>
          <span style={{ color: 'var(--mute)' }}>·</span>
          <span className="cat">
            <span className="dot" style={{ background: color }}></span>
            {CAT_LABELS[cat] || cat}
          </span>
        </div>
        <h1 className="dh-cmd">{item.cmd}</h1>
        <p className="dh-desc">{item.desc}</p>
        <div className="dh-actions">
          <button className="btn primary big" onClick={() => onCopy(item.cmd)}>
            <Ic.copy /> העתק פקודה
          </button>
          {inPipelines.length > 0 && (
            <button className="btn big" onClick={() => onRunPipeline(inPipelines[0])}>
              <Ic.play /> הרץ ב-{inPipelines[0].name}
            </button>
          )}
        </div>
      </div>

      <div className="detail-body">
        <div className="detail-main">
          {detailParas.length > 0 && (
            <div className="psec">
              <h3>למה זה שווה</h3>
              {detailParas.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}

          {(item.steps || []).length > 0 && (
            <div className="psec">
              <h3>איך משתמשים</h3>
              {(() => {
                const m = MODE_LABELS[item.mode || 'inline']
                return <div className="mode-badge" style={{ background: m.bg }}>{m.txt}</div>
              })()}
              <div className="steps-timeline">
                {item.steps.map((s, i) => (
                  <div key={i} className="tl-step">
                    <span className="num">{i + 1}</span>
                    <div className="lab">{s.t}</div>
                    {s.c && (
                      <div className="code" onClick={() => onCopy(s.c)} title="לחץ להעתקה" style={{ cursor: 'pointer' }}>
                        <span>{s.c}</span>
                        <Ic.copy />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {item.usage && (
            <div className="psec">
              <h3>תחביר</h3>
              <div
                className="code"
                onClick={() => onCopy(item.usage)}
                style={{
                  fontFamily: "'JetBrains Mono',monospace", fontSize: 13,
                  background: 'var(--surface2)', border: '1px solid var(--line)',
                  borderRadius: 8, padding: '10px 12px', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8
                }}
              >
                <span>{item.usage}</span>
                <Ic.copy />
              </div>
            </div>
          )}

          {(item.triggers || []).length > 0 && (
            <div className="psec">
              <h3>מתי זה קופץ</h3>
              <div style={{ marginRight: -6 }}>
                {item.triggers.map((t, i) => (
                  <span key={i} className="trigger-tag">{t}</span>
                ))}
              </div>
            </div>
          )}

          {inPipelines.length > 0 && (
            <div className="psec">
              <h3>חלק מהפייפליינים</h3>
              {inPipelines.map(p => (
                <div key={p.id} className="next-card" onClick={() => onRunPipeline(p)} style={{ cursor: 'pointer' }}>
                  <div className="nc-top">
                    <span className="lab">{p.name}</span>
                  </div>
                  <div className="hint">{p.desc}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
