import { useEffect, useState } from 'react'
import { RefreshCw, Search, Bell } from 'lucide-react'
import { BrandLogo } from './BrandLogo'

export function Header({ connected, lastUpdated, onRefresh }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  })

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <header style={{
      height: '64px', background: 'var(--bg-panel)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <img src="/assets/logos/United_Logo_BG.png" alt="United" style={{ height: '24px', objectFit: 'contain' }} />
        <span style={{ color: 'var(--border-bright)', fontSize: '18px', fontWeight: 300 }}>|</span>
        <img src="/assets/logos/Movis_Logo_BG.png" alt="MOVIS" style={{ height: '20px', objectFit: 'contain' }} />
        <span style={{ color: 'var(--border-bright)', fontSize: '18px', fontWeight: 300 }}>|</span>
        <img src="/assets/logos/Drivo_Logo_BG.png" alt="DRIVO" style={{ height: '20px', objectFit: 'contain' }} />
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'var(--bg-void)', padding: '8px 16px', borderRadius: '100px',
        border: '1px solid var(--border)', width: '380px',
      }}>
        <Search size={16} style={{ color: 'var(--muted)', opacity: 0.6, flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search location, airport, booking, confirmation..."
          style={{
            border: 'none', background: 'transparent', outline: 'none',
            fontSize: '13px', color: 'var(--text-primary)', width: '100%', fontFamily: 'var(--font-ui)',
          }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {connected && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '12px', fontWeight: 700, color: 'var(--success)', letterSpacing: '0.5px',
          }}>
            <span style={{
              width: '7px', height: '7px', borderRadius: '50%', background: 'var(--success)',
              boxShadow: '0 0 0 3px rgba(34,197,94,0.2)',
              animation: 'live-pulse 2s infinite',
            }} />
            LIVE
          </div>
        )}

        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: '4px' }}>
          <Bell size={20} />
        </button>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
            {timeStr}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 500 }}>
            {dateStr}
          </div>
        </div>

        <button
          onClick={onRefresh}
          title="Refresh now"
          style={{
            width: '36px', height: '36px', borderRadius: '10px',
            border: '1px solid var(--border)', background: 'var(--bg-panel)',
            color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-card-hover)'
            e.currentTarget.style.color = 'var(--text-primary)'
            e.currentTarget.style.borderColor = 'var(--border-bright)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-panel)'
            e.currentTarget.style.color = 'var(--muted)'
            e.currentTarget.style.borderColor = 'var(--border)'
          }}
        >
          <RefreshCw size={16} />
        </button>
      </div>
    </header>
  )
}