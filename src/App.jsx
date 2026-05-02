import { useEffect } from 'react'
import { AppProvider, useApp } from './store.jsx'
import { Header } from './components/Header.jsx'
import { Hero } from './components/Hero.jsx'
import Sidebar from './components/Sidebar.jsx'
import SkillGrid from './components/SkillGrid.jsx'
import SkillPanel from './components/SkillPanel.jsx'
import Toast from './components/Toast.jsx'

function AppContent() {
  const { allSkills, setSelectedSkill } = useApp()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const skillCmd = params.get('skill')
    if (skillCmd) {
      const found = allSkills.find(s => s.cmd === skillCmd)
      if (found) setSelectedSkill(found)
    }
  }, [allSkills, setSelectedSkill])

  return (
    <>
      <Header />
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 60px)', overflow: 'hidden', background: 'var(--cream)' }}>
        <Hero />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar — ימין */}
          <Sidebar />
          {/* Main — מרכז */}
          <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            <SkillGrid />
          </main>
        </div>
      </div>
      <SkillPanel />
      <Toast />
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
