import { useSocket } from './useSocket'
import { Header } from './components/Header'
import { StatCard } from './components/StatCard'
import { BrandStats } from './components/BrandStats'
import { CountryLeaderboard } from './components/CountryLeaderboard'
import { HourlyChart } from './components/HourlyChart'
import { RecentBookings } from './components/RecentBookings'
import { NotificationToast } from './components/NotificationToast'
import { SkeletonLoader } from './components/SkeletonLoader'
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
  const brandStats = data?.brandStats || {}
  const topBrand = data?.leaderboard?.[0]
  const totalReservations = data?.meta?.totalReservations || 0

  // Pass all reservations for fallback counting
  const allReservations = data?.allReservations || data?.latestReservations || []

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
            sub={`${topBrand?.todayBookings || 0} bookings`}
          />
        </section>

        <section className="middle-row">
          <BrandStats stats={brandStats} reservations={allReservations} />
          <CountryLeaderboard countries={data?.countryStats || []} />
        </section>

        <section className="bottom-row">
          <HourlyChart data={data?.hourlyData || []} />
          <RecentBookings bookings={data?.latestReservations || []} />
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

function brandColor(brand) {
  const map = {
    UNITED: '#0f27a2',
    MOVIS: '#f94231',
    DRIVO: '#c8fa1b',
  }
  return map[brand?.toUpperCase()] || '#64748b'
}

export default App