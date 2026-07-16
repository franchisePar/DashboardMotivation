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

export function Sidebar() {
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

  return (
    <aside
      style={{
        width: '220px',
        background: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 0',
        flexShrink: 0,
        overflowY: 'auto',
      }}
    >
      {/* NO BRAND LOGOS HERE — moved to header */}

      <nav
        style={{
          padding: '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
        }}
      >
        {navItems.map((item) => (
          <button
            key={item.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              borderRadius: '10px',
              color: item.active ? '#0f27a2' : '#64748b',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              border: 'none',
              background: item.active ? 'rgba(15,39,162,0.06)' : 'transparent',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <item.icon
              size={18}
              strokeWidth={2}
              style={{ opacity: item.active ? 1 : 0.7, flexShrink: 0 }}
            />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}