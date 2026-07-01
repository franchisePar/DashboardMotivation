import { brandColor, brandGlow, brandLogo, formatNumber } from '../format'
import './BrandStats.css'

export function BrandStats({ stats, reservations = [] }) {
  const brands = ['UNITED', 'MOVIS', 'DRIVO']

  // ===== FALLBACK: Compute stats from reservations if brandStats is empty =====
  const computedStats = (() => {
    // Check if stats has real data
    const hasRealData = brands.some(b => (stats?.[b]?.totalBookings || 0) > 0)
    if (hasRealData) return stats

    // Compute from reservations array as fallback
    const computed = {}
    brands.forEach(brand => {
      const brandRes = reservations.filter(r => {
        const brandField = r.brand || r.Brand || r.company || r.Company || ''
        return brandField.toUpperCase() === brand
      })

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      computed[brand] = {
        totalBookings: brandRes.length,
        todayBookings: brandRes.filter(r => {
          const date = new Date(r.createdAt || r.date || r.Date || r.timestamp || Date.now())
          const d = new Date(date)
          d.setHours(0, 0, 0, 0)
          return d.getTime() === today.getTime()
        }).length,
      }
    })
    return computed
  })()

  const maxTotal = Math.max(...brands.map(b => computedStats[b]?.totalBookings || 0), 1)

  return (
    <div className="brand-stats">
      <div className="panel__header">
        <span className="panel__title">Brand Breakdown</span>
        <span className="panel__badge">LIVE</span>
      </div>
      <div className="brand-stats__list">
        {brands.map((brand) => {
          const s = computedStats[brand] || { totalBookings: 0, todayBookings: 0 }
          const color = brandColor(brand)
          const width = `${(s.totalBookings / maxTotal) * 100}%`

          return (
            <div key={brand} className="brand-stats__row">
              <div className="brand-stats__meta">
                {/* LOGO de la marque */}
                <span
                  className="brand-stats__logo"
                  style={{
                    height: '24px',
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