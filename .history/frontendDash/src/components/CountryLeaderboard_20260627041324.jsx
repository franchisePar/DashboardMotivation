import { countryFlag, formatNumber } from '../format'
import './CountryLeaderboard.css'

export function CountryLeaderboard({ countries }) {
  const max = Math.max(...countries.map(c => c.bookings), 1)

  return (
    <div className="country-leaderboard">
      <div className="panel__header">
        <span className="panel__title">Top Countries</span>
        <span className="panel__badge">{countries.length}</span>
      </div>
      <div className="country-list">
        {countries.map((c, i) => (
          <div key={c.country} className="country-row" style={{ animationDelay: `${i * 0.05}s` }}>
            <span className="country-rank">#{i + 1}</span>
            <img 
  src={`https://flagcdn.com/w40/${countryFlag(c.country)}.png`}
  alt={c.country}
  style={{ width: '22px', height: '16px', borderRadius: '3px', objectFit: 'cover' }}
  onError={(e) => { e.target.style.display = 'none' }}
/>
            <span className="country-name">{c.country}</span>
            <div className="country-bar-track">
              <div
                className="country-bar-fill"
                style={{ width: `${(c.bookings / max) * 100}%` }}
              />
            </div>
            <span className="country-count">{formatNumber(c.bookings)}</span>
          </div>
        ))}
        {countries.length === 0 && (
          <div className="country-empty">No country data available</div>
        )}
      </div>
    </div>
  )
}