import { useEffect } from 'react'
import { X, Bell } from 'lucide-react'
import { brandColor, countryFlag, statusColor } from '../format'

export function NotificationToast({ booking, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 8000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div className="notification-toast" style={{
      animation: 'slide-in-right 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-bright)',
      borderLeft: `3px solid ${brandColor(booking.brand)}`,
      borderRadius: 'var(--radius)',
      padding: '14px 18px',
      minWidth: '280px',
      maxWidth: '340px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      position: 'relative',
    }}>
      <button
        onClick={onDismiss}
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: 'none',
          border: 'none',
          color: 'var(--muted)',
          cursor: 'pointer',
          padding: '2px',
        }}
      >
        <X size={14} />
      </button>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Bell size={14} style={{ color: brandColor(booking.brand) }} />
        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          New Booking
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: brandColor(booking.brand),
          boxShadow: `0 0 10px ${brandColor(booking.brand)}`,
        }} />
        <span style={{ fontWeight: 700, color: '#f0f6ff', fontSize: 'var(--text-base)' }}>
          {booking.reservationNumber}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
        <span>{countryFlag(booking.country)} {booking.country}</span>
        <span style={{
          padding: '1px 6px',
          borderRadius: '100px',
          background: `${statusColor(booking.status)}15`,
          color: statusColor(booking.status),
          border: `1px solid ${statusColor(booking.status)}40`,
        }}>
          {booking.status}
        </span>
      </div>
    </div>
  )
}