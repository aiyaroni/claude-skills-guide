import { useApp } from '../store.jsx'
import { CAT_ORDER, CAT_LABELS, CAT_COLORS, UC_ORDER, UC_LABELS } from '../data/config.js'

export default function Sidebar() {
  const { activeCat, setActiveCat, activeUC, setActiveUC, setActivePipeline, searchQuery, setSearchQuery, allSkills, pipelines } = useApp()

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
      background: 'var(--surface)',
      borderLeft: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      overflowY: 'auto'
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
        <div
          onClick={() => window.location.reload()}
          style={{ fontFamily: "'Syne', sans-serif", fontSize: 15, fontWeight: 800, color: 'var(--lime)', cursor: 'pointer', letterSpacing: '0.05em' }}
        >
          YARONI STUDIO
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>Claude Skills Guide</div>
      </div>

      {/* Search */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
        <input
          type="text"
          placeholder="חפש סקיל..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '8px 10px', color: 'var(--text)',
            fontSize: 13, outline: 'none', fontFamily: "'Heebo', sans-serif"
          }}
        />
      </div>

      {/* Categories */}
      <div style={{ padding: '12px 0' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.08em', padding: '0 16px 8px', textTransform: 'uppercase' }}>
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
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.08em', padding: '0 16px 8px', textTransform: 'uppercase' }}>
          לפי שימוש
        </div>
        <UCItem label="הכל" active={activeUC === 'all'} onClick={() => setActiveUC('all')} />
        {UC_ORDER.map(uc => (
          <UCItem key={uc} label={UC_LABELS[uc] || uc} active={activeUC === uc} onClick={() => setActiveUC(uc)} />
        ))}
      </div>

      {/* Stats */}
      <div style={{ marginTop: 'auto', padding: '16px', borderTop: '1px solid var(--border)' }}>
        <StatRow label="חיבורי MCP" value={mcpCount} />
        <StatRow label="פייפליינים" value={pipelines.length} />
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
        background: active ? 'var(--lime-dim)' : 'transparent',
        borderRight: active ? '2px solid var(--lime)' : '2px solid transparent',
        transition: 'all 0.15s'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: active ? 'var(--text)' : 'var(--text-dim)' }}>{label}</span>
      </div>
      <span style={{ fontSize: 11, color: 'var(--text-dim)', background: 'var(--bg)', padding: '1px 6px', borderRadius: 4 }}>{count}</span>
    </div>
  )
}

function UCItem({ label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '6px 16px', cursor: 'pointer', fontSize: 12,
        color: active ? 'var(--lime)' : 'var(--text-dim)',
        background: active ? 'var(--lime-dim)' : 'transparent',
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
      <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--lime)' }}>{value}</span>
    </div>
  )
}
