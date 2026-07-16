import { useMemo, useEffect, useState, useCallback } from 'react'
import { useSocket } from './useSocket'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { StatCard } from './components/StatCard'
import { LiveMap } from './components/LiveMap'
import { BrandStats } from './components/BrandStats'
import { CountryLeaderboard } from './components/CountryLeaderboard'
import { HourlyChart } from './components/HourlyChart'
import { RecentBookings } from './components/RecentBookings'
import { NotificationToast } from './components/NotificationToast'
import { SkeletonLoader } from './components/SkeletonLoader'
import {
  Car,
  CalendarCheck,
  Globe,
} from 'lucide-react'
import './App.css'

const BRANDS = ['UNITED', 'MOVIS', 'DRIVO']
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'https://dashboardmotivation.onrender.com'

function App() {
  const { connected, data: socketData, loading: socketLoading, lastUpdated, newBookings, clearNewBooking, requestRefresh } = useSocket()

  // ═══════════════════════════════════════════════════════════
  // FALLBACK: Fetch from REST API if socket data looks stale
  // (handles old cached data from Server.js)
  // ═══════════════════════════════════════════════════════════
  const [apiData, setApiData] = useState(null)
  const [apiLoading, setApiLoading] = useState(false)

  const fetchApiData = useCallback(async () => {
    try {
      setApiLoading(true)
      const res = await fetch(`${SOCKET_URL}/api/dashboard`)
      if (res.ok) {
        const json = await res.json()
        console.log('🌐 API fallback data keys:', Object.keys(json))
        setApiData(json)
      }
    } catch (e) {
      console.log('API fallback failed:', e.message)
    } finally {
      setApiLoading(false)
    }
  }, [])

  // Use API data if socket data seems stale (no todayCountryStats or zeros in brandStats)
  const data = useMemo(() => {
    // If socket has good data, use it
    if (socketData?.todayCountryStats?.length > 0) {
      console.log('✅ Using SOCKET data (has todayCountryStats)')
      return socketData
    }
    // If API has good data, use it
    if (apiData?.todayCountryStats?.length > 0) {
      console.log('✅ Using API fallback data (has todayCountryStats)')
      return apiData
    }
    // Default to socket data even if bad (will show zeros but at least something)
    return socketData || apiData
  }, [socketData, apiData])

  const loading = socketLoading && !data && apiLoading

  // Trigger API fallback if socket data looks stale
  useEffect(() => {
    if (socketData && !socketData?.todayCountryStats && !apiData && !apiLoading) {
      console.log('🌐 Socket data missing todayCountryStats — fetching API fallback...')
      fetchApiData()
    }
  }, [socketData, apiData, apiLoading, fetchApiData])

  const stats = data?.todayStats || {}
  const backendBrandStats = data?.brandStats || {}
  const allReservations = data?.latestReservations || []

  // ═══════════════════════════════════════════════════════════
  // DEBUG: Show EXACTLY what we received
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (data) {
      console.log('\n🟥🟥🟥 APP RECEIVED DATA 🟥🟥🟥')
      console.log('Source:', data === socketData ? 'SOCKET' : data === apiData ? 'API' : 'UNKNOWN')
      console.log('Raw data keys:', Object.keys(data))
      console.log('todayStats:', JSON.stringify(stats))
      console.log('brandStats TYPE:', typeof backendBrandStats)
      console.log('brandStats raw:', JSON.stringify(backendBrandStats))
      console.log('meta:', JSON.stringify(data?.meta))
      console.log('todayCountryStats raw:', JSON.stringify(data?.todayCountryStats))
      console.log('hourlyData raw (first 5):', JSON.stringify(data?.hourlyData?.slice(0, 5)))
      console.log('latestReservations count:', allReservations.length)
      console.log('🟥🟥🟥 END RECEIVED 🟥🟥🟥\n')
    }
  }, [data, stats, backendBrandStats, allReservations])

  // ── Brand stats mapping — BULLETPROOF VERSION ──
  const brandStats = useMemo(() => {
    const counts = {
      UNITED: { totalBookings: 0, todayBookings: 0, yesterdayBookings: 0 },
      MOVIS:  { totalBookings: 0, todayBookings: 0, yesterdayBookings: 0 },
      DRIVO:  { totalBookings: 0, todayBookings: 0, yesterdayBookings: 0 },
    }

    let entries = []
    if (Array.isArray(backendBrandStats)) {
      entries = backendBrandStats.map(item => [item.brand || item.name, item])
    } else if (typeof backendBrandStats === 'object' && backendBrandStats !== null) {
      entries = Object.entries(backendBrandStats)
    }

    console.log('brandStats entries to process:', entries.length)
    console.log('brandStats entries:', JSON.stringify(entries))

    entries.forEach(([brand, s]) => {
      if (!s || typeof s !== 'object') return
      const upperBrand = String(brand).toUpperCase().trim()
      const key =
        upperBrand === 'UNITED' || upperBrand === 'UNITED RENT A CAR' ? 'UNITED' :
        upperBrand === 'MOVIS' ? 'MOVIS' :
        upperBrand === 'DRIVO' ? 'DRIVO' :
        null

      if (!key) {
        console.log(`  -> Skipping unknown brand: "${brand}"`)
        return
      }

      console.log(`Processing brand: "${brand}" -> key: "${key}"`)

      // Handle nested data structure
      const totalBookings = s.totalBookings ?? s.total ?? 0
      const todayBookings = s.todayBookings ?? s.today ?? 0
      const yesterdayBookings = s.yesterdayBookings ?? s.yesterday ?? 0

      counts[key] = {
        totalBookings: Number(totalBookings) || 0,
        todayBookings: Number(todayBookings) || 0,
        yesterdayBookings: Number(yesterdayBookings) || 0,
      }
      console.log(`  -> Set ${key}.todayBookings = ${counts[key].todayBookings}`)
    })

    console.log('Final mapped brandStats:', JSON.stringify(counts))
    return counts
  }, [backendBrandStats])

  // ── Stats from backend ──
  const todayCount = stats.totalBookings || 0

  // Try multiple field names for totalThisMonth (backward compatibility)
  const totalThisMonth = 
    data?.meta?.totalThisMonth ??
    data?.meta?.totalConfirmedReservations ??
    data?.meta?.monthTotal ??
    data?.meta?.totalReservations ??
    0

  // ── Charts from backend ──
  // Prefer todayCountryStats (new backend), fall back to countryStats (old)
  const countryStats = data?.todayCountryStats || data?.countryStats || []
  const hourlyData = data?.hourlyData || []
  const activeCountries = countryStats.length

  console.log('APP DISPLAY VALUES:', {
    todayCount,
    totalThisMonth,
    activeCountries,
    countryStatsCount: countryStats.length,
    hourlyDataCount: hourlyData.length,
    unitedToday: brandStats.UNITED?.todayBookings,
    movisToday: brandStats.MOVIS?.todayBookings,
    drivoToday: brandStats.DRIVO?.todayBookings,
  })

  // ── Clean "1h - 3la" text ──
  const cleanBookings = useMemo(() => {
    return allReservations.map(r => {
      const cleanText = (text) => {
        if (!text || typeof text !== 'string') return text
        return text
          .replace(/1h\s*-\s*3la/gi, '')
          .replace(/-\s*3la/gi, '')
          .replace(/1h\s*3la/gi, '')
          .replace(/\s+/g, ' ')
          .trim()
      }
      return {
        ...r,
        country: cleanText(r.country),
        location: cleanText(r.location),
      }
    })
  }, [allReservations])

  if (loading && !data) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="main-area">
          <SkeletonLoader />
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <Sidebar />

      <div className="main-area">
        <Header
          connected={connected}
          lastUpdated={lastUpdated}
          onRefresh={() => {
            requestRefresh()
            fetchApiData() // Also refresh API fallback
          }}
        />

        <main className="app-main">
          <section className="kpi-row">
            <StatCard
              label="Reservations Today"
              value={todayCount}
              icon={<CalendarCheck size={40} />}
              color="#3b82f6"
              trend="up"
              trendValue="+0% vs yesterday"
              sparklineColor="#3b82f6"
            />
            <StatCard
              label="Reservations This Month"
              value={totalThisMonth}
              icon={<CalendarCheck size={40} />}
              color="#22c55e"
              trend="up"
              trendValue="+24% vs last month"
              sparklineColor="#22c55e"
            />
            <StatCard
              label="Network Fleet"
              value="1,486"
              icon={<Car size={40} />}
              color="#f59e0b"
              sub="Total Cars"
              sparklineColor="#f59e0b"
            />
            <StatCard
              label="Countries Live"
              value={activeCountries}
              icon={<Globe size={40} />}
              color="#8b5cf6"
              sub="Across the world"
              sparklineColor="#8b5cf6"
            />
          </section>

          <section className="map-section" style={{
            display: 'flex',
            gap: '16px',
            flex: 1,
            minHeight: 0,
          }}>
            <div style={{
              flex: 1.4,
              borderRadius: '14px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              overflow: 'hidden',
              minHeight: 0,
            }}>
              <div style={{
                flex: 1,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '14px',
              }}>
                <LiveMap bookings={allReservations} />
              </div>

              <BrandStats stats={brandStats} />
            </div>

            <RecentBookings bookings={cleanBookings.slice(0, 8)} />
          </section>

          <section className="bottom-section">
            <CountryLeaderboard countries={countryStats} />
            <HourlyChart data={hourlyData} />
          </section>
        </main>
      </div>

      <div className="toast-container">
        {newBookings.map((notif) => (
          <NotificationToast
            key={notif.id}
            booking={notif.booking}
            onDismiss={() => clearNewBooking(notif.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default App