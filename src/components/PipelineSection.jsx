import { useApp } from '../store.jsx'
import { PIPELINE_GROUPS } from '../data/config.js'

export default function PipelineSection() {
  const { pipelines, activePipeline, setActivePipeline, setActiveCat, setActiveUC } = useApp()

  function selectPipeline(p) {
    if (activePipeline?.id === p.id) {
      setActivePipeline(null)
    } else {
      setActivePipeline(p)
      setActiveCat('all')
      setActiveUC('all')
    }
  }

  return (
    <div style={{ padding: '16px 20px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
        מסלולים — בחר מטרה
      </div>
      {Object.entries(PIPELINE_GROUPS).map(([gid, g]) => {
        const groupPipelines = pipelines.filter(p => p.group === gid)
        if (!groupPipelines.length) return null
        return (
          <div key={gid} style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{g.emoji}</span>
              <span style={{ fontWeight: 600 }}>{g.label}</span>
              <span style={{ opacity: 0.5 }}>— {g.desc}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {groupPipelines.map(p => {
                const stepCount = p.sessions
                  ? p.sessions.reduce((a, s) => a + s.skills.length, 0)
                  : p.skills.length
                const isActive = activePipeline?.id === p.id
                return (
                  <div
                    key={p.id}
                    onClick={() => selectPipeline(p)}
                    style={{
                      padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                      border: `1px solid ${isActive ? 'var(--lime)' : 'var(--border)'}`,
                      background: isActive ? 'var(--lime-dim)' : 'var(--surface)',
                      transition: 'all 0.15s', minWidth: 120
                    }}
                  >
                    <div style={{ fontSize: 16, marginBottom: 2 }}>{p.emoji}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? 'var(--lime)' : 'var(--text)' }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>{p.desc}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 4 }}>{stepCount} שלבים</div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
