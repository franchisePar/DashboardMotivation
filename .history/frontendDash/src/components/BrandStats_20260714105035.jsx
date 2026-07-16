import { useMemo } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { brandLogo } from '../format'

const BRAND_CONFIG = {
  UNITED: { color: '#0f27a2', bgSoft: '#e8ecf8', textColor: '#0f27a2' },
  MOVIS:  { color: '#f94231', bgSoft: '#fdecea', textColor: '#f94231' },
  DRIVO:  { color: '#a3c520', bgSoft: '#f3f7e0', textColor: '#5a6b0a' },
}

export function BrandStats({ stats }) {
  const brandData = useMemo(() => {
    return Object.entries(stats).map(([brand, data]) => {
      const config = BRAND_CONFIG[brand] || { color: '#64748b', bgSoft: '#f1f5f9', textColor: '#64748b' }
      
      const today = data?.todayBookings ?? 0
      const yesterday = data?.yesterdayBookings ?? 0
      const total = data?.totalBookings ?? 0
      
      const change = yesterday > 0 ? ((today - yesterday) / yesterday) * 100 : 0
      const isUp = change >= 0

      return {
        brand,
        logo: brandLogo(brand),
        color: config.color,
        bgSoft: config.bgSoft,
        textColor: config.textColor,
        todayBookings: today,
        totalBookings: total,
        changePct: Math.abs(change).toFixed(1),
        isUp,
      }
    })
  }, [stats])

  const allZero = brandData.every((b) => b.todayBookings === 0 && b.totalBookings === 0)

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
          padding: '10px 18px',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          minWidth: '180px',
          opacity: allZero ? 0.6 : 1,
        }}>
          {/* Logo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: b.bgSoft,
            flexShrink: 0,
          }}>
            <img
              src={b.logo}
              alt={b.brand}
              style={{ width: 'auto', height: '24px', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none' }}
            />
          </div>

          {/* Numbers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flex: 1 }}>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
              {b.todayBookings.toLocaleString()}
            </span>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 500 }}>
              {b.totalBookings > 0 ? `${b.totalBookings.toLocaleString()} total` : 'Bookings today'}
            </span>
          </div>

          {/* Trend */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            padding: '3px 8px',
            borderRadius: '16px',
            background: b.isUp ? '#dcfce7' : '#fee2e2',
            color: b.isUp ? '#16a34a' : '#dc2626',
            fontSize: '11px',
            fontWeight: 700,
            flexShrink: 0,
          }}>
            {b.isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            <span>{b.changePct}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}