import React, { useEffect, useMemo, useRef, useState } from 'react'
import Globe from 'react-globe.gl'


const COUNTRY_COORDS = {
  ALBANIA: { lat: 41.1533, lng: 20.1683 },
  'ANTIGUA AND BARBUDA': { lat: 17.0608, lng: -61.7964 },
  AZORES: { lat: 37.7412, lng: -25.6756 },
  BOSNIA: { lat: 43.9159, lng: 17.6791 },
  BULGARIA: { lat: 42.7339, lng: 25.4858 },
  CORFU: { lat: 39.6243, lng: 19.9217 },
  CROATIA: { lat: 45.1, lng: 15.2 },
  CYPRES: { lat: 35.1264, lng: 33.4299 },
  CYPRUS: { lat: 35.1264, lng: 33.4299 },
  DOMINICAN: { lat: 18.7357, lng: -70.1627 },
  'DOMINICAN REPUBLIC': { lat: 18.7357, lng: -70.1627 },
  FLORIDA: { lat: 27.6648, lng: -81.5158 },
  GERMANY: { lat: 51.1657, lng: 10.4515 },
  GREECE: { lat: 39.0742, lng: 21.8243 },
  ITALY: { lat: 41.8719, lng: 12.5674 },
  JAMAICA: { lat: 18.1096, lng: -77.2975 },
  MALTA: { lat: 35.9375, lng: 14.3754 },
  MAURITIUS: { lat: -20.3484, lng: 57.5522 },
  MIAMI: { lat: 25.7617, lng: -80.1918 },
  MONTENEGRO: { lat: 42.7087, lng: 19.3744 },
  MOROCCO: { lat: 31.7917, lng: -7.0926 },
  POLAND: { lat: 51.9194, lng: 19.1451 },
  PORTUGAL: { lat: 39.3999, lng: -8.2245 },
  SERBIA: { lat: 44.0165, lng: 21.0059 },
  'SINT MAARTEN': { lat: 18.0425, lng: -63.0548 },
  'TURCS AND CAICOS': { lat: 21.694, lng: -71.7979 },
  'TURKS AND CAICOS': { lat: 21.694, lng: -71.7979 },
  TURKEY: { lat: 38.9637, lng: 35.2433 },
  USA: { lat: 37.0902, lng: -95.7129 },
  'UNITED STATES': { lat: 37.0902, lng: -95.7129 },
  FRANCE: { lat: 46.2276, lng: 2.2137 },
  UK: { lat: 55.3781, lng: -3.436 },
  SPAIN: { lat: 40.4637, lng: -3.7492 },
  NETHERLANDS: { lat: 52.1326, lng: 5.2913 },
  BELGIUM: { lat: 50.5039, lng: 4.4699 },
  SWITZERLAND: { lat: 46.8182, lng: 8.2275 },
  AUSTRIA: { lat: 47.5162, lng: 14.5501 },
  TUNISIA: { lat: 33.8869, lng: 9.5375 },
  ALGERIA: { lat: 28.0339, lng: 1.6596 },
  EGYPT: { lat: 26.8206, lng: 30.8025 },
  UAE: { lat: 23.4241, lng: 53.8478 },
}

