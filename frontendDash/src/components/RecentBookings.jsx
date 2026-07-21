import { useEffect, useRef, useState } from 'react'
import { brandColor, statusColor, countryFlagUrl, formatTime, brandLogo } from '../format'
import './RecentBookings.css'

const MAX_BOOKINGS = 30

export function RecentBookings({ bookings: incomingBookings }) {
  const listRef = useRef(null)
  const [allBookings, setAllBookings] = useState([])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0
    }
  }, [allBookings.length])

  // Merge new incoming bookings with existing, keep only last 30
  useEffect(() => {
    if (incomingBookings && incomingBookings.length > 0) {
      setAllBookings(prev => {
        const merged = [...incomingBookings, ...prev]
        // Remove duplicates by reservationNumber + receivedAt
        const seen = new Set()
        const unique = merged.filter(b => {
          const key = `${b.reservationNumber}-${b.receivedAt}`
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        // Keep max 30
        return unique.slice(0, MAX_BOOKINGS)
      })
    }
  }, [incomingBookings])

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
        {allBookings.map((b, i) => {
          const isNew = i === 0
          const flagUrl = countryFlagUrl(b.country)
          const logoUrl = brandLogo(b.brand)
          const timeStr = b.receivedAtDate
            ? formatTime(b.receivedAtDate.toISOString?.() || b.receivedAtDate)
            : '—'

          return (
            <div
              key={b.id || `${b.reservationNumber}-${i}`}
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
              <img
                src={logoUrl}
                alt={b.brand || 'UNITED'}
                className={`feed-card__brand-logo ${getBrandClass(b.brand)}`}
                style={{
                  height: '14px',
                  width: 'auto',
                  objectFit: 'contain',
                  flexShrink: 0,
                }}
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.nextSibling.style.display = 'inline'
                }}
              />
              <span
                className={`feed-card__brand ${getBrandClass(b.brand)}`}
                style={{ display: 'none' }}
              >
                {(b.brand || 'UNITED').toUpperCase() === 'UNITED' ? 'United' :
                 (b.brand || '').toUpperCase() === 'MOVIS' ? 'MOVIS.' :
                 (b.brand || '').toUpperCase() === 'DRIVO' ? 'DRIVO' : b.brand}
              </span>
              <span className={`feed-card__status ${getStatusClass(b.status)}`} title={b.status || 'Unknown'} />
            </div>
          )
        })}
        {allBookings.length === 0 && (
          <div className="feed-card" style={{ justifyContent: 'center', color: 'var(--muted)' }}>
            No bookings yet today
          </div>
        )}
      </div>
    </div>
  )
}
