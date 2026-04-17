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
        <motion.aside
          key={selectedSkill.cmd}
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -320, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            width: 456, flexShrink: 0,
            background: 'var(--surface)',
            borderRight: '1px solid var(--border)',
            overflowY: 'auto', display: 'flex', flexDirection: 'column'
          }}
        >
          <PanelContent skill={selectedSkill} stepContext={stepContext} onClose={() => setSelectedSkill(null)} copyText={copyText} />
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

function PanelContent({ skill, stepContext, onClose, copyText }) {
  const catColor = CAT_COLORS[skill.cat] || '#888'
  const isMcp = skill.cat === 'mcp'

  return (
    <div style={{ padding: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
            background: `${catColor}20`, color: catColor, letterSpacing: '0.05em'
          }}>
            {CAT_LABELS[skill.cat] || skill.cat}
          </span>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
            color: 'var(--lime)', marginTop: 8, wordBreak: 'break-all'
          }}>
            {skill.cmd}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-body)', marginTop: 4, lineHeight: 1.5 }}>
            {skill.desc}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', fontSize: 18, cursor: 'pointer', padding: 4 }}
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
          <div style={{ fontSize: 12, color: 'var(--text-body)', lineHeight: 1.7 }}>
            {skill.detail.split('\n').map((line, i) => {
              const isHeading = line.trim().endsWith(':') || line.trim().endsWith('?')
              const isEmpty = line.trim() === ''
              if (isEmpty) return <br key={i} />
              if (isHeading) return (
                <div key={i} style={{
                  fontWeight: 700, color: 'var(--fuchsia)',
                  fontSize: 12, marginTop: 12, marginBottom: 4
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
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {skill.triggers.map((t, i) => (
              <span
                key={i}
                onClick={() => copyText(t)}
                style={{
                  fontSize: 11, padding: '3px 8px', borderRadius: 4,
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  color: 'var(--text-dim)', cursor: 'pointer'
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
          <div style={{ fontSize: 12, color: 'var(--text-body)', lineHeight: 1.6 }}>
            <div style={{ color: 'var(--lime)', marginBottom: 6 }}>{stepContext.short}</div>
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
                padding: '10px 12px', borderRadius: 8, marginBottom: 6,
                background: 'var(--bg)', border: '1px solid var(--border)',
                cursor: n.prompt ? 'pointer' : 'default'
              }}
            >
              <div style={{ fontSize: 13, marginBottom: 3 }}>
                <span style={{ marginLeft: 6 }}>{n.emoji}</span>
                <strong style={{ color: 'var(--text)' }}>{n.label}</strong>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{n.hint}</div>
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 12, fontWeight: 700, color: 'var(--lime)',
        letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10,
        borderBottom: '1px solid var(--border)', paddingBottom: 6
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function StepItem({ num, label, code, onCopy }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: code ? 4 : 0 }}>
        <span style={{ color: 'var(--lime)', fontWeight: 700, flexShrink: 0 }}>{num}</span>
        <span style={{ fontSize: 12, color: 'var(--text-body)' }}>{label}</span>
      </div>
      {code && (
        <div
          onClick={() => onCopy(code)}
          style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
            background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '6px 10px', color: 'var(--lime)',
            cursor: 'pointer', marginRight: 20, wordBreak: 'break-all',
            lineHeight: 1.5
          }}
        >
          {code}
        </div>
      )}
    </div>
  )
}
