import { useApp } from '../store.jsx'
import SkillCard from './SkillCard.jsx'

export default function SkillGrid() {
  const { filtered, activePipeline, activeCat, searchQuery } = useApp()

  const title = activePipeline
    ? activePipeline.name
    : activeCat === 'all' ? 'כל הסקילים' : activeCat

  return (
    <div style={{ padding: '20px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>{title}</h2>
        <span style={{
          fontSize: 13, padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontWeight: 600,
          background: 'rgba(200,255,0,0.2)', color: '#3a5000'
        }}>{filtered.length}</span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 10
      }}>
        {filtered.map(skill => (
          <SkillCard key={skill.cmd} skill={skill} />
        ))}
      </div>
    </div>
  )
}
