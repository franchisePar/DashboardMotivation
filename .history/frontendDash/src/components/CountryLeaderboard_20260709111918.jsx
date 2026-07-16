import { countryFlagUrl, formatNumber } from '../format'
import './CountryLeaderboard.css'

export function CountryLeaderboard({ countries, todayCountries }) {
  const displayCountries = todayCountries?.length > 0 
    ? todayCountries 
    : countries || []

  const visibleCountries = displayCountries.slice(0, 7)
  const remaining = displayCountries.length - visibleCountries.length

  return (
    <div className="top-countries">
      <div className="top-countries__header">Top Countries Live</div>
      <div className="top-countries__row">
        {visibleCountries.map((country) => {
          const flagUrl = countryFlagUrl(country.country)
          return (
            <div key={country.country} className="country-pill">
              <img
                src={flagUrl}
                className="country-pill__flag"
                alt={country.country}
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <span className="country-pill__name">{country.country}</span>
              <span className="country-pill__count">
                {formatNumber(country.bookings)}
              </span>
              <span className="country-pill__trend">▲</span>
            </div>
          )
        })}
        {remaining > 0 && (
          <div className="country-pill__more">+{remaining}</div>
        )}
      </div>
    </div>
  )
}