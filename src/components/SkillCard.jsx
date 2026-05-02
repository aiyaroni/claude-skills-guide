import { motion } from 'framer-motion'
import { useApp } from '../store.jsx'
import { CAT_LABELS, CAT_COLORS } from '../data/config.js'

export default function SkillCard({ skill }) {
  const { selectedSkill, setSelectedSkill, copyText, shareSkill } = useApp()
  const isSelected = selectedSkill?.cmd === skill.cmd
  const catColor = CAT_COLORS[skill.cat] || '#888'

  const handleCopy = (e) => {
    e.stopPropagation()
    const cmd = skill.cmd.startsWith('/') ? skill.cmd : '/' + skill.cmd
    copyText(cmd, 'פקודה הועתקה ✓')
  }

  const handleShare = (e) => {
    e.stopPropagation()
    shareSkill(skill)
  }

  return (
    <motion.div
      onClick={() => setSelectedSkill(isSelected ? null : skill)}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      style={{
        position: 'relative',
        background: isSelected ? 'var(--cream2)' : 'var(--white)',
        border: `1px solid ${isSelected ? 'var(--black2)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-sm)',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        boxShadow: isSelected ? 'var(--shadow)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Header: Badge + Share icon */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
          background: `${catColor}20`, color: catColor, letterSpacing: '0.05em'
        }}>
          {CAT_LABELS[skill.cat] || skill.cat}
        </span>
        <motion.button
          onClick={handleShare}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: 18,
            cursor: 'pointer',
            padding: 0,
            minWidth: 24,
            minHeight: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--lime)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          🔗
        </motion.button>
      </div>

      {/* Cmd */}
      <div style={{ marginBottom: 12 }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--lime)',
          wordBreak: 'break-all',
          background: 'var(--black2)',
          padding: '4px 10px',
          borderRadius: 5,
          display: 'inline-block'
        }}>
          {skill.cmd}
        </span>
      </div>

      {/* Desc — 3 lines max */}
      <div style={{
        fontSize: 15,
        color: 'var(--text-mid)',
        lineHeight: 1.6,
        marginBottom: 10,
        flex: 1,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical'
      }}>
        {skill.desc}
      </div>

      {/* UC tags */}
      {skill.uc && skill.uc.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
          {skill.uc.map(u => (
            <span key={u} style={{
              fontSize: 12,
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--cream3)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)'
            }}>{u}</span>
          ))}
        </div>
      )}

      {/* Copy button */}
      <motion.button
        onClick={handleCopy}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          width: '100%',
          background: 'var(--black)',
          border: 'none',
          color: 'var(--lime)',
          padding: '10px 12px',
          borderRadius: 6,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontFamily: "inherit"
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
      >
        📋 העתק פקודה
      </motion.button>
    </motion.div>
  )
}
