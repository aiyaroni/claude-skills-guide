import { AppProvider } from './store.jsx'
import StatusBar from './components/StatusBar.jsx'
import Sidebar from './components/Sidebar.jsx'
import PipelineSection from './components/PipelineSection.jsx'
import SkillGrid from './components/SkillGrid.jsx'
import SkillPanel from './components/SkillPanel.jsx'
import Toast from './components/Toast.jsx'

export default function App() {
  return (
    <AppProvider>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
        <StatusBar />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar — ימין */}
          <Sidebar />
          {/* Main — מרכז */}
          <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            <PipelineSection />
            <SkillGrid />
          </main>
          {/* Detail Panel — שמאל */}
          <SkillPanel />
        </div>
      </div>
      <Toast />
    </AppProvider>
  )
}
