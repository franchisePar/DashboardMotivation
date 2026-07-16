import { useMemo } from 'react'
import { useSocket } from './useSocket'
import { Sidebar } from './components/Sidebar'
import { Header } from './components/Header'
import { StatCard } from './components/StatCard'
import { BrandStats } from './components/BrandStats'
import { CountryLeaderboard } from './components/CountryLeaderboard'
import { HourlyChart } from './components/HourlyChart'
import { RecentBookings } from './components/RecentBookings'
import { NotificationToast } from './components/NotificationToast'
import { SkeletonLoader } from './components/SkeletonLoader'
import { brandLogo, brandColor } from './format'
import {
  Car,
  CalendarCheck,
  Target,
  Trophy,
  Globe,
} from 'lucide-react'
import './App.css'

function App() {
  const { connected, data, loading, lastUpdated, newBookings, clearNewBooking, requestRefresh } = useSocket()

  const stats = data?.todayStats || {}
  const backendBrandStats = data?.brandStats || {}
  const totalFromMeta = data?.meta?.totalReservations || 0

  const brandStats = useMemo(() => {
    const counts = {
      UNITED: { totalBookings: 0, todayBookings: 0 },
      MOVIS:  { totalBookings: 0, todayBookings: 0 },
      DRIVO:  { totalBookings: 0, todayBookings: 0 },
    }
    Object.entries(backendBrandStats).forEach(([brand, s]) => {
      if (counts[brand]) {
        counts[brand].totalBookings = s.totalBookings || 0
        counts[brand].todayBookings = s.todayBookings || 0
      }
    })
    return counts
  }, [backendBrandStats])

  const topBrand = useMemo(() => {
    const entries = Object.entries(brandStats)
      .map(([brand, s]) => ({ brand, ...s }))
      .sort((a, b) => b.todayBookings - a.todayBookings)
    return entries[0] || null
  }, [brandStats])

  const totalReservations = totalFromMeta
  const todayCount = stats.totalBookings || 0
  const yesterdayCount = data?.yesterdayStats?.totalBookings || 0
  const trendCalc = yesterdayCount > 0 
    ? ((todayCount - yesterdayCount) / yesterdayCount) * 100 
    : 0
  const trend = trendCalc >= 0 ? 'up' : 'down'
  const trendValue = `${trendCalc >= 0 ? '+' : ''}${Math.round(trendCalc)}%`

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
              icon={<CalendarCheck size={20} />}
              color="#3b82f6"
              trend={trend}
              trendValue={`${trendValue} vs yesterday`}
              sparklineColor="#3b82f6"
            />
            <StatCard
              label="Reservations This Month"
              value={totalReservations}
              icon={<Car size={20} />}
              color="#22c55e"
              trend="up"
              trendValue="+24% vs last month"
              sparklineColor="#22c55e"
            />
            <StatCard
              label="Network Fleet"
              value="1,486"
              icon={<Car size={20} />}
              color="#f59e0b"
              sub="Total Cars"
              sparklineColor="#f59e0b"
            />
            <StatCard
              label="Countries Live"
              value={data?.countryStats?.length || 0}
              icon={<Globe size={20} />}
              color="#8b5cf6"
              sub="Across the world"
              sparklineColor="#8b5cf6"
            />
          </section>

          <section className="middle-section">
            <BrandStats stats={brandStats} />
            <RecentBookings bookings={data?.latestReservations || []} />
          </section>

          <section className="bottom-section">
            <CountryLeaderboard countries={data?.countryStats || []} />
            <HourlyChart data={data?.hourlyData || []} />
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