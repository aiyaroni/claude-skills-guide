import { useState } from 'react';

export function Hero() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section
      style={{
        background: 'var(--black2)',
        position: 'relative',
        overflow: 'hidden',
        padding: '48px 40px',
        maxHeight: collapsed ? 0 : 200,
        transition: 'max-height 0.3s ease',
      }}
    >
      {/* Radial gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(200,255,0,0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 50%, rgba(255,45,120,0.12) 0%, transparent 50%)
          `,
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: 'white',
            fontFamily: "'Heebo', sans-serif",
            marginBottom: 8,
          }}
        >
          סקילים של Claude Code
        </h1>
        <p
          style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.6)',
            fontFamily: "'Heebo', sans-serif",
            margin: 0,
          }}
        >
          מדריך אינטראקטיבי לפקודות, פייפליינים ו-MCP servers
        </p>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          width: 32,
          height: 32,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.5)',
          fontSize: 18,
          zIndex: 2,
          transition: 'background 0.2s',
        }}
        onHover={(e) => (e.target.style.background = 'rgba(255,255,255,0.15)')}
      >
        {collapsed ? '∨' : '^'}
      </button>
    </section>
  );
}
