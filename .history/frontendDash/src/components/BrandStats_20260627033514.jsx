import { brandColor, brandGlow, formatNumber } from '../format'
import './BrandStats.css'

export function BrandStats({ stats }) {
  const brands = ['UNITED', 'MOVIS', 'DRIVO']
  const maxTotal = Math.max(...brands.map(b => stats[b]?.totalBookings || 0), 1)

  return (
    <div className="brand-stats">
      <div className="panel__header">
        <span className="panel__title">Brand Breakdown</span>
        <span className="panel__badge">LIVE</span>
      </div>
      <div className="brand-stats__list">
        {brands.map((brand) => {
          const s = stats[brand] || { totalBookings: 0, todayBookings: 0 }
          const color = brandColor(brand)
          const width = `${(s.totalBookings / maxTotal) * 100}%`

          return (
            <div key={brand} className="brand-stats__row">
              <div className="brand-stats__meta">
                <span
                  className="brand-stats__dot"
                  style={{ background: color, boxShadow: `0 0 8px ${brandGlow(brand)}` }}
                />
                <span className="brand-stats__name">{brand}</span>
                <span className="brand-stats__total">{formatNumber(s.totalBookings)} total</span>
              </div>
              <div className="brand-stats__bar-row">
                <div className="brand-stats__bar-track">
                  <div
                    className="brand-stats__bar-fill"
                    style={{
                      width,
                      background: color,
                      color,
                    }}
                  />
                </div>
                <span className="brand-stats__val" style={{ color }}>
                  {formatNumber(s.todayBookings)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}