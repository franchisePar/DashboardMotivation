import { useMemo, useEffect, useState } from 'react'
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
import { brandColor, statusColor, brandLogo } from './format'
import {
  Car,
  CalendarCheck,
  Globe,
  Trophy,
} from 'lucide-react'
import './App.css'

const BRANDS = ['UNITED', 'MOVIS', 'DRIVO']

function App() {
  const { connected, data, loading, lastUpdated, newBookings, clearNewBooking, requestRefresh } = useSocket()

  // Use socket data directly — no stale detection
  const stats = data?.todayStats || {}
  const backendBrandStats = data?.brandStats || {}
  const allReservations = data?.latestReservations || []

  // ── Brand stats mapping — simple and robust ──
  const brandStats = useMemo(() => {
    const counts = {
      UNITED: { totalBookings: 0, todayBookings: 0, yesterdayBookings: 0 },
      MOVIS:  { totalBookings: 0, todayBookings: 0, yesterdayBookings: 0 },
      DRIVO:  { totalBookings: 0, todayBookings: 0, yesterdayBookings: 0 },
    }

    const entries = Object.entries(backendBrandStats)
    entries.forEach(([brand, s]) => {
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

  // ── Stats ──
  const todayCount = stats.totalBookings || 0
  const totalThisMonth = data?.meta?.totalThisMonth ?? data?.meta?.totalReservations ?? 0

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
const topBrandEntry = Object.entries(brandStats).sort((a, b) => 
  (b[1].todayBookings || 0) - (a[1].todayBookings || 0)
)[0]
const topBrand = topBrandEntry ? topBrandEntry[0] : 'UNITED'
const topBrandCount = topBrandEntry ? topBrandEntry[1].todayBookings : 0
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
              value={totalThisMonth}
              icon={<CalendarCheck size={40} />}
              color="#22c55e"
              trend="up"
              trendValue="+24% vs last month"
              sparklineColor="#22c55e"
            />
           <StatCard
  label="Top Brand Today"
  value={
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <img 
        src={brandLogo(topBrand)} 
        alt={topBrand} 
        style={{ height: '24px', width: 'auto', objectFit: 'contain' }} 
      />
      <span>{topBrand}</span>
    </div>
  }
  icon={<Trophy size={40} />}
  color="#f59e0b"
  sub={`${topBrandCount} bookings`}
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