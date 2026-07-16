import { useMemo } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { brandLogo } from '../format'

const BRAND_CONFIG = {
  UNITED: { color: '#0f27a2', bgSoft: '#e8ecf8', ringColor: '#0f27a2' },
  MOVIS:  { color: '#f94231', bgSoft: '#fdecea', ringColor: '#f94231' },
  DRIVO:  { color: '#a3c520', bgSoft: '#f3f7e0', ringColor: '#a3c520' },
}

function Ring({ percentage, color, size = 48 }) {
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
      const pct = Math.round((today / totalToday) * 100)
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

  const allZero = brandData.every(b => b.todayBookings === 0)

  return (
    <div style={{
      display: 'flex',
      gap: '20px',
      justifyContent: 'center',
      padding: '16px 24px',
      flexWrap: 'wrap',
    }}>
      {brandData.map((b) => (
        <div key={b.brand} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '14px 24px',
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          minWidth: '240px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          opacity: allZero ? 0.5 : 1,
        }}>
          {/* Ring with percentage inside */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <Ring percentage={b.percentage} color={b.ringColor} size={52} />
            <span style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '11px', fontWeight: 800, color: b.color,
            }}>
              {b.percentage}%
            </span>
          </div>

          {/* Brand info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src={b.logo} alt={b.brand} style={{ height: '14px', width: 'auto' }} onError={e => e.target.style.display='none'} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                {b.brand}
              </span>
            </div>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
              {b.todayBookings.toLocaleString()}
            </span>
            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 500 }}>
              {b.totalBookings > 0 ? `${b.totalBookings.toLocaleString()} total bookings` : 'Bookings'}
            </span>
          </div>

          {/* Trend pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '3px',
            padding: '4px 10px', borderRadius: '20px',
            background: b.isUp ? '#dcfce7' : '#fee2e2',
            color: b.isUp ? '#16a34a' : '#dc2626',
            fontSize: '11px', fontWeight: 700,
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