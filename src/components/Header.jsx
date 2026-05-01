import { useEffect, useState } from 'react';
import { useApp } from '../store';
import { PIPELINES } from '../data';

export function Header() {
  const { allSkills } = useApp();
  const [time, setTime] = useState('00:00:00');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      setTime(`${h}:${m}:${s}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 60,
        background: 'var(--black)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 24,
        paddingRight: 24,
      }}
    >
      {/* Logo */}
      <span
        style={{
          fontSize: 14,
          fontWeight: 800,
          color: 'var(--lime)',
          fontFamily: "'Heebo', sans-serif",
          letterSpacing: 1,
        }}
      >
        YARONI STUDIO
      </span>

      {/* Center - Skill count badge */}
      <div
        style={{
          background: 'var(--lime)',
          color: 'var(--black)',
          fontWeight: 700,
          padding: '4px 12px',
          borderRadius: 'var(--radius-sm)',
          fontSize: 12,
        }}
      >
        {allSkills.length} סקילים
      </div>

      {/* Clock */}
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          color: 'rgba(255,255,255,0.4)',
          minWidth: 70,
          textAlign: 'right',
        }}
      >
        {time}
      </span>
    </header>
  );
}
