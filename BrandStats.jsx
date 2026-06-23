import { brandColor } from '../utils/format'
import './BrandStats.css'

export default function BrandStats({ brandStats, mode = 'bookings' }) {
  const brands = ['UNITED', 'MOVIS', 'DRIVO']
  const key = mode === 'revenue' ? 'todayRevenue' : 'todayBookings'
  const values = brands.map(b => brandStats?.[b]?.[key] || 0)
  const max = Math.max(...values, 1)

  return (
    <div className="brand-stats">
      <div className="panel__header">
        <span className="panel__title">
          {mode === 'revenue' ? 'Revenue by Brand' : 'Bookings by Brand'}
        </span>
        <span className="panel__badge">TODAY</span>
      </div>

      <div className="brand-stats__list">
        {brands.map((brand, i) => {
          const val = values[i]
          const pct = (val / max) * 100
          const color = brandColor(brand)
          const allKey = mode === 'revenue' ? 'totalRevenue' : 'totalBookings'
          const totalVal = brandStats?.[brand]?.[allKey] || 0

          return (
            <div className="brand-stats__row" key={brand}>
              <div className="brand-stats__meta">
                <div className="brand-stats__dot" style={{ background: color }} />
                <span className="brand-stats__name">{brand}</span>
                <span className="brand-stats__total">
                  {mode === 'revenue'
                    ? `$${totalVal.toLocaleString()} all time`
                    : `${totalVal} all time`
                  }
                </span>
              </div>
              <div className="brand-stats__bar-row">
                <div className="brand-stats__bar-track">
                  <div
                    className="brand-stats__bar-fill"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
                <span className="brand-stats__val" style={{ color }}>
                  {mode === 'revenue'
                    ? `$${val.toLocaleString()}`
                    : val
                  }
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
