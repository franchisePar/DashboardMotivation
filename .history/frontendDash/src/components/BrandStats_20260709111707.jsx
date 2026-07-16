import { useMemo } from 'react'
import { TrendingUp } from 'lucide-react'
import { brandColor } from '../format'
import './BrandStats.css'

const BRAND_CONFIG = {
  UNITED: { name: 'United', color: '#0f27a2', light: 'rgba(15,39,162,0.08)' },
  MOVIS:  { name: 'MOVIS.', color: '#f94231', light: 'rgba(249,66,49,0.08)' },
  DRIVO:  { name: 'DRIVO', color: '#a3c520', light: 'rgba(163,197,32,0.10)', textColor: '#5a6b0a' },
}

// Simplified world map SVG paths
const CONTINENTS = [
  // North America
  "M120,80 Q180,60 220,80 L240,120 L200,160 L160,150 L140,180 L100,160 L80,120 Z",
  // South America
  "M180,200 L220,200 L240,260 L200,340 L170,300 L160,240 Z",
  // Europe
  "M360,70 L420,60 L440,100 L400,120 L370,110 L350,90 Z",
  // Africa
  "M360,140 L420,140 L440,200 L400,280 L360,260 L340,200 Z",
  // Asia
  "M460,60 L580,50 L620,100 L600,160 L540,180 L500,160 L480,120 Z",
  // Middle East
  "M440,120 L480,120 L490,150 L450,160 Z",
  // Australia
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
    <div className="brand-circle__ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <span className="brand-circle__pct" style={{ color: '#1e293b' }}>
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

  // Demo new reservation popup data
  const latestBooking = {
    country: 'Morocco',
    code: 'RAK',
    flag: 'https://flagcdn.com/w80/ma.png',
    confirmation: 'M200014356',
    airport: 'Marrakech Airport (RAK)',
    car: 'Dacia Logan',
    time: '12:14:52',
    brand: 'United',
    brandColor: '#0f27a2',
  }

  return (
    <div className="brand-stats">
      {/* World Map */}
      <div className="brand-stats__map">
        <svg className="brand-stats__map-svg" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="mapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e8ecf4" />
              <stop offset="100%" stopColor="#c8d0e0" />
            </linearGradient>
            <filter id="mapGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {CONTINENTS.map((d, i) => (
            <path key={i} d={d} fill="url(#mapGrad)" opacity="0.5" />
          ))}

          {CONNECTIONS.map((conn, i) => (
            <line
              key={`line-${i}`}
              x1={conn.x1} y1={conn.y1} x2={conn.x2} y2={conn.y2}
              stroke={conn.color}
              strokeWidth="1"
              opacity="0.25"
              strokeDasharray="4 4"
              className="map-connection"
            />
          ))}

          {MAP_DOTS.map((dot, i) => (
            <g key={`dot-${i}`}>
              <circle
                cx={dot.x}
                cy={dot.y}
                r="4"
                fill={dot.color}
                filter="url(#mapGlow)"
                className="map-dot"
              />
              {dot.label && (
                <text
                  x={dot.x}
                  y={dot.y - 10}
                  textAnchor="middle"
                  fontSize="9"
                  fill={dot.color}
                  fontWeight="600"
                >
                  {dot.label}
                </text>
              )}
            </g>
          ))}
        </svg>

        {/* New Reservation Popup */}
        <div className="new-res-popup">
          <div className="new-res-popup__header">
            <span className="new-res-popup__title">New Reservation</span>
            <span className="new-res-popup__live">
              <span className="new-res-popup__live-dot" />
              LIVE
            </span>
          </div>
          <div className="new-res-popup__body">
            <img src={latestBooking.flag} className="new-res-popup__flag" alt={latestBooking.country} />
            <div className="new-res-popup__info">
              <div className="new-res-popup__loc">
                {latestBooking.country} – {latestBooking.code}
              </div>
              <div className="new-res-popup__brand" style={{ color: latestBooking.brandColor }}>
                {latestBooking.brand} rent a car
              </div>
            </div>
          </div>
          <div className="new-res-popup__details">
            <div><strong>Confirmation</strong> {latestBooking.confirmation}</div>
            <div>📍 {latestBooking.airport}</div>
            <div>🚗 {latestBooking.car}</div>
            <div>🕐 {latestBooking.time}</div>
          </div>
        </div>

        {/* Brand Circles */}
        <div className="brand-circles">
          {brandData.map((b) => (
            <div key={b.brand} className="brand-circle-card">
              <CircularProgress percentage={b.percentage} color={b.color} />
              <div className="brand-circle-card__info">
                <div className="brand-circle-card__name" style={{ color: b.textColor }}>
                  {b.name}
                </div>
                <div className="brand-circle-card__count">
                  {b.todayBookings.toLocaleString()} Bookings
                </div>
                <div className="brand-circle-card__trend up">
                  <TrendingUp size={10} />
                  +{Math.floor(Math.random() * 20 + 5)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}