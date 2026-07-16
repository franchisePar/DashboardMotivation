import {
  Zap,
  Calendar,
  MapPin,
  Car,
  FileText,
  BarChart3,
  Bell,
  Users,
  Settings,
} from 'lucide-react'
import './Sidebar.css'

const navItems = [
  { icon: Zap, label: 'Live Dashboard', active: true },
  { icon: Calendar, label: 'Reservations' },
  { icon: Calendar, label: 'Calendar' },
  { icon: MapPin, label: 'Locations' },
  { icon: Car, label: 'Fleet' },
  { icon: FileText, label: 'Reports' },
  { icon: BarChart3, label: 'Analytics' },
  { icon: Bell, label: 'Alerts' },
  { icon: Users, label: 'Users' },
  { icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brands">
        <span className="sidebar__brand sidebar__brand--united">United</span>
        <span className="sidebar__divider">|</span>
        <span className="sidebar__brand sidebar__brand--movis">MOVIS.</span>
        <span className="sidebar__divider">|</span>
        <span className="sidebar__brand sidebar__brand--drivo">DRIVO</span>
      </div>
      <nav className="sidebar__nav">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`sidebar__item ${item.active ? 'active' : ''}`}
          >
            <item.icon size={18} strokeWidth={2} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}