const ALL_PARTNER_COUNTRIES = [
  { name: 'ALBANIA', lat: 41.1533, lng: 20.1683, brand: 'MOVIS' },
  { name: 'ANTIGUA AND BARBUDA', lat: 17.0608, lng: -61.7964, brand: 'UNITED' },
  { name: 'AZORES', lat: 37.7412, lng: -25.6756, brand: 'UNITED' },
  { name: 'BOSNIA', lat: 43.9159, lng: 17.6791, brand: 'MOVIS' },
  { name: 'BULGARIA', lat: 42.7339, lng: 25.4858, brand: 'MOVIS' },
  { name: 'CORFU', lat: 39.6243, lng: 19.9217, brand: 'UNITED' },
  { name: 'CROATIA', lat: 45.1, lng: 15.2, brand: 'UNITED' },
  { name: 'CYPRUS', lat: 35.1264, lng: 33.4299, brand: 'UNITED' },
  { name: 'DOMINICAN REPUBLIC', lat: 18.7357, lng: -70.1627, brand: 'UNITED' },
  { name: 'FLORIDA', lat: 27.6648, lng: -81.5158, brand: 'UNITED' },
  { name: 'GERMANY', lat: 51.1657, lng: 10.4515, brand: 'UNITED' },
  { name: 'GREECE', lat: 39.0742, lng: 21.8243, brand: 'UNITED' },
  { name: 'ITALY', lat: 41.8719, lng: 12.5674, brand: 'UNITED' },
  { name: 'JAMAICA', lat: 18.1096, lng: -77.2975, brand: 'UNITED' },
  { name: 'MALTA', lat: 35.9375, lng: 14.3754, brand: 'DRIVO' },
  { name: 'MAURITIUS', lat: -20.3484, lng: 57.5522, brand: 'DRIVO' },
  { name: 'MIAMI', lat: 25.7617, lng: -80.1918, brand: 'UNITED' },
  { name: 'MONTENEGRO', lat: 42.7087, lng: 19.3744, brand: 'MOVIS' },
  { name: 'MOROCCO', lat: 31.7917, lng: -7.0926, brand: 'UNITED' },
  { name: 'POLAND', lat: 51.9194, lng: 19.1451, brand: 'UNITED' },
  { name: 'PORTUGAL', lat: 39.3999, lng: -8.2245, brand: 'UNITED' },
  { name: 'SERBIA', lat: 44.0165, lng: 21.0059, brand: 'MOVIS' },
  { name: 'SINT MAARTEN', lat: 18.0425, lng: -63.0548, brand: 'UNITED' },
  { name: 'TURKS AND CAICOS', lat: 21.694, lng: -71.7979, brand: 'UNITED' },
  { name: 'TURKEY', lat: 38.9637, lng: 35.2433, brand: 'UNITED' },
]

const BRAND_COLORS = {
  UNITED: 'rgba(0, 22, 223, 0.96)',
  MOVIS: '#F97316',
  DRIVO: '#bef724',
}

const HUB = { lat: 31.7917, lng: -7.0926 }

function normalizeCountry(name) {
  return name ? name.toString().toUpperCase().trim() : null
}

