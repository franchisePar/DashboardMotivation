import { useMemo } from 'react'
import { useSocket } from './useSocket'
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
} from 'lucide-react'
import './App.css'

function App() {
  const { connected, data, loading, lastUpdated, newBookings, clearNewBooking, requestRefresh } = useSocket()

  if (loading && !data) {
    return (
      <div className="app-container">
        <SkeletonLoader />
      </div>
    )
  }

  const stats = data?.todayStats || {}
  const latestReservations = data?.latestReservations || []

  // Derive brandStats from actual reservations (fallback if backend brandStats is broken)
  const brandStats = useMemo(() => {
    // If backend sends valid brandStats with real data, use it
    if (data?.brandStats && Object.keys(data.brandStats).length > 0) {
      const hasRealData = ['UNITED', 'MOVIS', 'DRIVO'].some(
        b => (data.brandStats[b]?.totalBookings || 0) > 0
      )
      if (hasRealData) return data.brandStats
    }

    // Count from latestReservations
    const counts = {
      UNITED: { totalBookings: 0, todayBookings: 0 },
      MOVIS:  { totalBookings: 0, todayBookings: 0 },
      DRIVO:  { totalBookings: 0, todayBookings: 0 },
    }

    const today = new Date().toDateString()

    latestReservations.forEach(r => {
      const brand = r.brand?.toUpperCase()
      if (!counts[brand]) return

      counts[brand].totalBookings += 1

      const resDate = new Date(r.createdAt || r.date || r.timestamp)
      if (resDate.toDateString() === today) {
        counts[brand].todayBookings += 1
      }
    })

    return counts
  }, [data?.brandStats, latestReservations])

  const topBrand = data?.leaderboard?.[0]
  const totalReservations = data?.meta?.totalReservations || 0

  const todayCount = stats.totalBookings || 0
  const trend = todayCount > 80 ? 'up' : 'down'
  const trendValue = todayCount > 80 ? '+12%' : '-5%'

  return (
    <div className="app-container">
      <Header
        connected={connected}
        lastUpdated={lastUpdated}
        onRefresh={requestRefresh}
      />

      <main className="app-main">
        <section className="kpi-row">
          <StatCard
            label="Total Reservations"
            value={totalReservations}
            icon={<Car size={20} />}
            color="var(--accent)"
          />
          <StatCard
            label="Today's Bookings"
            value={todayCount}
            icon={<CalendarCheck size={20} />}
            color="var(--success)"
            sub={`Goal: ${stats.dailyGoal || 200}`}
            trend={trend}
            trendValue={trendValue}
          />
          <StatCard
            label="Daily Goal"
            value={`${Math.round(stats.dailyProgress || 0)}%`}
            icon={<Target size={20} />}
            color="var(--warning)"
            sub={`${todayCount} / ${stats.dailyGoal || 200}`}
            large
          />
          <StatCard
            label="Top Brand Today"
            value={topBrand?.brand || '—'}
            icon={<Trophy size={20} />}
            color={topBrand ? brandColor(topBrand.brand) : 'var(--muted)'}
            sub={`${topBrand?.totalBookings || 0} total`}
            logo={topBrand ? brandLogo(topBrand.brand) : null}
          />
        </section>

        <section className="middle-row">
          <BrandStats stats={brandStats} />
          <CountryLeaderboard countries={data?.countryStats || []} />
        </section>

        <section className="bottom-row">
          <HourlyChart data={data?.hourlyData || []} />
          <RecentBookings bookings={latestReservations} />
        </section>
      </main>

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