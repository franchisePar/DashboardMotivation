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
      background: '#ffffff',
      borderRadius: '14px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
      border: '1px solid #e2e8f0',
      padding: '16px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <div style={{
        fontSize: '13px', fontWeight: 700, color: '#1e293b',
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
                background: '#f1f5f9', border: '1px solid #e2e8f0',
                padding: '8px 14px', borderRadius: '100px',
                transition: 'all 0.2s', cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)'
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
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>{country.country}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
                {formatNumber(country.bookings)}
              </span>
              <span style={{ fontSize: '10px', color: '#22c55e', marginLeft: '2px' }}>▲</span>
            </div>
          )
        })}
        {remaining > 0 && (
          <div style={{
            background: '#f1f5f9', border: '1px solid #e2e8f0',
            padding: '8px 14px', borderRadius: '100px',
            fontSize: '12px', fontWeight: 600, color: '#64748b', cursor: 'pointer',
          }}>
            +{remaining}
          </div>
        )}
      </div>
    </div>
  )
}