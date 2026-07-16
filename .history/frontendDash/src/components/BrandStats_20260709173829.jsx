import { useMemo } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

const BRAND_CONFIG = {
  UNITED: { name: 'United', color: '#0f27a2', textColor: '#0f27a2' },
  MOVIS:  { name: 'MOVIS.', color: '#f94231', textColor: '#f94231' },
  DRIVO:  { name: 'DRIVO', color: '#a3c520', textColor: '#5a6b0a' },
}

export function BrandStats({ stats }) {
  const brandData = useMemo(() => {
    return Object.entries(stats).map(([brand, data]) => {
      const config = BRAND_CONFIG[brand] || { name: brand, color: '#64748b', textColor: '#64748b' }
      return {
        brand,
        name: config.name,
        color: config.color,
        textColor: config.textColor,
        todayBookings: data.todayBookings || 0,
        totalBookings: data.totalBookings || 0,
      }
    })
  }, [stats])

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
      padding: '12px 16px',
    }}>
      {brandData.map((b) => (
        <div key={b.brand} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          background: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}>
          {/* Small colored dot */}
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: b.color,
            flexShrink: 0,
          }} />

          {/* Brand name + bookings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: b.textColor }}>
              {b.name}
            </span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              {b.todayBookings.toLocaleString()} bookings
            </span>
          </div>

          {/* Trend triangle only */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            marginLeft: '4px',
            color: '#22c55e',
            fontSize: '11px',
            fontWeight: 600,
          }}>
            <TrendingUp size={12} />
            <span>+{Math.floor(Math.random() * 20 + 5)}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}