import { motion } from 'framer-motion'
import { useApp } from '../store.jsx'
import { CAT_LABELS, CAT_COLORS } from '../data/config.js'

export default function SkillCard({ skill }) {
  const { selectedSkill, setSelectedSkill } = useApp()
  const isSelected = selectedSkill?.cmd === skill.cmd
  const catColor = CAT_COLORS[skill.cat] || '#888'

  return (
    <motion.div
      onClick={() => setSelectedSkill(isSelected ? null : skill)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        background: isSelected ? 'var(--surface-hover)' : 'var(--surface)',
        border: `1px solid ${isSelected ? 'var(--lime)' : 'var(--border)'}`,
        borderRadius: 10, padding: '12px 14px',
        cursor: 'pointer', transition: 'border-color 0.15s'
      }}
    >
      {/* Cat badge */}
      <div style={{ marginBottom: 8 }}>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
          background: `${catColor}20`, color: catColor, letterSpacing: '0.05em'
        }}>
          {CAT_LABELS[skill.cat] || skill.cat}
        </span>
      </div>
      {/* Cmd */}
      <div style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
        color: 'var(--lime)', marginBottom: 6, wordBreak: 'break-all'
      }}>
        {skill.cmd}
      </div>
      {/* Desc */}
      <div style={{ fontSize: 12, color: 'var(--text-body)', lineHeight: 1.5 }}>
        {skill.desc}
      </div>
      {/* UC tags */}
      {skill.uc && skill.uc.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
          {skill.uc.map(u => (
            <span key={u} style={{
              fontSize: 9, padding: '1px 5px', borderRadius: 3,
              background: 'var(--bg)', color: 'var(--text-dim)'
            }}>{u}</span>
          ))}
        </div>
      )}
    </motion.div>
  )
}
