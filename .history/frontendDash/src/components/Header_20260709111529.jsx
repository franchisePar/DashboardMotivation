import { useEffect, useState } from 'react'
import { RefreshCw, Search, Bell } from 'lucide-react'
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

  return (
    <header className="dash-header">
      <div className="dash-header__search">
        <Search size={16} color="#94a3b8" />
        <input type="text" placeholder="Search location, airport, booking, confirmation..." />
      </div>

      <div className="dash-header__right">
        <div className="dash-header__live">
          <span className="dash-header__live-dot" />
          LIVE
        </div>

        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
          <Bell size={20} />
        </button>

        <div className="dash-header__clock">
          <div className="dash-header__time">{timeStr}</div>
          <div className="dash-header__date">{dateStr}</div>
        </div>

        <button className="dash-header__btn" onClick={onRefresh} title="Refresh now">
          <RefreshCw size={16} />
        </button>
      </div>
    </header>
  )
}