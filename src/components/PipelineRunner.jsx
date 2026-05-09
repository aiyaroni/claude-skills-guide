import { useState, useMemo, useEffect } from 'react'
import { CAT_LABELS, CAT_COLORS, PIPELINE_GROUPS } from '../data/config.js'
import { Ic } from '../lib/icons.jsx'

const cx = (...args) => args.filter(Boolean).join(' ')

function MiniPanel({ item, onClose, onCopy }) {
  const cat = item.cat || 'mcp'
  const color = CAT_COLORS[cat] || '#94a3b8'
  const detailParas = (item.detail || '').split('\n\n').filter(Boolean)

  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <>
      <div className="mini-panel-back" onClick={onClose} />
      <div className="mini-panel">
        <div className="mini-panel-head">
          <div className="top">
            <span className="sc-cat">
              <span className="dot" style={{ background: color }}></span>
              {CAT_LABELS[cat] || cat}
            </span>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--mute)', padding: 6, borderRadius: 8, display: 'flex' }}>
              <Ic.x />
            </button>
          </div>
          <div style={{
            background: cat === 'mcp' ? 'var(--fuchsia)' : 'var(--ink2)',
            color: cat === 'mcp' ? '#fff' : 'var(--surface)',
            padding: '5px 12px', borderRadius: 7, display: 'inline-block',
            fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 18,
            wordBreak: 'break-all', lineHeight: 1.25, marginTop: 8
          }}>
            {item.cmd}
          </div>
          <div style={{ fontSize: 14, color: 'var(--mute)', lineHeight: 1.55, marginTop: 10 }}>{item.desc}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn primary" onClick={() => onCopy(item.cmd)}>
              <Ic.copy /> העתק פקודה
            </button>
          </div>
        </div>
        <div className="mini-panel-body">
          {detailParas.length > 0 && (
            <div className="psec">
              <h3>למה זה שווה</h3>
              {detailParas.map((p, i) => <p key={i}>{p}</p>)}
            </div>
          )}
          {(item.steps || []).length > 0 && (
            <div className="psec">
              <h3>איך משתמשים</h3>
              <div className="steps-timeline">
                {item.steps.map((s, i) => (
                  <div key={i} className="tl-step">
                    <span className="num">{i + 1}</span>
                    <div className="lab">{s.t}</div>
                    {s.c && (
                      <div className="code" onClick={() => onCopy(s.c)} style={{ cursor: 'pointer' }}>
                        <span>{s.c}</span><Ic.copy />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default function PipelineRunner({ pipeline, onClose, onCopy, allItems }) {
  const [miniSkill, setMiniSkill] = useState(null)

  const flatSteps = useMemo(() => (pipeline.skills || []).map((s, i) => ({ ...s, idx: i })), [pipeline])

  const storKey = 'ysk:pipe:' + pipeline.id
  const [done, setDone] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storKey)) || [] } catch { return [] }
  })
  const [cur, setCur] = useState(() => {
    const d = (() => { try { return JSON.parse(localStorage.getItem(storKey)) || [] } catch { return [] } })()
    for (let i = 0; i < (pipeline.skills || []).length; i++) if (!d.includes(i)) return i
    return 0
  })

  const markDone = (i) => {
    const next = done.includes(i) ? done.filter(x => x !== i) : [...done, i]
    setDone(next)
    localStorage.setItem(storKey, JSON.stringify(next))
    if (!done.includes(i) && i < flatSteps.length - 1) setCur(i + 1)
  }

  const reset = () => { setDone([]); setCur(0); localStorage.removeItem(storKey) }

  const progress = flatSteps.length ? Math.round((done.length / flatSteps.length) * 100) : 0
  const allDone = done.length === flatSteps.length && flatSteps.length > 0

  const findSkill = (cmd) => (allItems || []).find(it => it.cmd === cmd)

  return (
    <div className="runner">
      <div className="runner-head">
        <div className="runner-crumb">
          <button className="rback" onClick={onClose}>← חזרה</button>
          <span className="sep">·</span>
          <span className="grp">{PIPELINE_GROUPS[pipeline.group]?.label}</span>
          <div className="rhead-actions">
            <button className="rbtn-ghost" onClick={reset} title="אפס">↺ אפס</button>
          </div>
        </div>

        <div className="runner-title-row">
          <div className="runner-name">{pipeline.name}</div>
          <div className="runner-pill">{done.length} / {flatSteps.length} שלבים</div>
        </div>
        <div className="runner-tagline">{pipeline.desc}</div>

        <div className="rp-track">
          <div className="rp-bar">
            <div className="rp-fill" style={{ width: progress + '%' }} />
          </div>
          <div className="rp-steps">
            {flatSteps.map((s, i) => (
              <div
                key={i}
                className={cx('rp-dot', done.includes(i) && 'done', cur === i && 'cur')}
                onClick={() => setCur(i)}
                title={s.stepLabel || s.cmd}
              >
                {done.includes(i) ? <Ic.check /> : (i + 1)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="runner-steps">
        {flatSteps.map((s, i) => {
          const skill = findSkill(s.cmd)
          const isCur = cur === i
          const isDone = done.includes(i)
          const isNext = !isDone && !isCur && done.length === i

          return (
            <div
              key={i}
              id={'step-' + pipeline.id + '-' + i}
              className={cx('rsc', isCur && 'cur', isDone && 'done', isNext && 'next')}
            >
              <div className="rsc-head" onClick={() => !isDone && setCur(isCur ? -1 : i)}>
                <div className={cx('rsc-num', isCur && 'cur', isDone && 'done')}>
                  {isDone ? <Ic.check /> : (i + 1)}
                </div>
                <div className="rsc-info">
                  <div className="rsc-step-label">שלב {i + 1}</div>
                  <div className="rsc-name">{s.stepLabel || s.cmd}</div>
                  {!isCur && <div className="rsc-cmd-hint">{s.cmd}</div>}
                </div>
                <div className="rsc-actions" onClick={e => e.stopPropagation()}>
                  {!isDone && (
                    <button className="rsc-copy-btn" onClick={() => onCopy(s.cmd)}>
                      <Ic.copy /> העתק
                    </button>
                  )}
                  <button
                    className={cx('rsc-done-btn', isDone && 'undone')}
                    onClick={() => markDone(i)}
                  >
                    {isDone ? '↺ בטל' : <><Ic.check /> בוצע</>}
                  </button>
                </div>
              </div>

              {isCur && (
                <div className="rsc-body">
                  {s.context ? (
                    <div className="rsc-context">
                      {s.context.short && <div className="ctx-row primary"><span className="ctx-ic">»</span><span><strong>הפקודה:</strong> {s.context.short}</span></div>}
                      {s.context.what && <div className="ctx-row"><span className="ctx-ic">?</span><span><strong>מה זה עושה:</strong> {s.context.what}</span></div>}
                      {s.context.howto && <div className="ctx-row"><span className="ctx-ic">›</span><span><strong>איך:</strong> {s.context.howto}</span></div>}
                      {s.context.expect && <div className="ctx-row"><span className="ctx-ic">✓</span><span><strong>מה לצפות:</strong> {s.context.expect}</span></div>}
                    </div>
                  ) : skill?.detail ? (
                    <div className="rsc-context">
                      <div className="ctx-row"><span className="ctx-ic">?</span><span>{skill.detail.split('\n\n')[0]}</span></div>
                    </div>
                  ) : (
                    <div className="rsc-context">
                      <div className="ctx-row"><span className="ctx-ic">›</span><span>העתק את הפקודה והרץ ב-Claude. כשתסיים — לחץ בוצע.</span></div>
                    </div>
                  )}

                  <div className="rsc-cmd-block" onClick={() => onCopy(s.cmd)}>
                    <span className="rcb-label">פקודה</span>
                    <span className="rcb-cmd">{s.cmd}</span>
                    <Ic.copy />
                  </div>

                  {skill && (
                    <button className="rsc-more-btn" onClick={() => setMiniSkill(skill)}>
                      <Ic.cmd /> פרטים על {s.cmd} ←
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {allDone && (
          <div className="runner-done-card">
            <div className="rdc-mark">✓</div>
            <div className="rdc-title">{pipeline.name} — הושלם</div>
            <div className="rdc-sub">{flatSteps.length} שלבים בוצעו</div>
            <button className="rdc-btn" onClick={reset}>↺ הרץ שוב</button>
          </div>
        )}
      </div>

      {miniSkill && <MiniPanel item={miniSkill} onClose={() => setMiniSkill(null)} onCopy={onCopy} />}
    </div>
  )
}
