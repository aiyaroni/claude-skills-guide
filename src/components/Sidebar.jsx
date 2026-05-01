import { useApp } from '../store.jsx'
import { CAT_ORDER, CAT_LABELS, CAT_COLORS, UC_ORDER, UC_LABELS } from '../data/config.js'
import { PIPELINES } from '../data/index.js'

export default function Sidebar() {
  const { activeCat, setActiveCat, activeUC, setActiveUC, activePipeline, setActivePipeline, searchQuery, setSearchQuery, allSkills } = useApp()

  function resetAll() {
    setActiveCat('all')
    setActiveUC('all')
    setActivePipeline(null)
    setSearchQuery('')
  }

  const mcpCount = allSkills.filter(s => s.cat === 'mcp').length

  return (
    <aside style={{
      width: 260, flexShrink: 0,
      background: 'var(--cream2)',
      borderLeft: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto'
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <div
          onClick={() => window.location.reload()}
          style={{ fontFamily: "'Heebo', sans-serif", fontSize: 15, fontWeight: 800, color: 'var(--black)', cursor: 'pointer', letterSpacing: '0.05em' }}
        >
          YARONI STUDIO
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Claude Skills Guide</div>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <input
          type="text"
          placeholder="חפש סקיל..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: '100%', background: 'var(--white)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '8px 10px', color: 'var(--text)',
            fontSize: 13, outline: 'none', fontFamily: "'Heebo', sans-serif",
            boxShadow: 'var(--shadow)'
          }}
        />
      </div>

      {/* Categories */}
      <div style={{ padding: '12px 0' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', padding: '0 16px 8px', textTransform: 'uppercase' }}>
          קטגוריות
        </div>
        <CatItem label="הכל" color="#445" active={activeCat === 'all'} count={allSkills.length} onClick={() => setActiveCat('all')} />
        {CAT_ORDER.map(cat => (
          <CatItem
            key={cat}
            label={CAT_LABELS[cat] || cat}
            color={CAT_COLORS[cat] || '#888'}
            active={activeCat === cat}
            count={allSkills.filter(s => s.cat === cat).length}
            onClick={() => setActiveCat(cat)}
          />
        ))}
      </div>

      {/* UC */}
      <div style={{ padding: '12px 0', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', padding: '0 16px 8px', textTransform: 'uppercase' }}>
          לפי שימוש
        </div>
        <UCItem label="הכל" active={activeUC === 'all'} onClick={() => setActiveUC('all')} />
        {UC_ORDER.map(uc => (
          <UCItem key={uc} label={UC_LABELS[uc] || uc} active={activeUC === uc} onClick={() => setActiveUC(uc)} />
        ))}
      </div>

      {/* Pipelines */}
      <div style={{ padding: '12px 0', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.08em', padding: '0 16px 8px', textTransform: 'uppercase' }}>
          מסלולים
        </div>
        {activePipeline && (
          <div
            onClick={() => setActivePipeline(null)}
            style={{
              padding: '6px 16px', cursor: 'pointer', fontSize: 13,
              color: 'var(--text)',
              background: 'transparent',
              transition: 'all 0.15s'
            }}
          >
            הכל
          </div>
        )}
        {PIPELINES.map(p => (
          <div
            key={p.id}
            onClick={() => {
              if (activePipeline?.id === p.id) {
                setActivePipeline(null)
              } else {
                setActivePipeline(p)
                setActiveCat('all')
                setActiveUC('all')
              }
            }}
            style={{
              padding: '6px 16px', cursor: 'pointer', fontSize: 13,
              background: activePipeline?.id === p.id ? 'var(--lime)' : 'transparent',
              color: activePipeline?.id === p.id ? 'var(--black)' : 'var(--text-muted)',
              fontWeight: activePipeline?.id === p.id ? 600 : 400,
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.15s'
            }}
          >
            <span>{p.emoji}</span>
            <span>{p.name}</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid var(--border)' }}>
        <StatRow label="חיבורי MCP" value={mcpCount} />
        <StatRow label="פייפליינים" value={PIPELINES.length} />
      </div>
    </aside>
  )
}

function CatItem({ label, color, active, count, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '7px 16px', cursor: 'pointer',
        background: active ? 'var(--lime)' : 'transparent',
        borderRight: active ? '2px solid var(--black2)' : '2px solid transparent',
        transition: 'all 0.15s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: active ? 'var(--black)' : 'var(--text-muted)' }}>{label}</span>
      </div>
      <span style={{ fontSize: 11, color: active ? 'var(--black)' : 'var(--text-muted)', background: active ? 'transparent' : 'var(--cream3)', padding: '2px 6px', borderRadius: 4 }}>{count}</span>
    </div>
  )
}

function UCItem({ label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '6px 16px', cursor: 'pointer', fontSize: 12,
        color: active ? 'var(--black)' : 'var(--text-muted)',
        background: active ? 'var(--lime)' : 'transparent',
        fontWeight: active ? 600 : 400,
        transition: 'all 0.15s'
      }}
    >
      {label}
    </div>
  )
}

function StatRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{value}</span>
    </div>
  )
}
