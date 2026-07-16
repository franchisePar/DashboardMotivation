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
  const totalFromMeta = data?.meta?.totalReservations || 0

  // ── DEBUG: log data structure ──
  console.log('=== DEBUG ===')
  console.log('todayStats:', stats)
  console.log('latestReservations count:', data?.latestReservations?.length)
  console.log('latestReservations sample:', data?.latestReservations?.slice(0, 3))
  console.log('brandStats:', backendBrandStats)

  // ── Brand stats mapping ──
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
              icon={<CalendarCheck size={20} />}
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

          <section className="map-section" style={{
            display: 'flex',
            gap: '16px',
            flex: 1,
            minHeight: 0,
          }}>
            <div style={{
              flex: 1.4,
              background: '#ffffff',
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
                background: '#e8ecf4',
                overflow: 'hidden',
                borderRadius: '14px',
              }}>
                <LiveMap bookings={data?.latestReservations || []} />
              </div>

              <BrandStats stats={brandStats} />
            </div>

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