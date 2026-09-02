import { BrandLogo } from './BrandLogo'

export function StatCard({ label, value, icon, color, trend, trendValue, sub, sparklineColor }) {
  const points = [10, 25, 20, 35, 30, 45, 40, 55, 50, 60]
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const width = 120
  const height = 40
  const path = points.map((p, i) => {
    const x = (i / (points.length - 1)) * width
    const y = height - ((p - min) / range) * height
    return `${i === 0 ? 'M' : 'L'}${x},${y}`
  }).join(' ')

  return (
    <div className="stat-card">
      <div className="stat-card__header">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__icon" style={{ color }}>{icon}</span>
      </div>

      <div>
        <div className="stat-card__value">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        {sub && <div className="stat-card__sub">{sub}</div>}
      </div>

      <div className="stat-card__footer">
        {trend && trendValue && (
          <span className={`stat-card__trend stat-card__trend--${trend}`}>
            {trendValue}
          </span>
        )}
        <svg className="stat-card__sparkline" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <path d={path} fill="none" stroke={sparklineColor || color} strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}