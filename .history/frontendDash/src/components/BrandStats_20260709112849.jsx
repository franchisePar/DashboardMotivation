import { useMemo } from 'react'
import { TrendingUp } from 'lucide-react'
import './BrandStats.css'  /* KEEP THIS - you'll create it below */

const BRAND_CONFIG = {
  UNITED: { name: 'United', color: '#0f27a2', light: 'rgba(15,39,162,0.08)' },
  MOVIS:  { name: 'MOVIS.', color: '#f94231', light: 'rgba(249,66,49,0.08)' },
  DRIVO:  { name: 'DRIVO', color: '#a3c520', light: 'rgba(163,197,32,0.10)', textColor: '#5a6b0a' },
}

const CONTINENTS = [
  "M120,80 Q180,60 220,80 L240,120 L200,160 L160,150 L140,180 L100,160 L80,120 Z",
  "M180,200 L220,200 L240,260 L200,340 L170,300 L160,240 Z",
  "M360,70 L420,60 L440,100 L400,120 L370,110 L350,90 Z",
  "M360,140 L420,140 L440,200 L400,280 L360,260 L340,200 Z",
  "M460,60 L580,50 L620,100 L600,160 L540,180 L500,160 L480,120 Z",
  "M440,120 L480,120 L490,150 L450,160 Z",
  "M580,260 L640,250 L660,290 L620,310 L580,290 Z",
]

const MAP_DOTS = [
  { x: 200, y: 100, label: 'USA', color: '#3b82f6' },
  { x: 400, y: 90, label: 'EUR', color: '#f59e0b' },
  { x: 400, y: 200, label: 'MOR', color: '#22c55e' },
  { x: 520, y: 100, label: 'UAE', color: '#ef4444' },
  { x: 610, y: 280, label: 'AUS', color: '#8b5cf6' },
  { x: 220, y: 260, label: '', color: '#f59e0b' },
  { x: 460, y: 140, label: '', color: '#3b82f6' },
]

const CONNECTIONS = [
  { x1: 200, y1: 100, x2: 400, y2: 90, color: '#3b82f6' },
  { x1: 400, y1: 90, x2: 520, y2: 100, color: '#3b82f6' },
  { x1: 400, y1: 90, x2: 400, y2: 200, color: '#f59e0b' },
  { x1: 200, y1: 100, x2: 400, y2: 200, color: '#22c55e' },
  { x1: 520, y1: 100, x2: 610, y2: 280, color: '#8b5cf6' },
]

function CircularProgress({ percentage, color, size = 64, strokeWidth = 5 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <span style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '13px', fontWeight: 800, color: '#1e293b',
      }}>
        {percentage}%
      </span>
    </div>
  )
}

export function BrandStats({ stats }) {
  const totalToday = useMemo(() => {
    return Object.values(stats).reduce((sum, s) => sum + (s.todayBookings || 0), 0)
  }, [stats])

  const brandData = useMemo(() => {
    return Object.entries(stats).map(([brand, data]) => {
      const config = BRAND_CONFIG[brand] || { name: brand, color: '#64748b', light: '#f1f5f9' }
      const pct = totalToday > 0 ? Math.round((data.todayBookings / totalToday) * 100) : 0
      return {
        brand,
        name: config.name,
        color: config.color,
        light: config.light,
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
    car: 'Dacia Logan', time: '12:14:52',
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
      <div style={{
        flex: 1,
        position: 'relative',
        background: 'linear-gradient(135deg, #e8ecf4 0%, #d4dbe8 50%, #e8ecf4 100%)',
        overflow: 'hidden',
      }}>
        <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="mapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d4dbe8" />
              <stop offset="100%" stopColor="#c8d0e0" />
            </linearGradient>
            <filter id="mapGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {CONTINENTS.map((d, i) => (
            <path key={i} d={d} fill="url(#mapGrad)" opacity="0.5" />
          ))}

          {CONNECTIONS.map((conn, i) => (
            <line key={`line-${i}`} {...conn} strokeWidth="1" opacity="0.25" strokeDasharray="4 4" />
          ))}

          {MAP_DOTS.map((dot, i) => (
            <g key={`dot-${i}`}>
              <circle cx={dot.x} cy={dot.y} r="4" fill={dot.color} filter="url(#mapGlow)">
                <animate attributeName="r" values="3;5;3" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite" />
              </circle>
              {dot.label && (
                <text x={dot.x} y={dot.y - 10} textAnchor="middle" fontSize="9" fill={dot.color} fontWeight="600">
                  {dot.label}
                </text>
              )}
            </g>
          ))}
        </svg>

        {/* New Reservation Popup */}
        <div style={{
          position: 'absolute', top: '16px', right: '16px',
          background: '#ffffff', borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0', padding: '16px', width: '260px', zIndex: 10,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '1px' }}>
              New Reservation
            </span>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
              LIVE
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <img src={latestBooking.flag} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} alt={latestBooking.country} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{latestBooking.country} – {latestBooking.code}</div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: latestBooking.brandColor }}>{latestBooking.brand} rent a car</div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.7 }}>
            <div><strong style={{ color: '#1e293b', fontWeight: 600 }}>Confirmation</strong> {latestBooking.confirmation}</div>
            <div>📍 {latestBooking.airport}</div>
            <div>🚗 {latestBooking.car}</div>
            <div>🕐 {latestBooking.time}</div>
          </div>
        </div>

        {/* Brand Circles */}
        <div style={{
          position: 'absolute', bottom: '16px', left: '16px', right: '16px',
          display: 'flex', gap: '12px', justifyContent: 'center',
        }}>
          {brandData.map((b) => (
            <div key={b.brand} style={{
              background: '#ffffff', borderRadius: '10px',
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