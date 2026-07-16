import { useMemo } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { brandLogo } from '../format'

const BRAND_CONFIG = {
  UNITED: { color: '#0f27a2', textColor: '#0f27a2', bgSoft: '#e8ecf8' },
  MOVIS:  { color: '#f94231', textColor: '#f94231', bgSoft: '#fdecea' },
  DRIVO:  { color: '#a3c520', textColor: '#5a6b0a', bgSoft: '#f3f7e0' },
}

export function BrandStats({ stats }) {
  const brandData = useMemo(() => {
    return Object.entries(stats).map(([brand, data]) => {
      const config = BRAND_CONFIG[brand] || { color: '#64748b', textColor: '#64748b', bgSoft: '#f1f5f9' }
      const today = data.todayBookings ?? 0
      const yesterday = data.yesterdayBookings ?? 0
      const change = yesterday > 0 ? ((today - yesterday) / yesterday) * 100 : 0
      const isUp = change >= 0

      return {
        brand,
        logo: brandLogo(brand),
        color: config.color,
        textColor: config.textColor,
        bgSoft: config.bgSoft,
        todayBookings: today,
        totalBookings: data.totalBookings ?? 0,
        changePct: Math.abs(change).toFixed(1),
        isUp,
      }
    })
  }, [stats])

  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      justifyContent: 'center',
      padding: '12px 16px',
      flexWrap: 'wrap',
    }}>
      {brandData.map((b) => (
        <div key={b.brand} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 20px',
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          minWidth: '200px',
        }}>
          {/* Logo with brand-tinted background */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: b.bgSoft,
            flexShrink: 0,
          }}>
            <img
              src={b.logo}
              alt={b.brand}
              style={{
                width: 'auto',
                height: '28px',
                objectFit: 'contain',
              }}
              onError={(e) => { e.target.style.display = 'none' }}
            />
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
            <span style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              {b.todayBookings.toLocaleString()}
            </span>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
              Bookings today
            </span>
          </div>

          {/* Trend pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            padding: '4px 8px',
            borderRadius: '20px',
            background: b.isUp ? '#dcfce7' : '#fee2e2',
            color: b.isUp ? '#16a34a' : '#dc2626',
            fontSize: '11px',
            fontWeight: 700,
            flexShrink: 0,
          }}>
            {b.isUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            <span>{b.changePct}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}