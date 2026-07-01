import { useState, useEffect } from 'react'
import { Wifi, WifiOff, RefreshCw, Maximize2, Car } from 'lucide-react'
import './Header.css'

export function Header({ connected, lastUpdated, onRefresh, onFullscreen }) {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  })
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <header className="dash-header">
      <div className="dash-header__left">
        <div className="dash-header__logo">
          <Car size={22} strokeWidth={1.8} />
        </div>
        <div className="dash-header__title">
          <span className="dash-header__brand">RENTAL</span>
          <span className="dash-header__sub">PERFORMANCE HQ</span>
        </div>
      </div>

      <div className="dash-header__center">
        <div className="dash-header__clock">{timeStr}</div>
        <div className="dash-header__date">{dateStr}</div>
      </div>

      <div className="dash-header__right">
        {lastUpdated && (
          <span className="dash-header__sync muted">
            Synced {lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
        <div className={`dash-header__status ${connected ? 'connected' : 'disconnected'}`}>
          {connected
            ? <><Wifi size={14} /><span>LIVE</span></>
            : <><WifiOff size={14} /><span>OFFLINE</span></>
          }
          <span className="dash-header__status-dot" />
        </div>
        <button className="dash-header__btn" onClick={onRefresh} title="Refresh">
          <RefreshCw size={16} />
        </button>
        <button className="dash-header__btn" onClick={onFullscreen} title="Fullscreen">
          <Maximize2 size={16} />
        </button>
      </div>
    </header>
  )
}
