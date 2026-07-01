import { useEffect, useRef, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import './StatCard.css'

export function StatCard({ label, value, icon, color, sub, trend, trendValue, large }) {
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
      <div className="stat-card__value">{value}</div>
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