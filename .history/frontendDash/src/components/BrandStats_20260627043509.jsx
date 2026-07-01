import { brandColor, brandGlow, brandLogo, formatNumber } from '../format'
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
                {/* LOGO de la marque */}
                <span
  className="brand-stats__logo"
  style={{
    width: '40px',           // ← un peu plus large pour rectangle
    height: '24px',          // ← moins haut pour rectangle
    borderRadius: '6px',     // ← CHANGÉ : 6px au lieu de 50%
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
      objectFit: 'contain',  // ← CHANGÉ : contain au lieu de cover
      padding: '2px',        // ← petit padding pour pas que ça touche les bords
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