import { useMemo, useEffect, useState, useCallback, useRef } from 'react'
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
  // CRITICAL FIX: The server sends OLD cached data first,
  // then new data. We need to detect stale data and skip it.
  // ═══════════════════════════════════════════════════════════
  const [goodData, setGoodData] = useState(null)
  const staleCountRef = useRef(0)
  const hasReceivedGoodData = useRef(false)

  // Detect if data is stale (all brandStats are zero = old cache)
  const isStaleData = useCallback((d) => {
    if (!d?.brandStats) return true
    const bs = d.brandStats
    const allZero = BRANDS.every(b => 
      (bs[b]?.todayBookings ?? bs[b]?.today ?? 0) === 0
    )
    const missingTodayCountryStats = !d.todayCountryStats || d.todayCountryStats.length === 0
    // Data is stale if ALL brands have 0 today AND missing todayCountryStats
    return allZero && missingTodayCountryStats && (d.todayStats?.totalBookings > 0)
  }, [])

  useEffect(() => {
    if (!socketData) return

    if (isStaleData(socketData)) {
      staleCountRef.current += 1
      console.log(`⚠️ STALE DATA #${staleCountRef.current} — skipping (old server cache)`)
      console.log('  brandStats:', JSON.stringify(socketData.brandStats))
      // Don't update goodData — keep previous or null
      return
    }

    // Good data received!
    console.log('✅ GOOD DATA received — using this')
    hasReceivedGoodData.current = true
    setGoodData(socketData)
  }, [socketData, isStaleData])

  // ═══════════════════════════════════════════════════════════
  // FALLBACK: Fetch from REST API if we never got good socket data
  // ═══════════════════════════════════════════════════════════
  const [apiData, setApiData] = useState(null)
  const [apiLoading, setApiLoading] = useState(false)

  const fetchApiData = useCallback(async () => {
    try {
      setApiLoading(true)
      const res = await fetch(`${SOCKET_URL}/api/dashboard`)
      if (res.ok) {
        const json = await res.json()
        console.log('🌐 API fallback response keys:', Object.keys(json))
        console.log('🌐 API brandStats:', JSON.stringify(json.brandStats))
        if (!isStaleData(json)) {
          console.log('✅ API data is GOOD — using it')
          setApiData(json)
          hasReceivedGoodData.current = true
        } else {
          console.log('⚠️ API data is also stale')
        }
      }
    } catch (e) {
      console.log('API fallback failed:', e.message)
    } finally {
      setApiLoading(false)
    }
  }, [isStaleData])

  // If we've received 3+ stale messages and still no good data, try API
  useEffect(() => {
    if (staleCountRef.current >= 2 && !hasReceivedGoodData.current && !apiLoading && !apiData) {
      console.log('🌐 Too many stale messages — fetching API fallback...')
      fetchApiData()
    }
  }, [socketData, apiLoading, apiData, fetchApiData])

  // Also try API on first mount after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasReceivedGoodData.current && !apiData) {
        console.log('🌐 Initial API fallback after delay...')
        fetchApiData()
      }
    }, 3000)
    return () => clearTimeout(timer)
  }, [fetchApiData, apiData])

  // Use goodData (from socket) or apiData (fallback)
  const data = goodData || apiData || socketData  // last resort: show stale
  const loading = socketLoading && !data && apiLoading

  const stats = data?.todayStats || {}
  const backendBrandStats = data?.brandStats || {}
  const allReservations = data?.latestReservations || []

  // ═══════════════════════════════════════════════════════════
  // DEBUG
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (data) {
      const source = data === goodData ? 'GOOD_SOCKET' : data === apiData ? 'API_FALLBACK' : 'STALE_SOCKET'
      console.log('\n🟥🟥🟥 APP USING DATA 🟥🟥🟥')
      console.log('Source:', source)
      console.log('Raw data keys:', Object.keys(data))
      console.log('todayStats:', JSON.stringify(stats))
      console.log('brandStats raw:', JSON.stringify(backendBrandStats))
      console.log('meta:', JSON.stringify(data?.meta))
      console.log('todayCountryStats:', JSON.stringify(data?.todayCountryStats?.slice(0, 3)))
      console.log('hourlyData (first 5):', JSON.stringify(data?.hourlyData?.slice(0, 5)))
      console.log('🟥🟥🟥 END 🟥🟥🟥\n')
    }
  }, [data, stats, backendBrandStats])

  // ── Brand stats mapping ──
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

    entries.forEach(([brand, s]) => {
      if (!s || typeof s !== 'object') return
      const upperBrand = String(brand).toUpperCase().trim()
      const key =
        upperBrand === 'UNITED' || upperBrand === 'UNITED RENT A CAR' ? 'UNITED' :
        upperBrand === 'MOVIS' ? 'MOVIS' :
        upperBrand === 'DRIVO' ? 'DRIVO' :
        null

      if (!key) return

      counts[key] = {
        totalBookings: Number(s.totalBookings ?? s.total ?? 0) || 0,
        todayBookings: Number(s.todayBookings ?? s.today ?? 0) || 0,
        yesterdayBookings: Number(s.yesterdayBookings ?? s.yesterday ?? 0) || 0,
      }
    })

    return counts
  }, [backendBrandStats])

  // ── Stats ──
  const todayCount = stats.totalBookings || 0
  const totalThisMonth = 
    data?.meta?.totalThisMonth ??
    data?.meta?.totalConfirmedReservations ??
    data?.meta?.totalReservations ??
    0

  // ── Charts ──
  const countryStats = data?.todayCountryStats || data?.countryStats || []
  const hourlyData = data?.hourlyData || []
  const activeCountries = countryStats.length

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
            staleCountRef.current = 0
            hasReceivedGoodData.current = false
            setGoodData(null)
            setApiData(null)
            setTimeout(fetchApiData, 500)
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