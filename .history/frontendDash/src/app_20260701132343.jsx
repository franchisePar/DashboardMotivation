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

// ── Helper: Détecte la marque dans un objet réservation ──
function detectBrand(reservation) {
  if (!reservation || typeof reservation !== 'object') return null

  // Liste des propriétés possibles pour la marque
  const brandKeys = ['brand', 'Brand', 'BRAND', 'company', 'Company', 'COMPANY', 'marque', 'Marque', 'MARQUE']
  
  // 1. Chercher directement dans les clés connues
  for (const key of brandKeys) {
    const val = reservation[key]
    if (val) {
      const upper = String(val).toUpperCase().trim()
      if (['UNITED', 'MOVIS', 'DRIVO'].includes(upper)) {
        return upper
      }
    }
  }

  // 2. Scanner TOUTES les valeurs de l'objet pour trouver une marque connue
  for (const [key, val] of Object.entries(reservation)) {
    const upper = String(val).toUpperCase().trim()
    if (['UNITED', 'MOVIS', 'DRIVO'].includes(upper)) {
      return upper
    }
  }

  return null
}

// ── Helper: Détecte le statut ──
function detectStatus(reservation) {
  if (!reservation || typeof reservation !== 'object') return 'Unknown'

  const statusKeys = ['status', 'Status', 'STATUS', 'statut', 'Statut', 'STATUT', 'state', 'State', 'STATE']
  
  for (const key of statusKeys) {
    const val = reservation[key]
    if (val) {
      const upper = String(val).toUpperCase().trim()
      if (['CONFIRMED', 'CANCELED', 'CANCELLED', 'PENDING', 'NEW RESERVATION', 'COMPLETED'].includes(upper)) {
        return upper
      }
    }
  }

  // Fallback: chercher dans toutes les valeurs
  for (const [key, val] of Object.entries(reservation)) {
    const upper = String(val).toUpperCase().trim()
    if (['CONFIRMED', 'CANCELED', 'CANCELLED', 'PENDING', 'NEW RESERVATION', 'COMPLETED'].includes(upper)) {
      return upper
    }
  }

  return 'Unknown'
}

// ── Helper: Détecte le pays ──
function detectCountry(reservation) {
  if (!reservation || typeof reservation !== 'object') return 'Global'

  const countryKeys = ['country', 'Country', 'COUNTRY', 'pays', 'Pays', 'PAYS', 'location', 'Location', 'LOCATION', 'city', 'City', 'CITY']
  
  for (const key of countryKeys) {
    const val = reservation[key]
    if (val && String(val).trim()) {
      return String(val).trim()
    }
  }

  return 'Global'
}

// ── Helper: Détecte la date ──
function detectDate(reservation) {
  if (!reservation || typeof reservation !== 'object') return null

  const dateKeys = ['receivedAt', 'received_at', 'createdAt', 'created_at', 'date', 'Date', 'DATE', 'timestamp', 'Timestamp', 'TIMESTAMP', 'time', 'Time', 'TIME']
  
  for (const key of dateKeys) {
    const val = reservation[key]
    if (val) {
      const d = new Date(val)
      if (!isNaN(d.getTime())) return d
    }
  }

  return new Date() // fallback: aujourd'hui
}

function App() {
  const { connected, data, loading, lastUpdated, newBookings, clearNewBooking, requestRefresh } = useSocket()

  const stats = data?.todayStats || {}
  const latestReservations = data?.latestReservations || []
  const backendBrandStats = data?.brandStats || {}

  // ── Compter les réservations par marque (ROBUSTE) ──
  const brandStats = useMemo(() => {
    const counts = {
      UNITED: { totalBookings: 0, todayBookings: 0 },
      MOVIS:  { totalBookings: 0, todayBookings: 0 },
      DRIVO:  { totalBookings: 0, todayBookings: 0 },
    }

    const today = new Date().toDateString()

    latestReservations.forEach((r) => {
      const brand = detectBrand(r)
      
      if (!brand) {
        console.warn('❌ Could not detect brand for reservation:', r)
        return
      }

      counts[brand].totalBookings += 1

      const resDate = detectDate(r)
      if (resDate.toDateString() === today) {
        counts[brand].todayBookings += 1
      }
    })

    // Si on a des données du backend ET qu'elles sont valides, les fusionner
    const hasBackendData = ['UNITED', 'MOVIS', 'DRIVO'].some(
      b => (backendBrandStats[b]?.totalBookings || 0) > 0
    )

    if (hasBackendData) {
      // Utiliser les données du backend (plus fiable si elles viennent de toutes les réservations)
      return {
        UNITED: backendBrandStats.UNITED || counts.UNITED,
        MOVIS:  backendBrandStats.MOVIS  || counts.MOVIS,
        DRIVO:  backendBrandStats.DRIVO  || counts.DRIVO,
      }
    }

    return counts
  }, [latestReservations, backendBrandStats])

  // ── Calculer le top brand depuis les données comptées ──
  const topBrand = useMemo(() => {
    const entries = Object.entries(brandStats)
      .map(([brand, stats]) => ({ brand, ...stats }))
      .sort((a, b) => b.totalBookings - a.totalBookings)
    
    return entries[0] || null
  }, [brandStats])

  // ── Total réservations (backend > compté local) ──
  const totalReservations = data?.meta?.totalReservations || 
    Object.values(brandStats).reduce((sum, b) => sum + b.totalBookings, 0)

  const todayCount = stats.totalBookings || 
    Object.values(brandStats).reduce((sum, b) => sum + b.todayBookings, 0)

  const trend = todayCount > 80 ? 'up' : 'down'
  const trendValue = todayCount > 80 ? '+12%' : '-5%'

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