import { useState, useEffect, useMemo, useRef } from 'react'
import { CAT_LABELS, CAT_COLORS } from '../data/config.js'
import { Ic } from '../lib/icons.jsx'

const cx = (...args) => args.filter(Boolean).join(' ')

function normalize(str) {
  return String(str || '').toLowerCase()
    .replace(/(?<=[א-ת])א(?=[א-ת])/g, '')
    .replace(/[֑-ׇ]/g, '')
}

export default function CommandPalette({ open, onClose, onPick, allItems, recents, favs }) {
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(0)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setQ(''); setSel(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  const results = useMemo(() => {
    if (!open) return []
    if (!q.trim()) {
      const seen = new Set()
      const out = []
      for (const cmd of [...(favs || []), ...(recents || [])]) {
        if (seen.has(cmd)) continue
        const item = allItems.find(i => i.cmd === cmd)
        if (item) { out.push(item); seen.add(cmd) }
      }
      for (const item of allItems) {
        if (out.length >= 8) break
        if (seen.has(item.cmd)) continue
        out.push(item); seen.add(item.cmd)
      }
      return out.slice(0, 10)
    }
    const ql = normalize(q)
    return allItems
      .map(item => {
        const hay = normalize(item.cmd + ' ' + item.desc + ' ' + (item.detail || '') + ' ' + (item.triggers || []).join(' '))
        const ncmd = normalize(item.cmd)
        let score = 0
        if (ncmd.includes(ql)) score += 10
        if (ncmd.startsWith(ql)) score += 5
        if (hay.includes(ql)) score += 1
        return { item, score }
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map(x => x.item)
  }, [q, open, recents, favs, allItems])

  useEffect(() => { setSel(0) }, [q])

  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(s => Math.max(s - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (results[sel]) onPick(results[sel]) }
    else if (e.key === 'Escape') { onClose() }
  }

  if (!open) return null
  return (
    <div className="kp-back" onClick={onClose}>
      <div className="kp" onClick={(e) => e.stopPropagation()}>
        <div className="kp-input">
          <Ic.search width="18" height="18" />
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="חפש סקיל, פייפליין, פקודה…"
          />
          <span className="esc">esc</span>
        </div>
        <div className="kp-list">
          {results.length === 0 && q && (
            <div className="kp-empty">אין תוצאות עבור &ldquo;{q}&rdquo;</div>
          )}
          {results.map((item, i) => {
            const cat = item.cat || 'mcp'
            return (
              <div
                key={item.cmd}
                className={cx('kp-row', i === sel && 'on')}
                onClick={() => onPick(item)}
                onMouseEnter={() => setSel(i)}
              >
                <span className="dot" style={{ background: CAT_COLORS[cat] || '#94a3b8' }}></span>
                <div className="body">
                  <div className="kp-cmd">{item.cmd}</div>
                  <div className="kp-d">{item.desc}</div>
                </div>
                <span className="kp-cat">{CAT_LABELS[cat] || cat}</span>
              </div>
            )
          })}
        </div>
        <div className="kp-hint">
          <span><span className="kbd">↑↓</span> ניווט</span>
          <span><span className="kbd">↵</span> פתח</span>
          <span><span className="kbd">esc</span> סגור</span>
          <span style={{ marginRight: 'auto', opacity: .7 }}>{results.length} תוצאות</span>
        </div>
      </div>
    </div>
  )
}
