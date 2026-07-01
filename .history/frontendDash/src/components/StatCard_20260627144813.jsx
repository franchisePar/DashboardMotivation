import { useEffect, useRef, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import './StatCard.css'

export function StatCard({ label, value, icon, color, sub, trend, trendValue, large, logo }) {
  const [flash, setFlash] = useState(false)
  const prevValue = useRef(value)

  useEffect(() => {
    if (prevValue.current !== value) {
      setFlash(true)
      const timer = setTimeout(() => setFlash(false), 600)
      prevValue.current = value
      return () => clearTimeout(timer)
    }
  }, [value])

  return (
    <div
      className={`stat-card ${flash ? 'stat-card--flash' : ''} ${large ? 'stat-card--large' : ''}`}
      style={{ '--card-color': color }}
    >
      <div className="stat-card__glow" />
      <div className="stat-card__header">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__icon">{icon}</span>
      </div>
      
      {/* VALUE with optional brand logo */}
      <div className="stat-card__value-row">
        {logo && (
          <img 
            src={logo} 
            alt={String(value)}
            style={{  
              height: '16px', 
              objectFit: 'contain',
              borderRadius: '3px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(0,0,0,0.3)',
              padding: '1px',
              flexShrink: 0
            }}
            onError={(e) => { e.target.style.display = 'none' }}
          />
        )}
        <div className="stat-card__value"></div>
      </div>
      
      {sub && <div className="stat-card__sub">{sub}</div>}
      {trend && (
        <div className={`stat-card__trend ${trend}`}>
          {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {trendValue}
        </div>
      )}
    </div>
  )
}