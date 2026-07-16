import { useMemo } from 'react'
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

function App() {
  const { connected, data, loading, lastUpdated, newBookings, clearNewBooking, requestRefresh } = useSocket()

  const stats = data?.todayStats || {}
  const backendBrandStats = data?.brandStats || {}
  const totalFromMeta = data?.meta?.totalConfirmedReservations || 0

  // ═══════════════════════════════════════════════════════════
  // FIX: Only CONFIRMED bookings count for stats
  // ═══════════════════════════════════════════════════════════
  const allReservations = data?.latestReservations || []
  
  const confirmedReservations = useMemo(() => {
    return allReservations.filter(r => r.status?.toUpperCase() === 'CONFIRMED')
  }, [allReservations])

  // DEBUG
  console.log('=== DEBUG ===')
  console.log('todayStats:', stats)
  console.log('all reservations:', allReservations.length)
  console.log('confirmed only:', confirmedReservations.length)
  console.log('brandStats raw:', backendBrandStats)

  // Brand stats mapping
  const brandStats = useMemo(() => {
    const counts = {
      UNITED: { totalBookings: 0, todayBookings: 0, yesterdayBookings: 0 },
      MOVIS:  { totalBookings: 0, todayBookings: 0, yesterdayBookings: 0 },
      DRIVO:  { totalBookings: 0, todayBookings: 0, yesterdayBookings: 0 },
    }

    Object.entries(backendBrandStats).forEach(([brand, s]) => {
      const upperBrand = brand.toUpperCase().trim()
      const key = 
        upperBrand === 'UNITED' || upperBrand === 'UNITED RENT A CAR' ? 'UNITED' :
        upperBrand === 'MOVIS' ? 'MOVIS' :
        upperBrand === 'DRIVO' ? 'DRIVO' :
        upperBrand

      if (counts[key]) {
        counts[key].totalBookings = s.totalBookings ?? s.total ?? 0
        counts[key].todayBookings = s.todayBookings ?? s.today ?? 0
        counts[key].yesterdayBookings = s.yesterdayBookings ?? s.yesterday ?? 0
      }
    })

    return counts
  }, [backendBrandStats])

  // FIX: Today count = confirmed only (from backend todayStats)
  const todayCount = stats.totalBookings || 0

  // FIX: Monthly count = confirmed only
  const totalReservations = totalFromMeta || confirmedReservations.length

  // FIX: Countries = unique confirmed countries
  const activeCountries = useMemo(() => {
    const countries = new Set(confirmedReservations.map(r => r.country || r.location).filter(Boolean))
    return countries.size
  }, [confirmedReservations])

  // FIX: Top countries = only confirmed, sorted
  const topCountries = useMemo(() => {
    const counts = {}
    confirmedReservations.forEach(r => {
      const c = r.country || r.location
      if (!c) return
      counts[c] = (counts[c] || 0) + 1
    })
    return Object.entries(counts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [confirmedReservations])

  // FIX: Hourly data = only confirmed
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: i, bookings: 0 }))
    confirmedReservations.forEach(r => {
      const h = new Date(r.timestamp || r.createdAt || Date.now()).getHours()
      if (hours[h]) hours[h].bookings += 1
    })
    return hours
  }, [confirmedReservations])

  // FIX: Clean "1h - 3la" and other garbled text from bookings
  const cleanBookings = useMemo(() => {
    return allReservations.map(r => {
      const cleanText = (text) => {
        if (!text) return text
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
        brand: cleanText(r.brand),
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
          onRefresh={requestRefresh}
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
              value={totalReservations}
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
                <LiveMap bookings={confirmedReservations} />
              </div>

              <BrandStats stats={brandStats} />
            </div>

            <RecentBookings bookings={cleanBookings.slice(0, 8)} />
          </section>

          <section className="bottom-section">
            <CountryLeaderboard countries={topCountries} />
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