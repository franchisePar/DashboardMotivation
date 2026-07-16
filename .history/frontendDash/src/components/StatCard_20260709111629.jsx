import { useEffect, useRef, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import './StatCard.css'

export function StatCard({ label, value, icon, color, sub, trend, trendValue, sparklineColor }) {
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

  // Generate simple sparkline SVG path
  const sparklinePath = "0,18 10,14 20,16 30,10 40,12 50,6 60,4"

  return (
    <div
      className={`stat-card ${flash ? 'stat-card--flash' : ''}`}
      style={{ '--card-color': color }}
    >
      <div className="stat-card__top">
        <span className="stat-card__label">{label}</span>
        <div className="stat-card__icon" style={{ background: `${color}12`, color }}>
          {icon}
        </div>
      </div>
      
      <div className="stat-card__value">{value}</div>
      
      <div className="stat-card__bottom">
        {trend && (
          <span className={`stat-card__trend ${trend}`}>
            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendValue}
          </span>
        )}
        {sub && <span className="stat-card__sub">{sub}</span>}
        
        {sparklineColor && (
          <svg className="stat-card__sparkline" width="60" height="24" viewBox="0 0 60 24">
            <polyline
              points={sparklinePath}
              fill="none"
              stroke={sparklineColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.6"
            />
          </svg>
        )}
      </div>
    </div>
  )
}