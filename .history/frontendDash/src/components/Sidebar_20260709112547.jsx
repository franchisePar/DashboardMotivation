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

const styles = {
  sidebar: {
    width: '220px',
    background: '#ffffff',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 0',
    flexShrink: 0,
    overflowY: 'auto',
  },
  brands: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0 20px 20px',
    borderBottom: '1px solid #e2e8f0',
    marginBottom: '8px',
  },
  brand: {
    fontWeight: 800,
    fontSize: '14px',
    letterSpacing: '-0.3px',
  },
  brandUnited: { color: '#0f27a2' },
  brandMovis: { color: '#f94231' },
  brandDrivo: { color: '#5a6b0a' },
  divider: { color: '#cbd5e1', fontWeight: 300 },
  nav: {
    padding: '8px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: '10px',
    color: '#64748b',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
    background: 'transparent',
    width: '100%',
    textAlign: 'left',
  },
  itemActive: {
    background: 'rgba(15,39,162,0.06)',
    color: '#0f27a2',
  },
  icon: { width: '18px', height: '18px', opacity: 0.7, flexShrink: 0 },
  iconActive: { opacity: 1 },
}

export function Sidebar() {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.brands}>
        <span style={{ ...styles.brand, ...styles.brandUnited }}>United</span>
        <span style={styles.divider}>|</span>
        <span style={{ ...styles.brand, ...styles.brandMovis }}>MOVIS.</span>
        <span style={styles.divider}>|</span>
        <span style={{ ...styles.brand, ...styles.brandDrivo }}>DRIVO</span>
      </div>
      <nav style={styles.nav}>
        {navItems.map((item) => (
          <button
            key={item.label}
            style={{
              ...styles.item,
              ...(item.active ? styles.itemActive : {}),
            }}
          >
            <item.icon
              size={18}
              strokeWidth={2}
              style={{
                ...styles.icon,
                ...(item.active ? styles.iconActive : {}),
              }}
            />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}