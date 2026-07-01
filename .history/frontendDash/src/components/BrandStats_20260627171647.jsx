import { brandColor, brandGlow, brandLogo, formatNumber } from '../format'
import './BrandStats.css'

export function BrandStats({ stats }) {
  const brands = ['UNITED', 'MOVIS', 'DRIVO']

  // DEBUG: Log what we received
  console.log('BrandStats received stats:', stats)

  // Defensive: ensure stats object has all brands with defaults
  const safeStats = brands.reduce((acc, brand) => {
    acc[brand] = stats?.[brand] || { totalBookings: 0, todayBookings: 0 }
    return acc
  }, {})

  console.log('BrandStats safeStats:', safeStats)

  const maxTotal = Math.max(...brands.map(b => safeStats[b]?.totalBookings || 0), 1)

  return (
    <div className="brand-stats">
      <div className="panel__header">
        <span className="panel__title">Brand Breakdown</span>
        <span className="panel__badge">LIVE</span>
      </div>
      <div className="brand-stats__list">
        {brands.map((brand) => {
          const s = safeStats[brand]
          const color = brandColor(brand)
          const width = `${(s.totalBookings / maxTotal) * 100}%`

          return (
            <div key={brand} className="brand-stats__row">
              {/* TOP ROW: Logo + Brand Name + Total */}
              <div className="brand-stats__meta">
                <span
                  className="brand-stats__logo"
                  style={{
                    width: '48px',
                    height: '28px',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: `2px solid ${color}`,
                    boxShadow: `0 0 8px ${brandGlow(brand)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#0e1929',
                  }}
                >
                  <img
                    src={brandLogo(brand)}
                    alt={brand}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                      padding: '2px',
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.parentElement.style.background = color
                    }}
                  />
                </span>

                {/* BRAND NAME + TOTAL COUNT */}
                <div className="brand-stats__info">
                  <span className="brand-stats__name">{brand}</span>
                  <span className="brand-stats__total">{formatNumber(s.totalBookings)} total</span>
                </div>
              </div>

              {/* BOTTOM ROW: Progress Bar + Today Count */}
              <div className="brand-stats__bar-row">
                <div className="brand-stats__bar-track">
                  <div
                    className="brand-stats__bar-fill"
                    style={{
                      width,
                      background: color,
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