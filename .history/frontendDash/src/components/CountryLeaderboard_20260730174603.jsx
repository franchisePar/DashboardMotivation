import { countryFlagUrl, formatNumber } from '../format'

export function CountryLeaderboard({ countries, todayCountries }) {
  const displayCountries = todayCountries?.length > 0 
    ? todayCountries 
    : countries || []

  const visibleCountries = displayCountries.slice(0, 7)
  const remaining = displayCountries.length - visibleCountries.length

  return (
    <div style={{
      flex: 1,
      background: 'var(--bg-card)',
      borderRadius: '14px',
      boxShadow: 'var(--card-shadow)',
      border: '1px solid var(--border)',
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <div style={{
        fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)',
        textTransform: 'uppercase', letterSpacing: '0.5px',
      }}>
        Top Countries Live
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        {visibleCountries.map((country) => {
          const flagUrl = countryFlagUrl(country.country)
          return (
            <div
              key={country.country}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'var(--bg-void)', border: '1px solid var(--border)',
                padding: '8px 14px', borderRadius: '100px',
                transition: 'all 0.2s', cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'none'
              }}
            >
              <img
                src={flagUrl}
                style={{ width: '24px', height: '18px', borderRadius: '3px', objectFit: 'cover' }}
                alt={country.country}
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{country.country}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted)' }}>
                {formatNumber(country.bookings)}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--success)', marginLeft: '2px' }}>▲</span>
            </div>
          )
        })}
        {remaining > 0 && (
          <div style={{
            background: 'var(--bg-void)', border: '1px solid var(--border)',
            padding: '8px 14px', borderRadius: '100px',
            fontSize: '12px', fontWeight: 600, color: 'var(--muted)', cursor: 'pointer',
          }}>
            +{remaining}
          </div>
        )}
      </div>
    </div>
  )
}