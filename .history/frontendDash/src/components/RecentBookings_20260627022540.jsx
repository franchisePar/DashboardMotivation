import { useEffect, useRef } from 'react'
import { brandColor, statusColor, countryFlag, formatTime } from '../format'

export function RecentBookings({ bookings }) {
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0
    }
  }, [bookings.length])

  return (
    <div className="recent-bookings" style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      height: '100%',
      overflow: 'hidden',
    }}>
      <div className="panel__header">
        <span className="panel__title">Live Feed</span>
        <span className="panel__badge">{bookings.length}</span>
      </div>
      <div ref={listRef} className="recent-bookings__table-wrap" style={{
        flex: 1,
        overflowY: 'auto',
        margin: '0 -8px',
        padding: '0 8px',
      }}>
        <table className="recent-bookings__table" style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 'var(--text-sm)',
        }}>
          <thead>
            <tr style={{ color: 'var(--muted)', fontSize: 'var(--text-xs)', textAlign: 'left' }}>
              <th style={{ padding: '6px 8px', fontWeight: 600 }}>Time</th>
              <th style={{ padding: '6px 8px', fontWeight: 600 }}>Reservation</th>
              <th style={{ padding: '6px 8px', fontWeight: 600 }}>Brand</th>
              <th style={{ padding: '6px 8px', fontWeight: 600 }}>Country</th>
              <th style={{ padding: '6px 8px', fontWeight: 600 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b, i) => {
              const isNew = i === 0
              return (
                <tr
                  key={b.id}
                  className={isNew ? 'new-row' : ''}
                  style={{
                    animation: isNew ? 'new-row-flash 1.5s ease' : 'none',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <td style={{ padding: '8px', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                    {b.receivedAtDate ? formatTime(b.receivedAtDate.toISOString?.() || b.receivedAtDate) : '—'}
                  </td>
                  <td style={{ padding: '8px', fontWeight: 600, color: '#f0f6ff' }}>
                    {b.reservationNumber || '—'}
                  </td>
                  <td style={{ padding: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: brandColor(b.brand),
                        boxShadow: `0 0 6px ${brandColor(b.brand)}`,
                      }} />
                      <span style={{ fontWeight: 600, color: '#dce8f5' }}>{b.brand}</span>
                    </span>
                  </td>
                  <td style={{ padding: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>{countryFlag(b.country)}</span>
                      <span style={{ color: '#dce8f5' }}>{b.country || '—'}</span>
                    </span>
                  </td>
                  <td style={{ padding: '8px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px',
                      borderRadius: '100px',
                      fontSize: 'var(--text-xs)',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      background: `${statusColor(b.status)}15`,
                      color: statusColor(b.status),
                      border: `1px solid ${statusColor(b.status)}40`,
                    }}>
                      <span style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        background: statusColor(b.status),
                      }} />
                      {b.status || 'Unknown'}
                    </span>
                  </td>
                </tr>
              )
            })}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)' }}>
                  No bookings yet today
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}