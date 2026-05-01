import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../store.jsx'
import { CAT_LABELS, CAT_COLORS } from '../data/config.js'

export default function SkillPanel() {
  const { selectedSkill, setSelectedSkill, activePipeline, allSkills, copyText } = useApp()

  // מצא את ה-pipeline step context אם קיים
  let stepContext = null
  if (activePipeline && selectedSkill) {
    const step = activePipeline.skills?.find(ps => ps.cmd === selectedSkill.cmd)
    if (step?.context) stepContext = step.context
  }

  return (
    <AnimatePresence>
      {selectedSkill && (
        <>
          {/* Backdrop */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedSkill(null)}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(2px)',
              zIndex: 200
            }}
          />
          {/* Modal panel */}
          <motion.div
            key={selectedSkill.cmd}
            initial={{ opacity: 0, scale: 0.95, x: '-50%', y: 'calc(-50% + 20px)' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, x: '-50%', y: 'calc(-50% + 20px)' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            style={{
              position: 'fixed', top: '50%', left: '50%',
              width: '90vw', maxWidth: 600,
              maxHeight: '85vh',
              overflowY: 'auto',
              background: 'var(--white)',
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 201,
              padding: 28
            }}
          >
            <PanelContent skill={selectedSkill} stepContext={stepContext} onClose={() => setSelectedSkill(null)} copyText={copyText} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function PanelContent({ skill, stepContext, onClose, copyText }) {
  const catColor = CAT_COLORS[skill.cat] || '#888'
  const isMcp = skill.cat === 'mcp'

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
            background: `${catColor}20`, color: catColor, letterSpacing: '0.05em'
          }}>
            {CAT_LABELS[skill.cat] || skill.cat}
          </span>
          <div style={{
            marginTop: 10
          }}>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontSize: 16, fontWeight: 600,
              color: 'var(--lime)', wordBreak: 'break-all',
              background: 'var(--black2)', padding: '4px 12px', borderRadius: 6,
              display: 'inline-block'
            }}>
              {skill.cmd}
            </span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-mid)', marginTop: 8, lineHeight: 1.5 }}>
            {skill.desc}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer', padding: 0, minWidth: 24, minHeight: 24 }}
        >×</button>
      </div>

      {/* MCP note */}
      {isMcp && (
        <div style={{
          background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)',
          borderRadius: 6, padding: '8px 12px', fontSize: 11, color: '#06b6d4',
          marginBottom: 16
        }}>
          מופעל אוטומטית בשיחה — אין צורך בפקודה
        </div>
      )}

      {/* Detail */}
      {skill.detail && (
        <Section title="מה זה עושה בפועל">
          <div style={{ fontSize: 16, color: 'var(--text-mid)', lineHeight: 1.7 }}>
            {skill.detail.split('\n').map((line, i) => {
              const isHeading = line.trim().endsWith(':') || line.trim().endsWith('?')
              const isEmpty = line.trim() === ''
              if (isEmpty) return <br key={i} />
              if (isHeading) return (
                <div key={i} style={{
                  fontWeight: 700, color: 'var(--fuchsia)',
                  fontSize: 15, marginTop: 12, marginBottom: 6
                }}>{line}</div>
              )
              return <div key={i}>{line}</div>
            })}
          </div>
        </Section>
      )}

      {/* Triggers */}
      {skill.triggers && skill.triggers.length > 0 && (
        <Section title="טריגרים">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {skill.triggers.map((t, i) => (
              <span
                key={i}
                onClick={() => copyText(t)}
                style={{
                  fontSize: 15, padding: '6px 12px', borderRadius: 6,
                  background: 'var(--cream2)', border: '1px solid var(--border2)',
                  color: 'var(--text-mid)', cursor: 'pointer'
                }}
              >{t}</span>
            ))}
          </div>
        </Section>
      )}

      {/* Steps */}
      {skill.steps && skill.steps.length > 0 && (
        <Section title="שלבים">
          {/* ① פקודה */}
          <StepItem num="①" label={isMcp ? 'מופעל אוטומטית' : 'פקודה'} code={isMcp ? null : (skill.cmd.startsWith('/') ? skill.cmd : '/' + skill.cmd)} onCopy={copyText} />
          {/* ② קלט */}
          {skill.steps[1] && (
            <StepItem num="②" label={skill.steps[1].t} code={skill.steps[1].c} onCopy={copyText} />
          )}
          {/* ③ פלט */}
          {skill.steps[2] && (
            <StepItem num="③" label={skill.steps[2].t || skill.desc} code={skill.steps[2].c} onCopy={copyText} />
          )}
        </Section>
      )}

      {/* Pipeline context */}
      {stepContext && (
        <Section title="הקשר בפייפליין">
          <div style={{ fontSize: 12, color: 'var(--text-mid)', lineHeight: 1.6 }}>
            <div style={{ color: 'var(--lime)', marginBottom: 6, fontWeight: 600 }}>{stepContext.short}</div>
            {stepContext.what && <div><strong>מה:</strong> {stepContext.what}</div>}
            {stepContext.howto && <div style={{ marginTop: 4 }}><strong>איך:</strong> {stepContext.howto}</div>}
            {stepContext.expect && <div style={{ marginTop: 4 }}><strong>לצפות:</strong> {stepContext.expect}</div>}
          </div>
        </Section>
      )}

      {/* Next */}
      {skill.next && skill.next.length > 0 && (
        <Section title="המשך מכאן">
          {skill.next.map((n, i) => (
            <div
              key={i}
              onClick={() => n.prompt && copyText(n.prompt)}
              style={{
                padding: '12px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 10,
                background: 'var(--cream2)', border: '1px solid var(--border)',
                cursor: n.prompt ? 'pointer' : 'default',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => n.prompt && (e.currentTarget.style.background = 'var(--cream3)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--cream2)')}
            >
              <div style={{ fontSize: 15, marginBottom: 4, fontWeight: 600 }}>
                <span style={{ marginRight: 8 }}>{n.emoji}</span>
                {n.label}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{n.hint}</div>
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        fontSize: 13, fontWeight: 700, color: 'var(--black2)',
        letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14,
        borderBottom: '1px solid var(--border)', paddingBottom: 10
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function StepItem({ num, label, code, onCopy }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: code ? 8 : 0 }}>
        <span style={{ color: 'var(--lime)', fontWeight: 700, flexShrink: 0, fontSize: 18 }}>{num}</span>
        <span style={{ fontSize: 15, color: 'var(--text-mid)', fontWeight: 500 }}>{label}</span>
      </div>
      {code && (
        <div
          onClick={() => onCopy(code)}
          style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 15,
            background: 'var(--cream3)', border: '1px solid var(--border2)',
            borderRadius: 6, padding: '8px 12px', color: 'var(--black)',
            cursor: 'pointer', marginLeft: 20, wordBreak: 'break-all',
            lineHeight: 1.6
          }}
        >
          {code}
        </div>
      )}
    </div>
  )
}
