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
        background: isSelected ? 'var(--cream2)' : 'var(--white)',
        border: `1px solid ${isSelected ? 'var(--black2)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)', padding: '12px 14px',
        cursor: 'pointer', transition: 'all 0.15s',
        boxShadow: isSelected ? 'var(--shadow)' : 'none'
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
        marginBottom: 8
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 600,
          color: 'var(--lime)', wordBreak: 'break-all',
          background: 'var(--black2)', padding: '3px 9px', borderRadius: 5,
          display: 'inline-block'
        }}>
          {skill.cmd}
        </span>
      </div>
      {/* Desc */}
      <div style={{ fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.6 }}>
        {skill.desc}
      </div>
      {/* UC tags */}
      {skill.uc && skill.uc.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
          {skill.uc.map(u => (
            <span key={u} style={{
              fontSize: 9, padding: '2px 6px', borderRadius: 'var(--radius-sm)',
              background: 'var(--cream3)', border: '1px solid var(--border)',
              color: 'var(--text-muted)'
            }}>{u}</span>
          ))}
        </div>
      )}
    </motion.div>
  )
}
