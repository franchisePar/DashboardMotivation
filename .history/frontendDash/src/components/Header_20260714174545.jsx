import { useEffect, useState } from 'react'
import { RefreshCw, Search, Bell } from 'lucide-react'

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
      height: '64px', background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', flexShrink: 0,
    }}>
      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: '#f1f5f9', padding: '8px 16px', borderRadius: '100px',
        border: '1px solid #e2e8f0', width: '380px',
      }}>
        
        <Search size={16} color="#94a3b8" />
        <input
          type="text"
          placeholder="Search location, airport, booking, confirmation..."
          style={{
            border: 'none', background: 'transparent', outline: 'none',
            fontSize: '13px', color: '#64748b', width: '100%', fontFamily: 'var(--font-ui)',
          }}
        />
      </div>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* LIVE pill */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '12px', fontWeight: 700, color: '#22c55e', letterSpacing: '0.5px',
        }}>
          <span style={{
            width: '7px', height: '7px', borderRadius: '50%', background: '#22c55e',
            boxShadow: '0 0 0 3px rgba(34,197,94,0.2)',
            animation: 'live-pulse 2s infinite',
          }} />
          LIVE
        </div>

        {/* Bell */}
        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
          <Bell size={20} />
        </button>

        {/* Clock */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', letterSpacing: '-0.5px', lineHeight: 1.2 }}>
            {timeStr}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
            {dateStr}
          </div>
        </div>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          title="Refresh now"
          style={{
            width: '36px', height: '36px', borderRadius: '10px',
            border: '1px solid #e2e8f0', background: '#ffffff',
            color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#f8fafc'
            e.currentTarget.style.color = '#1e293b'
            e.currentTarget.style.borderColor = '#cbd5e1'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#ffffff'
            e.currentTarget.style.color = '#64748b'
            e.currentTarget.style.borderColor = '#e2e8f0'
          }}
        >
          <RefreshCw size={16} />
        </button>
      </div>
    </header>
  )
}