import { useEffect, useRef } from 'react'
import { brandColor, statusColor, countryFlagUrl, formatTime } from '../format'
import './RecentBookings.css'

export function RecentBookings({ bookings }) {
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0
    }
  }, [bookings.length])

  const getBrandClass = (brand) => {
    const b = (brand || '').toUpperCase()
    if (b === 'UNITED') return 'feed-card__brand--united'
    if (b === 'MOVIS') return 'feed-card__brand--movis'
    if (b === 'DRIVO') return 'feed-card__brand--drivo'
    return ''
  }

  const getStatusClass = (status) => {
    const s = (status || '').toLowerCase()
    if (s.includes('confirm')) return 'feed-card__status--confirmed'
    if (s.includes('cancel')) return 'feed-card__status--cancelled'
    if (s.includes('pending')) return 'feed-card__status--pending'
    return 'feed-card__status--confirmed'
  }

  return (
    <div className="live-feed">
      <div className="live-feed__header">
        <span className="live-feed__title">Live Feed</span>
        <span className="live-feed__badge">LIVE</span>
      </div>
      <div ref={listRef} className="live-feed__list">
        {bookings.map((b, i) => {
          const isNew = i === 0
          const flagUrl = countryFlagUrl(b.country)
          const timeStr = b.receivedAtDate
            ? formatTime(b.receivedAtDate.toISOString?.() || b.receivedAtDate)
            : '—'

          return (
            <div
              key={b.id || `booking-${i}`}
              className={`feed-card ${isNew ? 'feed-card--new' : ''}`}
              style={isNew ? { animation: 'new-row-flash 1.5s ease' } : {}}
            >
              <span className="feed-card__time">{timeStr}</span>
              <img
                src={flagUrl}
                className="feed-card__flag"
                alt={b.country || ''}
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <div className="feed-card__main">
                <div className="feed-card__loc">
                  {b.country || '—'} – {b.locationCode || b.city || 'UNK'}
                </div>
                <div className="feed-card__res">{b.reservationNumber || '—'}</div>
              </div>
              <span className={`feed-card__brand ${getBrandClass(b.brand)}`}>
                {(b.brand || 'UNITED').toUpperCase() === 'UNITED' ? 'United' :
                 (b.brand || '').toUpperCase() === 'MOVIS' ? 'MOVIS.' :
                 (b.brand || '').toUpperCase() === 'DRIVO' ? 'DRIVO' : b.brand}
              </span>
              <span className={`feed-card__status ${getStatusClass(b.status)}`} title={b.status || 'Unknown'} />
            </div>
          )
        })}
        {bookings.length === 0 && (
          <div className="feed-card" style={{ justifyContent: 'center', color: 'var(--muted)' }}>
            No bookings yet today
          </div>
        )}
      </div>
    </div>
  )
}