export function LiveMap({ bookings = [], theme }) {
  const globeRef = useRef(null)
  const containerRef = useRef(null)
  const [globeSize, setGlobeSize] = useState({ width: 900, height: 480 })
  const [currentTheme, setCurrentTheme] = useState(theme || 'dark')
  const [selectedBrand, setSelectedBrand] = useState('ALL')

  useEffect(() => {
    if (theme) {
      setCurrentTheme(theme)
      return
    }

    const root = document.documentElement

    const detect = () => {
      setCurrentTheme(
        root.classList.contains('dark') ||
        root.dataset.theme === 'dark'
          ? 'dark'
          : 'light'
      )
    }

    detect()

    const observer = new MutationObserver(detect)
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    })

    return () => observer.disconnect()
  }, [theme])

  // Keep the 3D Earth centered inside the dashboard card at every screen size.
  // The previous version used an implicit 600x600 canvas, which made the sphere
  // sit low/left inside a wide dashboard panel.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateSize = () => {
      const rect = container.getBoundingClientRect()
      setGlobeSize({
        width: Math.max(320, Math.floor(rect.width)),
        height: Math.max(320, Math.floor(rect.height)),
      })
    }

    updateSize()

    const observer = new ResizeObserver(updateSize)
    observer.observe(container)

    return () => observer.disconnect()
  }, [])

  // Default camera: show Morocco + Europe/Atlantic in the center,
  // while keeping the full Earth nicely positioned in the large map card.
  useEffect(() => {
    const globe = globeRef.current
    if (!globe) return

    const controls = globe.controls()
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.38
    controls.enableZoom = true
    controls.enablePan = false
    controls.minDistance = 230
    controls.maxDistance = 720
    controls.enableDamping = true
    controls.dampingFactor = 0.08

    globe.pointOfView(
      {
        lat: HUB.lat,
        lng: HUB.lng,
        altitude: 2.15,
      },
      0
    )
  }, [globeSize.width, globeSize.height])

  const countries = useMemo(() => {
    return ALL_PARTNER_COUNTRIES.map(country => {
      let count = 0
      let brand = country.brand

      bookings.forEach(booking => {
        const bookingCountry = normalizeCountry(
          booking.country || booking.location
        )

        if (bookingCountry === normalizeCountry(country.name)) {
          count += 1
          const bookingBrand = (
            booking.brand || 'UNITED'
          ).toUpperCase()

          if (BRAND_COLORS[bookingBrand]) {
            brand = bookingBrand
          }
        }
      })

      return {
        ...country,
        count,
        brand,
        hasBookings: count > 0,
      }
    })
  }, [bookings])

  const visibleCountries = useMemo(() => {
    if (selectedBrand === 'ALL') return countries
    return countries.filter(c => c.brand === selectedBrand)
  }, [countries, selectedBrand])

  const points = useMemo(() => {
    return [
      {
        lat: HUB.lat,
        lng: HUB.lng,
        name: 'MOROCCO HUB',
        count: bookings.length,
        brand: 'UNITED',
        isHub: true,
      },
      ...visibleCountries.map(c => ({
        lat: c.lat,
        lng: c.lng,
        name: c.name,
        count: c.count,
        brand: c.brand,
        isHub: false,
      })),
    ]
  }, [visibleCountries, bookings.length])

  const arcs = useMemo(() => {
    return visibleCountries.map(c => ({
      startLat: HUB.lat,
      startLng: HUB.lng,
      endLat: c.lat,
      endLng: c.lng,
      name: c.name,
      brand: c.brand,
      count: c.count,
    }))
  }, [visibleCountries])

  const rings = useMemo(() => {
    return visibleCountries
      .filter(c => c.hasBookings)
      .map(c => ({
        lat: c.lat,
        lng: c.lng,
        brand: c.brand,
      }))
  }, [visibleCountries])

  const isDark = currentTheme === 'dark'

  const globeImage = isDark
    ? 'https://unpkg.com/three-globe/example/img/earth-night.jpg'
    : 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'

  const bumpImage =
    'https://unpkg.com/three-globe/example/img/earth-topology.png'

  const atmosphereColor = isDark ? 'rgba(0, 22, 223, 0.96)' : 'rgba(141, 183, 232, 0.96)'

  return (
    <div
      ref={containerRef}
      className={`live-map-3d ${isDark ? 'live-map-3d-dark' : 'live-map-3d-light'}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 480,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 14,
        overflow: 'hidden',
        background: isDark
          ? 'radial-gradient(circle at 50% 45%, #182438 0%, #0B111B 48%, #060A11 100%)'
          : 'radial-gradient(circle at 50% 45%, rgb(16 89 255) 0%, #d9ecff 55%, #E4EAF1 100%)',
      }}
    >
      <Globe
        ref={globeRef}
        width={globeSize.width}
        height={globeSize.height}
        backgroundColor="rgba(194, 241, 253, 0.69)"
        globeImageUrl={globeImage}
        bumpImageUrl={bumpImage}
        bumpScale={isDark ? 0.22 : 0.08}
        showAtmosphere={true}
        atmosphereColor={atmosphereColor}
        atmosphereAltitude={isDark ? 0.18 : 0.10}

        // Reservation arcs
        arcsData={arcs}
        arcStartLat={d => d.startLat}
        arcStartLng={d => d.startLng}
        arcEndLat={d => d.endLat}
        arcEndLng={d => d.endLng}
        arcColor={d => {
          const color = BRAND_COLORS[d.brand]
          return color || '#3B82F6'
        }}
        arcAltitudeAutoScale={0.35}
        arcStroke={d => d.count > 0 ? 0.65 : 0.25}
        arcDashLength={0.45}
        arcDashGap={0.55}
        arcDashAnimateTime={d => d.count > 0 ? 2200 : 5000}
        arcsTransitionDuration={700}

        // Country markers
        pointsData={points}
        pointLat={d => d.lat}
        pointLng={d => d.lng}
        pointAltitude={d => d.isHub ? 0.035 : 0.018}
        pointRadius={d => {
          if (d.isHub) return 0.55
          return d.count > 0
            ? Math.min(0.42, 0.14 + Math.sqrt(d.count) * 0.045)
            : 0.10
        }}
        pointColor={d => {
          if (d.isHub) return '#0f27a2'
          return BRAND_COLORS[d.brand] || '#64748B'
        }}
        pointResolution={10}
        pointsMerge={false}

        // Pulsing reservation rings
        ringsData={rings}
        ringLat={d => d.lat}
        ringLng={d => d.lng}
        ringColor={d => BRAND_COLORS[d.brand] || '#3B82F6'}
        ringMaxRadius={d => 1.8}
        ringPropagationSpeed={d => 0.7}
        ringRepeatPeriod={d => 1800}

        // Hover labels
        labelsData={points.filter(d => d.isHub || d.count > 0)}
        labelLat={d => d.lat}
        labelLng={d => d.lng}
        labelText={d => d.isHub
          ? `MOROCCO · ${d.count} reservations`
          : `${d.name} · ${d.count} reservation${d.count === 1 ? '' : 's'}`
        }
        labelSize={d => d.isHub ? 1.15 : 0.75}
        labelDotRadius={d => d.isHub ? 0.35 : 0.20}
        labelColor={d =>
          d.isHub
            ? '#FFFFFF'
            : (BRAND_COLORS[d.brand] || '#CBD5E1')
        }
        labelResolution={2}
        labelAltitude={0.045}

        // Tooltips
        pointLabel={d => `
          <div style="
            padding:10px 12px;
            border-radius:10px;
            background:${isDark ? 'rgba(12,20,32,.95)' : 'rgba(255,255,255,.97)'};
            color:${isDark ? '#F8FAFC' : '#172033'};
            border:1px solid ${isDark ? 'rgba(148,163,184,.22)' : 'rgba(30,50,80,.14)'};
            font:12px Inter,system-ui,sans-serif;
            box-shadow:0 12px 30px rgba(0,0,0,.20);
          ">
            <strong>${d.name}</strong><br/>
            ${d.isHub
              ? `${d.count} total reservations`
              : `${d.count} reservation${d.count === 1 ? '' : 's'}`
            }
            ${!d.isHub ? `<br/><span style="opacity:.65">${d.brand}</span>` : ''}
          </div>
        `}

        onPointClick={d => {
          if (globeRef.current) {
            globeRef.current.pointOfView(
              { lat: d.lat, lng: d.lng, altitude: 1.65 },
              900
            )
          }
        }}
      />

      {/* Header */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 18,
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '.08em',
            textTransform: 'uppercase',
            color: isDark ? '#CBD5E1' : '#475569',
          }}
        >
          LIVE RESERVATIONS
        </div>
        <div
          style={{
            marginTop: 3,
            fontSize: 10,
            color: isDark ? '#64748B' : '#94A3B8',
          }}
        >
          3D GLOBAL VIEW
        </div>
      </div>

      {/* Brand filter */}
      <div
        style={{
          position: 'absolute',
          left: 18,
          bottom: 18,
          zIndex: 10,
          display: 'flex',
          gap: 4,
          padding: 4,
          borderRadius: 10,
          background: isDark
            ? 'rgba(9,16,27,.88)'
            : 'rgba(255,255,255,.90)',
          border: `1px solid ${isDark ? 'rgba(148,163,184,.16)' : 'rgba(30,50,80,.10)'}`,
          boxShadow: '0 10px 25px rgba(0,0,0,.12)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {['ALL', 'UNITED', 'MOVIS', 'DRIVO'].map(brand => (
          <button
            key={brand}
            onClick={() => setSelectedBrand(brand)}
            style={{
              border: 0,
              borderRadius: 7,
              padding: '7px 11px',
              cursor: 'pointer',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '.04em',
              color: selectedBrand === brand
                ? '#FFFFFF'
                : isDark ? '#94A3B8' : '#64748B',
              background: selectedBrand === brand
                ? brand === 'ALL'
                  ? '#2563EB'
                  : BRAND_COLORS[brand]
                : 'transparent',
            }}
          >
            {brand}
          </button>
        ))}
      </div>

      {/* 3D badge */}
      <div
        style={{
          position: 'absolute',
          right: 18,
          bottom: 18,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '7px 10px',
          borderRadius: 9,
          fontSize: 10,
          fontWeight: 700,
          color: isDark ? '#CBD5E1' : '#475569',
          background: isDark
            ? 'rgba(9,16,27,.78)'
            : 'rgba(255,255,255,.88)',
          border: `1px solid ${isDark ? 'rgba(148,163,184,.16)' : 'rgba(30,50,80,.10)'}`,
          backdropFilter: 'blur(10px)',
        }}
      >
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#22C55E',
            boxShadow: '0 0 8px #22C55E',
          }}
        />
        3D EARTH
      </div>

      <style>{`
        .live-map-3d > div:first-child {
          position: absolute !important;
          inset: 0 !important;
        }

        .live-map-3d canvas {
          display: block;
          width: 100% !important;
          height: 100% !important;
        }

        .live-map-3d-dark .scene-container {
          filter: saturate(.88) contrast(1.04);
        }

        .live-map-3d-light .scene-container {
          filter: saturate(.75) brightness(1.04);
        }

        .live-map-3d button:hover {
          filter: brightness(1.08);
        }
      `}</style>
    </div>
  )
}

export default LiveMap
