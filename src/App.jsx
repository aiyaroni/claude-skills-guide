import { useState, useEffect, useMemo, useCallback } from 'react'
import { SKILLS } from './data/skills.js'
import { MCP_SKILLS } from './data/mcp.js'
import { PIPELINES } from './data/pipelines.js'
import { CAT_LABELS, CAT_COLORS, CAT_ORDER, UC_LABELS, UC_ORDER, PIPELINE_GROUPS } from './data/config.js'
import { useFavorites, useRecents, useToast, useTweaks, copy } from './lib/hooks.js'
import { Ic } from './lib/icons.jsx'
import SkillCard from './components/SkillCard.jsx'
import DetailPanel from './components/DetailPanel.jsx'
import PipelineRunner from './components/PipelineRunner.jsx'
import CommandPalette from './components/CommandPalette.jsx'
import TweaksPanel from './components/TweaksPanel.jsx'
import Toast from './components/Toast.jsx'

const cx = (...args) => args.filter(Boolean).join(' ')

const ALL_ITEMS = [
  ...SKILLS.map(s => ({ ...s, kind: 'skill' })),
  ...MCP_SKILLS.map(m => ({ ...m, kind: 'mcp' })),
]

const TWEAK_DEFAULTS = { variant: 'calm', accent: 'lime', density: 'comfy' }

