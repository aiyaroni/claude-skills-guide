import { useState, useCallback } from 'react'

// ה-prerender מריץ את הקומפוננטות ב-node, שם אין localStorage.
// בלי השמירה הזאת כל עמוד סטטי נופל בזמן הבנייה
const hasLS = typeof localStorage !== 'undefined'

const LS = {
  get(k, def) {
    if (!hasLS) return def
    try { const v = localStorage.getItem('ysk:' + k); return v == null ? def : JSON.parse(v) }
    catch { return def }
  },
  set(k, v) {
    if (!hasLS) return
    try { localStorage.setItem('ysk:' + k, JSON.stringify(v)) }
    catch { /* מכסה מלאה או מצב פרטי — לא שובר את האתר */ }
  },
}

export function useFavorites() {
  const [favs, setFavs] = useState(() => LS.get('favs', []))
  const toggle = useCallback((cmd) => {
    setFavs(prev => {
      const next = prev.includes(cmd) ? prev.filter(x => x !== cmd) : [...prev, cmd]
      LS.set('favs', next)
      return next
    })
  }, [])
  return [favs, toggle]
}

export function useRecents() {
  const [recents, setRecents] = useState(() => LS.get('recents', []))
  const push = useCallback((cmd) => {
    setRecents(prev => {
      const next = [cmd, ...prev.filter(x => x !== cmd)].slice(0, 8)
      LS.set('recents', next)
      return next
    })
  }, [])
  return [recents, push, () => { LS.set('recents', []); setRecents([]) }]
}

export function useToast() {
  const [msg, setMsg] = useState(null)
  const show = useCallback((m) => {
    setMsg(m)
    clearTimeout(window.__toastT)
    window.__toastT = setTimeout(() => setMsg(null), 1700)
  }, [])
  return [msg, show]
}

export function useTweaks(defaults) {
  const [values, setValues] = useState(() => ({ ...defaults, ...LS.get('tweaks', {}) }))
  const setTweak = useCallback((key, val) => {
    setValues(prev => {
      const next = { ...prev, [key]: val }
      LS.set('tweaks', next)
      return next
    })
  }, [])
  return [values, setTweak]
}

export function copy(text, toast) {
  if (!text) return
  navigator.clipboard?.writeText(text).then(
    () => toast?.('הועתק ✓'),
    () => toast?.('לא הצליח להעתיק'),
  )
}
