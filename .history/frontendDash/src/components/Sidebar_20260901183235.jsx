import { useState, useEffect } from 'react'
import {
  Zap, Calendar, MapPin, Car, FileText,
  BarChart3, Bell, Users, Settings, Sun, Moon,
} from 'lucide-react'

export function Sidebar() {
  const [activeLabel, setActiveLabel] = useState('Live Dashboard')
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme')
      if (saved) return saved
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  const navItems = [
    { icon: Zap, label: 'Live Dashboard', brand: 'united' },
    { icon: Calendar, label: 'Reservations', brand: 'united' },
    { icon: Calendar, label: 'Calendar', brand: 'united' },
    { icon: MapPin, label: 'Locations', brand: 'movis' },
    { icon: Car, label: 'Fleet', brand: 'movis' },
    { icon: FileText, label: 'Reports', brand: 'drivo' },
    { icon: BarChart3, label: 'Analytics', brand: 'drivo' },
    { icon: Bell, label: 'Alerts', brand: 'united' },
    { icon: Users, label: 'Users', brand: 'movis' },
    { icon: Settings, label: 'Settings', brand: 'drivo' },
  ]

  const getBrandColor = (brand, isActive) => {
    if (!isActive) return 'var(--text-secondary)'
    if (brand === 'movis') return '#f94231'
    if (brand === 'drivo') return '#c8fa1b'
    return 'var(--united)'
  }

  return (
    <aside className="sidebar">
      
      {/* Navigation */}
      <nav className="sidebar__nav">
        {navItems.map((item) => {
          const isActive = activeLabel === item.label
          const Icon = item.icon
          const brandColor = getBrandColor(item.brand, isActive)

          return (
            <button
              key={item.label}
              className={`sidebar__item ${isActive ? 'sidebar__item--active' : ''}`}
              onClick={() => setActiveLabel(item.label)}
              title={item.label}
            >
              <span
                className="sidebar__item-icon"
                style={{ color: brandColor }}
              >
                <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
              </span>
              <span className="sidebar__item-label">{item.label}</span>
              
              {/* Active indicator pill */}
              {isActive && <span className="sidebar__item-indicator" style={{ background: brandColor }} />}
            </button>
          )
        })}
      </nav>

      {/* Theme Toggle - Always visible at bottom */}
      <div className="sidebar__footer">
        <button className="sidebar__theme-btn" onClick={toggleTheme} title="Toggle theme">
          <span className="sidebar__theme-icon">
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </span>
          <span className="sidebar__theme-label">
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </span>
        </button>
      </div>
    </aside>
  )
}