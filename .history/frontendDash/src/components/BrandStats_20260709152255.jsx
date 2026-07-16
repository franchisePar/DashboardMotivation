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

  const latestBooking = {
    country: 'Morocco', code: 'RAK',
    flag: 'https://flagcdn.com/w80/ma.png',
    confirmation: 'M200014356',
    airport: 'Marrakech Airport (RAK)',
    car: 'Dacia Logan',
    time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    brand: 'United', brandColor: '#0f27a2',
  }

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
      {/* Map Container */}
      <div style={{
        flex: 1,
        position: 'relative',
        background: '#e8ecf4',
        overflow: 'hidden',
        borderRadius: '14px',
      }}>
       import { LiveMap } from './LiveMap'

        {/* New Reservation Popup */}
        <div style={{
          position: 'absolute', top: '16px', right: '16px',
          background: '#ffffff', borderRadius: '14px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0', padding: '18px', width: '260px', zIndex: 10,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
              New Reservation
            </span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 2px rgba(34,197,94,0.2)' }} />
              LIVE
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <img src={latestBooking.flag} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} alt={latestBooking.country} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{latestBooking.country} – {latestBooking.code}</div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: latestBooking.brandColor }}>United rent a car</div>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.8 }}>
            <div><strong style={{ color: '#1e293b', fontWeight: 600 }}>Confirmation</strong> <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{latestBooking.confirmation}</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {latestBooking.airport}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>
              {latestBooking.car}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {latestBooking.time}
            </div>
          </div>
        </div>

        {/* Brand Circles at bottom */}
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