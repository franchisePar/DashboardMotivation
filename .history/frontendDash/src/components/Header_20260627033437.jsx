import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import './Header.css'

export function Header({ connected, lastUpdated, onRefresh }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const syncText = lastUpdated
    ? `Updated ${Math.round((Date.now() - lastUpdated.getTime()) / 60000)}m ago`
    : 'Syncing...'

  return (
    <header className="dash-header">
      <div className="dash-header__left">
        <div className="dash-header__logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/>
            <circle cx="7" cy="17" r="2"/>
            <path d="M9 17h6"/>
            <circle cx="17" cy="17" r="2"/>
          </svg>
        </div>
        <div className="dash-header__title">
          <span className="dash-header__brand">RENTAL DASHBOARD</span>
          <span className="dash-header__sub">PERFORMANCE MONITOR</span>
        </div>
      </div>

      <div className="dash-header__center">
        <span className="dash-header__clock">{timeStr}</span>
        <span className="dash-header__date">{dateStr}</span>
      </div>

      <div className="dash-header__right">
        <span className="dash-header__sync">{syncText}</span>
        <div className={`dash-header__status ${connected ? 'connected' : 'disconnected'}`}>
          <span className="dash-header__status-dot" />
          {connected ? 'LIVE' : 'OFFLINE'}
        </div>
        <button className="dash-header__btn" onClick={onRefresh} title="Refresh now">
          <RefreshCw size={16} />
        </button>
      </div>
    </header>
  )
}