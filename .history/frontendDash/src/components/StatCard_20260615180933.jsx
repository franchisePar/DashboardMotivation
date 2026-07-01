import { useEffect, useState } from 'react'
import './StatCard.css'

export default function StatCard({ label, value, subvalue, icon: Icon, color, trend, large }) {
  const [displayValue, setDisplayValue] = useState(value)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (value !== displayValue) {
      setFlash(true)
      setDisplayValue(value)
      const t = setTimeout(() => setFlash(false), 600)
      return () => clearTimeout(t)
    }
  }, [value])

  return (
    <div className={`stat-card ${large ? 'stat-card--large' : ''} ${flash ? 'stat-card--flash' : ''}`}
         style={{ '--card-color': color }}>
      <div className="stat-card__glow" />
      <div className="stat-card__header">
        <span className="stat-card__label">{label}</span>
        {Icon && (
          <div className="stat-card__icon">
            <Icon size={18} strokeWidth={1.6} />
          </div>
        )}
      </div>
      <div className="stat-card__value">{displayValue}</div>
      {subvalue && (
        <div className="stat-card__sub">{subvalue}</div>
      )}
      {trend !== undefined && (
        <div className={`stat-card__trend ${trend >= 0 ? 'up' : 'down'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs yesterday
        </div>
      )}
    </div>
  )
}
