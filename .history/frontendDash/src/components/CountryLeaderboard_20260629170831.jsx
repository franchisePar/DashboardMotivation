import { countryFlagUrl, formatNumber } from '../format'
import './CountryLeaderboard.css'

export function CountryLeaderboard({ countries }) {
  return (
    <div className="country-leaderboard">
      <div className="panel__header">
        <span className="panel__title">Top Countries</span>
        <span className="panel__badge">{countries.length}</span>
      </div>
      <div className="country-leaderboard__list">
        {countries.map((country, index) => {
          const flagUrl = countryFlagUrl(country.country)
          const rank = index + 1

          return (
            <div key={country.country} className="country-leaderboard__row">
              <div className="country-leaderboard__info">
                <span className="country-leaderboard__rank">#{rank}</span>

                {/* BIGGER FLAG */}
                <span className="country-leaderboard__flag">
                  {flagUrl ? (
                    <img
                      src={flagUrl}
                      alt={country.country}
                      className="country-leaderboard__flag-img"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <span className="country-leaderboard__flag-fallback">
                    {country.country?.slice(0, 2).toUpperCase()}
                  </span>
                </span>

                <span className="country-leaderboard__name">{country.country}</span>
              </div>

              <div className="country-leaderboard__bar-row">
                <div className="country-leaderboard__bar-track">
                  <div
                    className="country-leaderboard__bar-fill"
                    style={{
                      width: `${Math.min((country.bookings / (countries[0]?.bookings || 1)) * 100, 100)}%`,
                    }}
                  />
                </div>
                <span className="country-leaderboard__count">
                  {formatNumber(country.bookings)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}