import { useState, useEffect, useMemo } from 'react'
import { useSocket } from './hooks/useSocket'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { StatCard } from './components/StatCard'
import { BrandStats } from './components/BrandStats'
import { CountryLeaderboard } from './components/CountryLeaderboard'
import { HourlyChart } from './components/HourlyChart'
import { LiveMap } from './components/LiveMap'
import { RecentBookings } from './components/RecentBookings'
import { Notifications } from './components/Notifications'
import { brandLogo } from './format'

const BRANDS = ['UNITED', 'MOVIS', 'DRIVO']

export default function App() {
  const { connected, data, loading, lastUpdated, newBookings, clearNewBooking, requestRefresh } = useSocket()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // ═══════════════════════════════════════════════════════════
  // DEBUG: Log everything we receive
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    if (data) {
      console.log('🟥🟥🟥 APP RECEIVED DATA 🟥🟥🟥')
      console.log('Raw data keys:', Object.keys(data))
      console.log('todayStats:', JSON.stringify(data?.todayStats))
      console.log('brandStats TYPE:', typeof data?.brandStats)
      console.log('brandStats raw:', JSON.stringify(data?.brandStats))
      console.log('meta:', JSON.stringify(data?.meta))
      console.log('todayCountryStats raw:', JSON.stringify(data?.todayCountryStats))
      console.log('hourlyData raw (first 5):', JSON.stringify(data?.hourlyData?.slice(0, 5)))
      console.log('latestReservations count:', data?.latestReservations?.length)
      console.log('🟥🟥🟥 END RECEIVED 🟥🟥🟥')
    }
  }, [data])

  // ═══════════════════════════════════════════════════════════
  // EXTRACT DATA — handle both old and new backend formats
  // ═══════════════════════════════════════════════════════════
  const todayStats = data?.todayStats || { totalBookings: 0, dailyGoal: 200, dailyProgress: 0 }

  // Brand stats: backend sends object like {"UNITED": {todayBookings: 70, ...}}
  const backendBrandStats = data?.brandStats || {}

  // Map to consistent format
  const brandStats = useMemo(() => {
    const counts = {}
    BRANDS.forEach(brand => {
      counts[brand] = {
        totalBookings: 0,
        todayBookings: 0,
        yesterdayBookings: 0,
      }
    })

    console.log('brandStats entries to process:', Object.keys(backendBrandStats).length)
    console.log('brandStats entries:', JSON.stringify(Object.entries(backendBrandStats)))

    Object.entries(backendBrandStats).forEach(([key, val]) => {
      const brand = key.toUpperCase().trim()
      if (BRANDS.includes(brand) && val) {
        counts[brand] = {
          totalBookings: val.totalBookings ?? val.total ?? 0,
          todayBookings: val.todayBookings ?? val.today ?? 0,
          yesterdayBookings: val.yesterdayBookings ?? val.yesterday ?? 0,
        }
        console.log(`  -> Set ${brand}.todayBookings = ${counts[brand].todayBookings}`)
      }
    })

    console.log('Final mapped brandStats:', JSON.stringify(counts))
    return counts
  }, [backendBrandStats])

  // This month total — try multiple field names for compatibility
  const totalThisMonth = data?.meta?.totalThisMonth 
    ?? data?.meta?.totalConfirmedReservations 
    ?? data?.meta?.totalReservations 
    ?? 0

  // Countries: prefer todayCountryStats (new), fall back to countryStats (old)
  const todayCountryStats = data?.todayCountryStats || data?.countryStats || []

  // All countries for map (all reservations)
  const allCountryStats = data?.countryStats || []

  // Hourly data
  const hourlyData = data?.hourlyData || []

  // Latest reservations (for live feed — ALL statuses)
  const latestReservations = data?.latestReservations || []

  // Revenue estimate
  const estimatedRevenue = todayStats.totalBookings * 85

  console.log('APP DISPLAY VALUES:', {
    todayCount: todayStats.totalBookings,
    totalThisMonth,
    activeCountries: allCountryStats.length,
    countryStatsCount: todayCountryStats.length,
    hourlyDataCount: hourlyData.length,
  })

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc', fontFamily: 'var(--font-ui), system-ui, sans-serif', overflow: 'hidden' }}>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Header
          connected={connected}
          lastUpdated={lastUpdated}
          onRefresh={requestRefresh}
        />

        {/* Notifications */}
        <Notifications
          notifications={newBookings}
          onDismiss={clearNewBooking}
        />

        <main style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {loading && !data ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '40px', height: '40px', border: '3px solid #e2e8f0',
                  borderTopColor: '#0f27a2', borderRadius: '50%',
                  animation: 'spin 1s linear infinite', margin: '0 auto 16px'
                }} />
                <p style={{ color: '#64748b', fontSize: '14px' }}>Loading dashboard data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Stat Cards Row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                <StatCard
                  label="Reservations Today"
                  value={todayStats.totalBookings}
                  sub={`${Math.round(todayStats.dailyProgress)}% of daily goal`}
                  icon="calendar"
                  trend={todayStats.dailyProgress >= 100 ? 'up' : 'neutral'}
                />
                <StatCard
                  label="Reservations This Month"
                  value={totalThisMonth}
                  sub="Confirmed bookings"
                  icon="chart"
                  trend="up"
                />
                <StatCard
                  label="Active Countries"
                  value={allCountryStats.length}
                  sub="Markets live"
                  icon="globe"
                  trend="up"
                />
                <StatCard
                  label="Est. Revenue Today"
                  value={`$${estimatedRevenue.toLocaleString()}`}
                  sub="Based on avg $85/booking"
                  icon="dollar"
                  trend={estimatedRevenue > 5000 ? 'up' : 'neutral'}
                />
              </div>

              {/* Brand Stats Row */}
              <BrandStats stats={brandStats} />

              {/* Middle Row: Chart + Countries */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <HourlyChart data={hourlyData} />
                <CountryLeaderboard 
                  countries={todayCountryStats} 
                  todayCountries={todayCountryStats}
                />
              </div>

              {/* Bottom Row: Map + Live Feed */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <LiveMap 
                  reservations={latestReservations}
                  countryStats={allCountryStats}
                />
                <RecentBookings bookings={latestReservations} />
              </div>
            </>
          )}
        </main>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}