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

  const stats = data?.todayStats || {}
  const backendBrandStats = data?.brandStats || {}
  const totalFromMeta = data?.meta?.totalReservations || 0

  // ── Use backend brandStats directly (has todayBookings already) ──
  const brandStats = useMemo(() => {
    const counts = {
      UNITED: { totalBookings: 0, todayBookings: 0 },
      MOVIS:  { totalBookings: 0, todayBookings: 0 },
      DRIVO:  { totalBookings: 0, todayBookings: 0 },
    }

    // Use backend data if available
    Object.entries(backendBrandStats).forEach(([brand, s]) => {
      if (counts[brand]) {
        counts[brand].totalBookings = s.totalBookings || 0
        counts[brand].todayBookings = s.todayBookings || 0
      }
    })

    return counts
  }, [backendBrandStats])

  // ── Top brand by TODAY's bookings ──
  const topBrand = useMemo(() => {
    const entries = Object.entries(brandStats)
      .map(([brand, s]) => ({ brand, ...s }))
      .sort((a, b) => b.todayBookings - a.todayBookings) // ← Sort by TODAY
    
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
        <SkeletonLoader />
      </div>
    )
  }

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
  sub={`${topBrand?.todayBookings || 0} today`}  // ← Should show TODAY
  logo={topBrand ? brandLogo(topBrand.brand) : null}
/>
        </section>

        <section className="middle-row">
          <BrandStats stats={brandStats} />
          <CountryLeaderboard todayCountries={data?.todayCountryStats || []} />
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

export default App