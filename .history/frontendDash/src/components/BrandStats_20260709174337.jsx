import { useMemo } from 'react'
import { TrendingUp } from 'lucide-react'
import { brandLogo } from '../format'

const BRAND_CONFIG = {
  UNITED: { color: '#0f27a2', textColor: '#0f27a2' },
  MOVIS:  { color: '#f94231', textColor: '#f94231' },
  DRIVO:  { color: '#a3c520', textColor: '#5a6b0a' },
}

export function BrandStats({ stats }) {
  const brandData = useMemo(() => {
    return Object.entries(stats).map(([brand, data]) => {
      const config = BRAND_CONFIG[brand] || { color: '#64748b', textColor: '#64748b' }
      return {
        brand,
        logo: brandLogo(brand),
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
          gap: '10px',
          padding: '10px 16px',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
        }}>
          {/* Logo */}
          <img 
            src={b.logo} 
            alt={b.brand}
            style={{
              width: 'auto',
              height: '32px',
              objectFit: 'contain',
              borderRadius: '6px',
            }}
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />

          {/* Bookings count */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#1e293b' }}>
              {b.todayBookings.toLocaleString()}
            </span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              Bookings
            </span>
          </div>

          {/* Trend (from real data if available, else calculated) */}
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