export default function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS)
  const [selCat, setSelCat] = useState(null)
  const [selUC, setSelUC] = useState(null)
  const [selPipe, setSelPipe] = useState(null)
  const [favOnly, setFavOnly] = useState(false)
  const [openItem, setOpenItem] = useState(null)
  const [runPipe, setRunPipe] = useState(null)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [mobileAsideOpen, setMobileAsideOpen] = useState(false)

  const [favs, toggleFav] = useFavorites()
  const [recents, pushRecent] = useRecents()
  const [toast, showToast] = useToast()

  const onCopy = useCallback((text) => copy(text, showToast), [showToast])
  const onOpen = useCallback((item) => {
    setOpenItem(item)
    pushRecent(item.cmd)
  }, [pushRecent])

  // ⌘K / /
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(o => !o)
      }
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault(); setPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Apply design tokens
  useEffect(() => {
    document.documentElement.setAttribute('data-variant', tweaks.variant)
    document.documentElement.setAttribute('data-accent', tweaks.accent)
    document.documentElement.setAttribute('data-density', tweaks.density)
  }, [tweaks])

  const filtered = useMemo(() => {
    let items = ALL_ITEMS
    if (favOnly) items = items.filter(i => favs.includes(i.cmd))
    if (selCat) items = items.filter(i => i.cat === selCat)
    if (selUC) items = items.filter(i => (i.uc || []).includes(selUC))
    return items
  }, [selCat, selUC, favOnly, favs])

  const catCounts = useMemo(() => {
    const c = {}
    for (const it of ALL_ITEMS) c[it.cat] = (c[it.cat] || 0) + 1
    return c
  }, [])

  const recentItems = useMemo(() =>
    recents.map(cmd => ALL_ITEMS.find(it => it.cmd === cmd)).filter(Boolean).slice(0, 6),
    [recents]
  )

  const clearFilters = () => { setSelCat(null); setSelUC(null); setFavOnly(false); setSelPipe(null) }
  const activeFilters = [selCat, selUC, favOnly && 'favs'].filter(Boolean).length

  const resetAll = useCallback(() => {
    setSelCat(null)
    setSelUC(null)
    setSelPipe(null)
    setFavOnly(false)
    setOpenItem(null)
    setRunPipe(null)
    setPaletteOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <div className="app-root">
      {/* Topbar */}
      <header className="topbar">
        <div className="brand" onClick={resetAll} style={{ cursor: 'pointer' }} title="חזרה לעמוד הראשי">
          <div className="name">YARONI · SKILLS</div>
          <div className="tag">{SKILLS.length} סקילים · {PIPELINES.length} פייפליינים · {MCP_SKILLS.length} MCP</div>
        </div>

        <div className="kbar" onClick={() => setPaletteOpen(true)}>
          <Ic.search />
          <span className="placeholder">חפש סקיל, פייפליין, או הקלד פקודה…</span>
          <span className="kbd">⌘</span><span className="kbd">K</span>
        </div>

        <div className="head-actions">
          <button
            className="filter-fab"
            onClick={() => setMobileAsideOpen(o => !o)}
            aria-label="פתח פילטרים"
          >
            <Ic.filter />
            <span>פילטר{activeFilters > 0 ? ` (${activeFilters})` : ''}</span>
          </button>
          <button
            className={cx('head-btn', favOnly && 'active')}
            onClick={() => setFavOnly(f => !f)}
            title="מועדפים"
          >
            <Ic.star filled={favOnly} />
            <span>מועדפים</span>
            {favs.length > 0 && <span className="kbd" style={{ marginRight: 4 }}>{favs.length}</span>}
          </button>
        </div>
      </header>

      {/* Work area */}
      <div className={cx('work', (runPipe || openItem) && 'runner-mode')}>
        <aside className={cx('aside', mobileAsideOpen && 'open')}>
          {recentItems.length > 0 && !runPipe && (
            <div className="aside-section">
              <div className="aside-title">
                <span>אחרונים</span>
                <span className="reset" onClick={() => { localStorage.removeItem('ysk:recents'); window.location.reload() }}>נקה</span>
              </div>
              {recentItems.map(it => (
                <div key={it.cmd} className="uc-row" onClick={() => onOpen(it)}
                  style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5 }}>
                  {it.cmd}
                </div>
              ))}
            </div>
          )}

          <div className="aside-section">
            <div className="aside-title">
              <span>קטגוריות</span>
              {(selCat || selUC || favOnly) && (
                <span className="reset" onClick={clearFilters}>נקה</span>
              )}
            </div>
            <div className="cat-row" onClick={() => setSelCat(null)}
              style={{ background: !selCat ? 'var(--surface2)' : '' }}>
              <span className="left"><span className="dot" style={{ background: 'var(--ink2)' }}></span>הכל</span>
              <span className="count">{ALL_ITEMS.length}</span>
            </div>
            {CAT_ORDER.map(c => (
              <div key={c}
                className={cx('cat-row', selCat === c && 'on')}
                onClick={() => setSelCat(selCat === c ? null : c)}>
                <span className="left">
                  <span className="dot" style={{ background: CAT_COLORS[c] }}></span>
                  {CAT_LABELS[c]}
                </span>
                <span className="count">{catCounts[c] || 0}</span>
              </div>
            ))}
          </div>

          <div className="aside-section">
            <div className="aside-title"><span>תרחישים</span></div>
            {UC_ORDER.map(u => (
              <div key={u}
                className={cx('uc-row', selUC === u && 'on')}
                onClick={() => setSelUC(selUC === u ? null : u)}>
                {UC_LABELS[u]}
              </div>
            ))}
          </div>
        </aside>
        <div className="aside-overlay" onClick={() => setMobileAsideOpen(false)} />

        <main className="main">
          {runPipe ? (
            <PipelineRunner
              pipeline={runPipe}
              onClose={() => setRunPipe(null)}
              onCopy={onCopy}
              allItems={ALL_ITEMS}
            />
          ) : openItem ? (
            <DetailPanel
              item={openItem}
              onClose={() => setOpenItem(null)}
              onOpen={onOpen}
              onCopy={onCopy}
              onRunPipeline={(p) => { setOpenItem(null); setRunPipe(p) }}
            />
          ) : (
            <>
              {/* Pipelines hero */}
              <section className="pipeline-hero">
                <div className="hero-canvas">
                  <div className="hero-orb orb1" />
                  <div className="hero-orb orb2" />
                </div>
                <div className="hero-head">
                  <div>
                    <div className="hero-eyebrow">מתחילים מכאן ↓</div>
                    <div className="hero-title">
                      {tweaks.variant === 'bold'
                        ? <>פייפליינים<em>.</em></>
                        : <>התחל מ<em>פייפליין</em></>}
                    </div>
                    <div className="hero-sub" style={{ marginTop: 12 }}>
                      {tweaks.variant === 'bold'
                        ? 'תהליכים מאפס לפלט. בחר פייפליין → עקוב אחרי שלבים → סיים.'
                        : <> בחר תהליך → <b>קבל שלבים מובנים</b> → העתק פקודה והרץ ב-Claude.</>}
                    </div>
                  </div>
                  <div className="hero-stats">
                    <div className="hero-stat">
                      <span className="hs-num" style={{ background: 'var(--accent)', color: 'var(--ink2)' }}>{PIPELINES.length}</span>
                      <span className="hs-label">פייפליינים</span>
                    </div>
                    <div className="hero-stat">
                      <span className="hs-num" style={{ background: 'var(--fuchsia)', color: '#fff' }}>{SKILLS.length}</span>
                      <span className="hs-label">סקילים</span>
                    </div>
                    <div className="hero-stat">
                      <span className="hs-num" style={{ background: 'var(--ink2)', color: 'var(--surface)' }}>{MCP_SKILLS.length}</span>
                      <span className="hs-label">MCP</span>
                    </div>
                  </div>
                </div>

                <div className="pipe-tabs">
                  <div className={cx('pipe-tab', !selPipe && 'on')} onClick={() => setSelPipe(null)}>הכל</div>
                  {Object.entries(PIPELINE_GROUPS).map(([k, v]) => (
                    <div key={k}
                      className={cx('pipe-tab', selPipe === k && 'on')}
                      onClick={() => setSelPipe(selPipe === k ? null : k)}>
                      <span>{v.label}</span>
                    </div>
                  ))}
                </div>

                <div className="pipe-grid">
                  {PIPELINES
                    .filter(p => !selPipe || p.group === selPipe)
                    .map(p => (
                      <div key={p.id} className="pipe-card" onClick={() => setRunPipe(p)}>
                        <div className="pc-name">{p.name}</div>
                        <div className="pc-desc">{p.desc}</div>
                        <div className="pc-meta">
                          <span>{(p.skills || []).length} שלבים</span>
                          <span className="dots">
                            {Array.from({ length: Math.min(6, (p.skills || []).length) }).map((_, i) => <span key={i} />)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </section>

              {/* Skills section */}
              <section>
                <div className="section-head">
                  <div className="lab">
                    <h2>{favOnly ? 'מועדפים' : selCat ? CAT_LABELS[selCat] : 'כל הסקילים'}</h2>
                    <span className="ct">{filtered.length}</span>
                  </div>
                  <div className="controls">
                    {activeFilters > 0 && (
                      <button className="head-btn" onClick={clearFilters}>
                        <Ic.x /> <span>נקה {activeFilters}</span>
                      </button>
                    )}
                  </div>
                </div>

                {(selCat || selUC || favOnly) && (
                  <div className="filterbar">
                    {selCat && (
                      <div className="chip on" onClick={() => setSelCat(null)}>
                        <span className="dot" style={{ background: CAT_COLORS[selCat] }}></span>
                        {CAT_LABELS[selCat]} <Ic.x width="11" height="11" />
                      </div>
                    )}
                    {selUC && (
                      <div className="chip on" onClick={() => setSelUC(null)}>
                        {UC_LABELS[selUC]} <Ic.x width="11" height="11" />
                      </div>
                    )}
                    {favOnly && (
                      <div className="chip on" onClick={() => setFavOnly(false)}>
                        ★ מועדפים <Ic.x width="11" height="11" />
                      </div>
                    )}
                  </div>
                )}

                {filtered.length === 0 ? (
                  <div className="empty">
                    <div>אין תוצאות עם הפילטרים האלה</div>
                    <button className="btn" style={{ marginTop: 14 }} onClick={clearFilters}>נקה פילטרים</button>
                  </div>
                ) : (
                  <div className="skill-grid">
                    {filtered.map(it => (
                      <SkillCard
                        key={it.cmd}
                        item={it}
                        isFav={favs.includes(it.cmd)}
                        onFav={toggleFav}
                        onOpen={onOpen}
                        onCopy={onCopy}
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </main>
      </div>

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onPick={(item) => { setPaletteOpen(false); onOpen(item) }}
        allItems={ALL_ITEMS}
        recents={recents}
        favs={favs}
      />

      <Toast msg={toast} />
      <TweaksPanel tweaks={tweaks} setTweak={setTweak} />
    </div>
  )
}
