import { useMemo, useState, useEffect } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

const BRAND_CONFIG = {
  UNITED: { 
    color: '#0f27a2',
    colorDark: '#ffffff',
    ringColor: '#0f27a2',
    ringColorDark: '#60a5fa',
    logo: '/assets/logos/United_Logo_BG.png',
    logoDark: '/assets/logos/united-white-Logo.png',
  },
  MOVIS:  { 
    color: '#f94231',
    colorDark: '#f94231',
    ringColor: '#f94231',
    ringColorDark: '#f94231',
    logo: '/assets/logos/Movis_Logo_BG.png',
    logoDark: '/assets/logos/Movis_Logo_BG.png',
  },
  DRIVO:  { 
    color: '#c8fa1b',
    colorDark: '#c8fa1b',
    ringColor: '#a3c520',
    ringColorDark: '#c8fa1b',
    logo: '/assets/logos/Drivo_Logo_BG.png',
    logoDark: '/assets/logos/Drivo_Logo_BG.png',
  },
}

function Ring({ percentage, color, size = 52 }) {
  const stroke = 4
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = c - (percentage / 100) * c

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={dash}
        style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
    </svg>
  )
}

export function BrandStats({ stats }) {
  const [isDark, setIsDark] = useState(false)

  // Listen for theme changes
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark')
    }
    checkTheme()
    
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    
    return () => observer.disconnect()
  }, [])

  const brandData = useMemo(() => {
    const entries = Object.entries(stats)
    const totalToday = entries.reduce((sum, [, d]) => sum + (d?.todayBookings ?? 0), 0) || 1

    return entries.map(([brand, data]) => {
      const config = BRAND_CONFIG[brand] || BRAND_CONFIG.UNITED
      
      const color = isDark ? config.colorDark : config.color
      const ringColor = isDark ? config.ringColorDark : config.ringColor
      const logo = isDark ? config.logoDark : config.logo
      
      const today = data?.todayBookings ?? 0
      const yesterday = data?.yesterdayBookings ?? 0
      const total = data?.totalBookings ?? 0
      const pct = totalToday > 0 ? Math.round((today / totalToday) * 100) : 0
      const change = yesterday > 0 ? ((today - yesterday) / yesterday) * 100 : 0
      const isUp = change >= 0

      return {
        brand,
        logo,
        color,
        ringColor,
        todayBookings: today,
        totalBookings: total,
        percentage: pct,
        changePct: Math.abs(change).toFixed(1),
        isUp,
      }
    })
  }, [stats, isDark])

  return (
    <div style={{
      display: 'flex',
      gap: '20px',
      justifyContent: 'space-around',
      padding: '16px 24px',
      flexWrap: 'wrap',
      background: 'var(--bg-card)',
      borderTop: '1px solid var(--border)',
    }}>
      {brandData.map((b) => (
        <div key={b.brand} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '8px 16px',
          minWidth: '200px',
        }}>
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
            <img
              src={b.logo}
              alt={b.brand}
              style={{
                height: '18px',
                width: 'auto',
                objectFit: 'contain',
                flexShrink: 0,
                filter: isDark && b.brand === 'UNITED' ? 'brightness(0) invert(1)' : 'none',
              }}
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <span style={{ fontSize: '20px', fontWeight: 800, color: b.color, lineHeight: 1.2 }}>
                {b.todayBookings.toLocaleString()}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--muted)' }}>
                {b.totalBookings > 0 ? `${b.totalBookings.toLocaleString()} total` : 'Bookings'}
              </span>
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '2px',
            padding: '3px 8px', borderRadius: '12px',
            background: b.isUp ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: b.isUp ? 'var(--success)' : 'var(--danger)',
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