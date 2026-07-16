import { useMemo } from 'react'
import { TrendingUp } from 'lucide-react'
import { LiveMap } from './LiveMap'

const BRAND_CONFIG = {
  UNITED: { name: 'United', color: '#0f27a2', light: 'rgba(15,39,162,0.08)' },
  MOVIS:  { name: 'MOVIS.', color: '#f94231', light: 'rgba(249,66,49,0.08)' },
  DRIVO:  { name: 'DRIVO', color: '#a3c520', light: 'rgba(163,197,32,0.10)', textColor: '#5a6b0a' },
}

function CircularProgress({ percentage, color, size = 64, strokeWidth = 5 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <span style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        fontSize: '13px', fontWeight: 800, color: '#1e293b',
      }}>
        {percentage}%
      </span>
    </div>
  )
}

export function BrandStats({ stats, bookings = [] }) {
  const totalToday = useMemo(() => {
    return Object.values(stats).reduce((sum, s) => sum + (s.todayBookings || 0), 0)
  }, [stats])

  const brandData = useMemo(() => {
    return Object.entries(stats).map(([brand, data]) => {
      const config = BRAND_CONFIG[brand] || { name: brand, color: '#64748b', light: '#f1f5f9' }
      const pct = totalToday > 0 ? Math.round((data.todayBookings / totalToday) * 100) : 0
      return {
        brand, name: config.name, color: config.color, light: config.light,
        textColor: config.textColor || config.color,
        todayBookings: data.todayBookings || 0,
        totalBookings: data.totalBookings || 0,
        percentage: pct,
      }
    })
  }, [stats, totalToday])

  return (
    <div style={{
      flex: 1.4,
      background: '#ffffff',
      borderRadius: '14px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
      border: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflow: 'hidden',
      minHeight: 0,
    }}>
      <div style={{
        flex: 1,
        position: 'relative',
        background: '#e8ecf4',
        overflow: 'hidden',
        borderRadius: '14px',
      }}>
        <LiveMap bookings={bookings} />

        <div style={{
          position: 'absolute', bottom: '16px', left: '16px', right: '16px',
          display: 'flex', gap: '12px', justifyContent: 'center',
        }}>
          {brandData.map((b) => (
            <div key={b.brand} style={{
              background: '#ffffff', borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
              border: '1px solid #e2e8f0', padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: '14px', flex: 1, maxWidth: '200px',
            }}>
              <CircularProgress percentage={b.percentage} color={b.color} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: b.textColor }}>{b.name}</div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{b.todayBookings.toLocaleString()} Bookings</div>
                <div style={{ fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px', color: '#22c55e' }}>
                  <TrendingUp size={10} /> +{Math.floor(Math.random() * 20 + 5)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}