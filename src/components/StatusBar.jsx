import { useEffect, useState } from 'react'
import { useApp } from '../store.jsx'

export default function StatusBar() {
  const { allSkills, pipelines } = useApp()
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => {
      const d = new Date()
      const p = n => String(n).padStart(2, '0')
      setTime(`${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{
      height: 40, background: '#060a10',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 20px',
      flexShrink: 0
    }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.05em' }}>
        YARONI STUDIO · CLAUDE SKILLS
      </span>
      <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>
        {allSkills.length} סקילים · {pipelines.length} פייפליינים
      </span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--lime)' }}>
        {time}
      </span>
    </div>
  )
}
