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
  timeout: 10000, // Add timeout
  withCredentials: false,
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
      // ═══════════════════════════════════════════════════════
      // FIX: Detect and correct swapped brand/status fields
      // ═══════════════════════════════════════════════════════
      const b = { ...booking }
      const brandVal = (b.brand || '').toString().toUpperCase().trim()
      const statusVal = (b.status || '').toString().toUpperCase().trim()
      
      // If brand field contains status and status field contains brand → SWAP
      const isBrandActuallyStatus = ['CONFIRMED', 'CANCELED', 'CANCELLED', 'PENDING'].includes(brandVal)
      const isStatusActuallyBrand = ['UNITED', 'MOVIS', 'DRIVO'].includes(statusVal)
      
      if (isBrandActuallyStatus && isStatusActuallyBrand) {
        console.warn('🔄 Swapped fields detected! Fixing...')
        b.brand = statusVal   // Was in status, now in brand
        b.status = brandVal   // Was in brand, now in status
      }
      
      // Also fix if brand is missing but status has brand name
      if (!b.brand && isStatusActuallyBrand) {
        b.brand = statusVal
        b.status = 'CONFIRMED'
      }
      
      // Also fix if status is missing but brand has status name
      if (!b.status && ['CONFIRMED', 'CANCELED', 'CANCELLED'].includes(brandVal)) {
        b.status = brandVal
        b.brand = 'UNITED'
      }

      const notif = {
        id: `notif-${Date.now()}-${Math.random()}`,
        booking: b,
        timestamp,
      }
      
      setNewBookings(prev => [notif, ...prev].slice(0, 5))
      setTimeout(() => clearNewBooking(notif.id), 8000)
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