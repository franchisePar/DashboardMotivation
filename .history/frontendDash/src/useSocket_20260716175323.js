import { useEffect, useState, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'https://dashboardmotivation.onrender.com'

export function useSocket() {
  const [connected, setConnected]     = useState(false)
  const [data, setData]               = useState(null)
  const [loading, setLoading]         = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [newBookings, setNewBookings] = useState([])
  const socketRef = useRef(null)

  const clearNewBooking = useCallback((id) => {
    setNewBookings(prev => prev.filter(b => b.id !== id))
  }, [])

  const requestRefresh = useCallback(() => {
    if (socketRef.current) socketRef.current.emit('request_refresh')
  }, [])

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      console.log('Socket connected:', socket.id)
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    socket.on('loading', () => {
      setLoading(true)
    })

    socket.on('dashboard_update', (payload) => {
      setData(payload)
      setLoading(false)
      setLastUpdated(new Date())
    })

    socket.on('new_booking', ({ booking, timestamp }) => {
      // Simple validation
      if (!booking || !booking.status) {
        console.log('Invalid booking notification:', booking)
        return
      }

      const status = (booking.status || '').toString().toUpperCase().trim()
      const isConfirmed = status === 'CONFIRMED'
      const isCanceled = status === 'CANCELED' || status === 'CANCELLED'

      // Only show notifications for Confirmed or Canceled
      if (!isConfirmed && !isCanceled) {
        console.log('Skipping notification for status:', status)
        return
      }

      const notif = {
        id: `notif-${Date.now()}-${Math.random()}`,
        booking: {
          ...booking,
          status: isCanceled ? 'CANCELED' : 'CONFIRMED', // normalize
        },
        timestamp,
      }

      setNewBookings(prev => [notif, ...prev].slice(0, 5))

      // Auto-dismiss after 8 seconds
      setTimeout(() => {
        clearNewBooking(notif.id)
      }, 8000)
    })

    socket.on('error', (err) => {
      console.error('Socket error:', err)
    })

    return () => {
      socket.disconnect()
    }
  }, [clearNewBooking])

  return { connected, data, loading, lastUpdated, newBookings, clearNewBooking, requestRefresh }
}