import { useState, useEffect, useMemo, useRef } from 'react'
import { TYPE_LABELS, TYPE_COLORS, TAG_LABELS } from '../data/config.js'
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
      for (const id of [...(favs || []), ...(recents || [])]) {
        if (seen.has(id)) continue
        const item = allItems.find(i => i.id === id)
        if (item) { out.push(item); seen.add(id) }
      }
      for (const item of allItems) {
        if (out.length >= 8) break
        if (seen.has(item.id)) continue
        out.push(item); seen.add(item.id)
      }
      return out.slice(0, 10)
    }
    const ql = normalize(q)
    return allItems
      .map(item => {
        const label = item.cmd || item.title
        // תגיות וסוג נכנסים לחיפוש — פריט מתויג שלא נמצא בחיפוש הוא פריט אבוד
        const hay = normalize([
          label, item.title, item.desc, item.body,
          (item.tags || []).join(' '), (item.triggers || []).join(' '),
          TYPE_LABELS[item.kind] || '',
        ].join(' '))
        const nlabel = normalize(label)
        let score = 0
        if (nlabel.includes(ql)) score += 10
        if (nlabel.startsWith(ql)) score += 5
        if ((item.tags || []).some(t => normalize(t) === ql || normalize(TAG_LABELS[t] || '') === ql)) score += 8
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
            placeholder="חפש מדריך, פרומפט, סקיל, תגית…"
          />
          <span className="esc">esc</span>
        </div>
        <div className="kp-list">
          {results.length === 0 && q && (
            <div className="kp-empty">אין תוצאות עבור &ldquo;{q}&rdquo;</div>
          )}
          {results.map((item, i) => {
            const kind = item.kind || 'skill'
            return (
              <div
                key={item.id}
                className={cx('kp-row', i === sel && 'on')}
                onClick={() => onPick(item)}
                onMouseEnter={() => setSel(i)}
              >
                <span className="dot" style={{ background: TYPE_COLORS[kind] || '#94a3b8' }}></span>
                <div className="body">
                  <div className="kp-cmd">{item.cmd || item.title}</div>
                  <div className="kp-d">{item.desc}</div>
                </div>
                <span className="kp-cat">{TYPE_LABELS[kind] || kind}</span>
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
