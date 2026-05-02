import { createContext, useContext, useState, useCallback } from 'react'
import { ALL_SKILLS, PIPELINES } from './data/index.js'

const AppContext = createContext(null)

function normalize(str) {
  return str.toLowerCase().replace(/(?<=[א-ת])א(?=[א-ת])/g, '')
}

function matchesQuery(s, q) {
  if (!q) return true
  const nq = normalize(q)
  const fields = [
    s.cmd, s.desc, s.detail || '',
    ...(s.triggers || []),
    ...(s.next || []).map(n => n.label + ' ' + n.hint)
  ]
  return fields.some(f => normalize(String(f || '')).includes(nq))
}

export function AppProvider({ children }) {
  const [activeCat, setActiveCat] = useState('all')
  const [activeUC, setActiveUC] = useState('all')
  const [activePipeline, setActivePipeline] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSkill, setSelectedSkill] = useState(null)
  const [toastMsg, setToastMsg] = useState('')

  const filtered = (() => {
    if (activePipeline) {
      return activePipeline.skills
        .map(ps => ALL_SKILLS.find(s => s.cmd === ps.cmd))
        .filter(s => s && matchesQuery(s, searchQuery))
    }
    return ALL_SKILLS.filter(s => {
      const mc = activeCat === 'all' || s.cat === activeCat
      const mu = activeUC === 'all' || (s.uc && s.uc.includes(activeUC))
      return mc && mu && matchesQuery(s, searchQuery)
    })
  })()

  const showToast = useCallback((msg = 'הועתק ✓') => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2000)
  }, [])

  const copyText = useCallback((text, message = 'הועתק ✓') => {
    navigator.clipboard.writeText(text).then(() => showToast(message))
  }, [showToast])

  const shareSkill = useCallback((skill) => {
    const url = `${window.location.origin}${window.location.pathname}?skill=${encodeURIComponent(skill.cmd)}`
    copyText(url, 'קישור הועתק ✓')
  }, [copyText])

  return (
    <AppContext.Provider value={{
      activeCat, setActiveCat,
      activeUC, setActiveUC,
      activePipeline, setActivePipeline,
      searchQuery, setSearchQuery,
      selectedSkill, setSelectedSkill,
      filtered,
      allSkills: ALL_SKILLS,
      pipelines: PIPELINES,
      toastMsg,
      showToast,
      copyText,
      shareSkill,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
