import { useMemo } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { brandLogo } from '../format'

const BRAND_CONFIG = {
  UNITED: { color: '#0f27a2', bgSoft: '#e8ecf8', ringColor: '#1827a2' },
  MOVIS:  { color: '#f94231', bgSoft: '#fdecea', ringColor: '#f94231' },
  DRIVO:  { color: '#c8fa1b', bgSoft: '#f3f7e0', ringColor: '#c8fa1b' },
}

function Ring({ percentage, color, size = 52 }) {
  const stroke = 4
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = c - (percentage / 100) * c

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={dash}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
    </svg>
  )
}

export function BrandStats({ stats }) {
  const brandData = useMemo(() => {
    const entries = Object.entries(stats)
    const totalToday = entries.reduce((sum, [, d]) => sum + (d?.todayBookings ?? 0), 0) || 1

    return entries.map(([brand, data]) => {
      const config = BRAND_CONFIG[brand] || { color: '#64748b', bgSoft: '#f1f5f9', ringColor: '#64748b' }
      const today = data?.todayBookings ?? 0
      const yesterday = data?.yesterdayBookings ?? 0
      const total = data?.totalBookings ?? 0
      const pct = totalToday > 0 ? Math.round((today / totalToday) * 100) : 0
      const change = yesterday > 0 ? ((today - yesterday) / yesterday) * 100 : 0
      const isUp = change >= 0

      return {
        brand,
        logo: brandLogo(brand),
        color: config.color,
        ringColor: config.ringColor,
        todayBookings: today,
        totalBookings: total,
        percentage: pct,
        changePct: Math.abs(change).toFixed(1),
        isUp,
      }
    })
  }, [stats])

  return (
    <div style={{
      display: 'flex',
      gap: '20px',
      justifyContent: 'space-around',
      padding: '16px 24px',
      flexWrap: 'wrap',
      background: '#ffffff',
      borderTop: '1px solid #e2e8f0',
    }}>
      {brandData.map((b) => (
        <div key={b.brand} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '8px 16px',
          minWidth: '200px',
        }}>
          {/* Ring */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Ring percentage={b.percentage} color={b.ringColor} size={48} />
            <span style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '11px', fontWeight: 800, color: b.color,
            }}>
              {b.percentage}%
            </span>
          </div>

          {/* Logo + Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
            

            {/* Numbers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {/* Brand Logo */}
            <img
              src={b.logo}
              alt={b.brand}
              style={{
                height: '24px',
                width: 'auto',
                objectFit: 'contain',
                flexShrink: 0,
              }}
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                {b.todayBookings.toLocaleString()}
              </span>
              <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                {b.totalBookings > 0 ? `${b.totalBookings.toLocaleString()} total` : 'Bookings'}
              </span>
            </div>
          </div>

          {/* Trend */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '2px',
            padding: '3px 8px', borderRadius: '12px',
            background: b.isUp ? '#dcfce7' : '#fee2e2',
            color: b.isUp ? '#16a34a' : '#dc2626',
            fontSize: '10px', fontWeight: 700,
            flexShrink: 0,
          }}>
            {b.isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            <span>{b.changePct}%</span>
          </div>
        </div>
      ))}
    </div>
  )
}