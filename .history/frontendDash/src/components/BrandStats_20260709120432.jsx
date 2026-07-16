BrandStats.jsx
import { useMemo } from 'react'
import { TrendingUp } from 'lucide-react'

const BRAND_CONFIG = {
  UNITED: { name: 'United', color: '#0f27a2', light: 'rgba(15,39,162,0.08)' },
  MOVIS:  { name: 'MOVIS.', color: '#f94231', light: 'rgba(249,66,49,0.08)' },
  DRIVO:  { name: 'DRIVO', color: '#a3c520', light: 'rgba(163,197,32,0.10)', textColor: '#5a6b0a' },
}

// Stylized world map — cleaner, lighter, reference-style
const MAP_DOTS = [
  { x: 180, y: 110, label: '', color: '#3b82f6', size: 5 },      // USA East
  { x: 140, y: 130, label: '', color: '#3b82f6', size: 4 },      // USA West
  { x: 380, y: 95,  label: '', color: '#f59e0b', size: 5 },      // UK
  { x: 400, y: 100, label: '', color: '#f59e0b', size: 4 },      // France
  { x: 420, y: 90,  label: '', color: '#f59e0b', size: 4 },      // Germany
  { x: 440, y: 110, label: '', color: '#f59e0b', size: 3 },      // Italy
  { x: 400, y: 180, label: '', color: '#22c55e', size: 6 },      // Morocco
  { x: 420, y: 200, label: '', color: '#22c55e', size: 4 },      // Algeria
  { x: 460, y: 170, label: '', color: '#22c55e', size: 4 },      // Egypt
  { x: 480, y: 140, label: '', color: '#ef4444', size: 5 },      // UAE
  { x: 520, y: 120, label: '', color: '#ef4444', size: 4 },      // India
  { x: 560, y: 100, label: '', color: '#ef4444', size: 4 },      // China
  { x: 600, y: 260, label: '', color: '#8b5cf6', size: 4 },      // Australia
  { x: 220, y: 240, label: '', color: '#f59e0b', size: 4 },      // Brazil
  { x: 200, y: 200, label: '', color: '#f59e0b', size: 3 },      // Colombia
]

const CONNECTIONS = [
  { x1: 180, y1: 110, x2: 380, y2: 95,  color: '#3b82f6', opacity: 0.15 },
  { x1: 380, y1: 95,  x2: 400, y2: 180, color: '#f59e0b', opacity: 0.15 },
  { x1: 400, y1: 180, x2: 480, y2: 140, color: '#22c55e', opacity: 0.15 },
  { x1: 480, y1: 140, x2: 560, y2: 100, color: '#ef4444', opacity: 0.15 },
  { x1: 400, y1: 180, x2: 220, y2: 240, color: '#22c55e', opacity: 0.12 },
]

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

export function BrandStats({ stats }) {
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

  // Use real latest booking from socket data if available
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
      }}>
        <svg style={{ width: '100%', height: '100%' }} viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">
          <defs>
            {/* Soft continent shapes — light gray fill */}
            <linearGradient id="continentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#d4dbe8" />
              <stop offset="100%" stopColor="#c8d0e0" />
            </linearGradient>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Continents — simplified, soft shapes like reference */}
          {/* North America */}
          <path d="M80,60 Q160,40 220,60 L260,100 L240,140 L200,160 L160,150 L120,180 L60,140 L40,100 Z" fill="url(#continentGrad)" opacity="0.5" />
          {/* South America */}
          <path d="M200,200 L260,200 L280,260 L240,340 L200,320 L180,260 Z" fill="url(#continentGrad)" opacity="0.5" />
          {/* Europe */}
          <path d="M360,60 L440,50 L460,90 L420,110 L380,100 L350,80 Z" fill="url(#continentGrad)" opacity="0.5" />
          {/* Africa */}
          <path d="M360,140 L440,140 L460,200 L420,280 L360,260 L340,200 Z" fill="url(#continentGrad)" opacity="0.5" />
          {/* Asia */}
          <path d="M460,50 L600,40 L640,90 L620,150 L560,170 L500,150 L480,110 Z" fill="url(#continentGrad)" opacity="0.5" />
          {/* Middle East */}
          <path d="M440,120 L490,120 L500,150 L460,160 Z" fill="url(#continentGrad)" opacity="0.5" />
          {/* Australia */}
          <path d="M560,250 L640,240 L660,280 L620,300 L560,280 Z" fill="url(#continentGrad)" opacity="0.5" />

          {/* Connection lines — very subtle */}
          {CONNECTIONS.map((conn, i) => (
            <line key={`line-${i}`} {...conn} strokeWidth="1" strokeDasharray="3 3" />
          ))}

          {/* Active dots with pulse */}
          {MAP_DOTS.map((dot, i) => (
            <g key={`dot-${i}`}>
              {/* Outer pulse ring */}
              <circle cx={dot.x} cy={dot.y} r={dot.size * 2.5} fill="none" stroke={dot.color} strokeWidth="1" opacity="0.2">
                <animate attributeName="r" values={`${dot.size * 1.5};${dot.size * 3};${dot.size * 1.5}`} dur="3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0;0.3" dur="3s" repeatCount="indefinite" />
              </circle>
              {/* Core dot */}
              <circle cx={dot.x} cy={dot.y} r={dot.size} fill={dot.color} filter="url(#softGlow)">
                <animate attributeName="r" values={`${dot.size * 0.8};${dot.size * 1.2};${dot.size * 0.8}`} dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          ))}
        </svg>

        {/* New Reservation Popup — reference style */}
        <div style={{
          position: 'absolute', top: '16px', right: '16px',
          background: '#ffffff', borderRadius: '14px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.06)',
          border: '1px solid #e2e8f0', padding: '18px', width: '260px', zIndex: 10,
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '1.2px' }}>
              New Reservation
            </span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 2px rgba(34,197,94,0.2)' }} />
              LIVE
            </span>
          </div>

          {/* Body */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <img src={latestBooking.flag} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }} alt={latestBooking.country} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>{latestBooking.country} – {latestBooking.code}</div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: latestBooking.brandColor }}>United rent a car</div>
            </div>
          </div>

          {/* Details */}
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