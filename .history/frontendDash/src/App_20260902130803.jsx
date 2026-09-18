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
import { brandLogo } from './format'
import { CalendarCheck, Globe, Trophy } from 'lucide-react'
import './App.css'
import { BrandLogo } from './components/BrandLogo'


function App() {
  const { connected, data, loading, lastUpdated, newBookings, clearNewBooking, requestRefresh } = useSocket()

  const stats = data?.todayStats || {}
  const backendBrandStats = data?.brandStats || {}
  const allReservations = data?.latestReservations || []

  const brandStats = useMemo(() => {
    const counts = {
      UNITED: { totalBookings: 0, todayBookings: 0, yesterdayBookings: 0 },
      MOVIS:  { totalBookings: 0, todayBookings: 0, yesterdayBookings: 0 },
      DRIVO:  { totalBookings: 0, todayBookings: 0, yesterdayBookings: 0 },
    }
    Object.entries(backendBrandStats).forEach(([brand, s]) => {
      if (!s || typeof s !== 'object') return
      const key = String(brand).toUpperCase().trim()
      if (!counts[key]) return
      counts[key] = {
        totalBookings: Number(s.totalBookings ?? 0) || 0,
        todayBookings: Number(s.todayBookings ?? 0) || 0,
        yesterdayBookings: Number(s.yesterdayBookings ?? 0) || 0,
      }
    })
    return counts
  }, [backendBrandStats])

  const todayCount = stats.totalBookings || 0
  const totalThisMonth = data?.meta?.totalThisMonth ?? data?.meta?.totalReservations ?? 0
  const countryStats = data?.todayCountryStats || data?.countryStats || []
  const hourlyData = data?.hourlyData || []
  const activeCountries = countryStats.length

  const cleanBookings = useMemo(() => {
    return allReservations.map((r) => {
      const cleanText = (text) => {
        if (!text || typeof text !== 'string') return text
        return text
          .replace(/1h\s*-\s*3la/gi, '')
          .replace(/-\s*3la/gi, '')
          .replace(/1h\s*3la/gi, '')
          .replace(/\s+/g, ' ')
          .trim()
      }
      return { ...r, country: cleanText(r.country), location: cleanText(r.location) }
    })
  }, [allReservations])

  const topBrandEntry = Object.entries(brandStats).sort(
    (a, b) => (b[1].todayBookings || 0) - (a[1].todayBookings || 0)
  )[0]
  const topBrand = topBrandEntry ? topBrandEntry[0] : 'UNITED'
  const topBrandCount = topBrandEntry ? topBrandEntry[1].todayBookings : 0

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
        <Header connected={connected} lastUpdated={lastUpdated} onRefresh={requestRefresh} />
        <main className="app-main">
          <section className="kpi-row">
            <StatCard
              label="Reservations Today"
              value={todayCount}
              icon={<CalendarCheck size={40} />}
              color="var(--stat-blue)"
              trend="up"
              trendValue="+0% vs yesterday"
              sparklineColor="var(--stat-blue)"
            />
            <StatCard
              label="Reservations This Month"
              value={totalThisMonth}
              icon={<CalendarCheck size={40} />}
              color="var(--stat-green)"
              trend="up"
              trendValue="+24% vs last month"
              sparklineColor="var(--stat-green)"
            />
            <StatCard
              label="Top Brand Today"
              value={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BrandLogo brand={topBrand.toLowerCase()} height={38} />
                </div>
              }
              icon={<Trophy size={40} />}
              color="var(--stat-amber)"
              sub={`${topBrandCount} bookings`}
              sparklineColor="var(--stat-amber)"
            />
            <StatCard
              label="Countries Live"
              value={activeCountries}
              icon={<Globe size={40} />}
              color="var(--stat-purple)"
              sub="Across the world"
              sparklineColor="var(--stat-purple)"
            />
          </section>

          <section className="map-section">
            <div className="map-card">
              <div className="map-card__inner">
                <LiveMap bookings={allReservations} />
              </div>
              <BrandStats stats={brandStats} />
            </div>
       <RecentBookings bookings={cleanBookings.slice(0, 30)} />
          </section>

          <section className="bottom-section">
            <CountryLeaderboard countries={countryStats} />
            <HourlyChart data={hourlyData} />
          </section>
        </main>
      </div>

      <div className="toast-container">
        {newBookings.map((notif) => (
          <NotificationToast key={notif.id} booking={notif.booking} onDismiss={() => clearNewBooking(notif.id)} />
        ))}
      </div>
    </div>
  )
}

export default App
