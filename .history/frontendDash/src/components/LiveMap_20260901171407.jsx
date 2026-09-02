import React, { useEffect, useRef, useMemo, useCallback } from 'react'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { ScatterplotLayer, ArcLayer } from '@deck.gl/layers'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

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

const BRAND_COLORS = {
  UNITED: { arc: [15, 39, 162, 160], dot: [15, 39, 162] },
  MOVIS:  { arc: [249, 66, 49, 160], dot: [249, 66, 49] },
  DRIVO:  { arc: [163, 197, 32, 160], dot: [163, 197, 32] },
}

const ALL_PARTNER_COUNTRIES = [
  { name: 'ALBANIA', lat: 41.1533, lng: 20.1683, brand: 'MOVIS' },
  { name: 'ANTIGUA AND BARBUDA', lat: 17.0608, lng: -61.7964, brand: 'UNITED' },
  { name: 'AZORES', lat: 37.7412, lng: -25.6756, brand: 'UNITED' },
  { name: 'BOSNIA', lat: 43.9159, lng: 17.6791, brand: 'MOVIS' },
  { name: 'BULGARIA', lat: 42.7339, lng: 25.4858, brand: 'MOVIS' },
  { name: 'CORFU', lat: 39.6243, lng: 19.9217, brand: 'UNITED' },
  { name: 'CROATIA', lat: 45.1, lng: 15.2, brand: 'UNITED' },
  { name: 'CYPRES', lat: 35.1264, lng: 33.4299, brand: 'UNITED' },
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

const HUB = [10, 35]

function normalizeCountry(name) {
  if (!name) return null
  return name.toString().toUpperCase().trim()
}

function getCountryCoords(countryName) {
  const normalized = normalizeCountry(countryName)
  if (!normalized) return null
  return COUNTRY_COORDS[normalized] || null
}

export function LiveMap({ bookings = [], theme }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const overlayRef = useRef(null)
  const rotationRef = useRef(null)
  const [currentTheme, setCurrentTheme] = React.useState(() => {
    if (theme) return theme
    if (typeof document === 'undefined') return 'dark'
    return document.documentElement.classList.contains('dark') ||
      document.documentElement.dataset.theme === 'dark'
      ? 'dark'
      : 'light'
  })

  // Detect your existing app theme automatically.
  useEffect(() => {
    if (theme) {
      setCurrentTheme(theme)
      return
    }

    const root = document.documentElement
    const updateTheme = () => {
      setCurrentTheme(
        root.classList.contains('dark') || root.dataset.theme === 'dark'
          ? 'dark'
          : 'light'
      )
    }

    updateTheme()

    const observer = new MutationObserver(updateTheme)
    observer.observe(root, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    })

    return () => observer.disconnect()
  }, [theme])

  const dotData = useMemo(() => {
    const dots = ALL_PARTNER_COUNTRIES.map(c => ({
      position: [c.lng, c.lat],
      country: c.name,
      brand: c.brand,
      count: 0,
      hasBookings: false,
    }))

    bookings.forEach((booking) => {
      const country = normalizeCountry(booking.country || booking.location)
      if (!country) return

      const dot = dots.find(
        d => normalizeCountry(d.country) === country
      )

      if (dot) {
        dot.count += 1
        dot.hasBookings = true

        const bookingBrand = (booking.brand || 'UNITED').toUpperCase()
        if (bookingBrand in BRAND_COLORS) dot.brand = bookingBrand
      }
    })

    return dots
  }, [bookings])

  const arcData = useMemo(() => {
    return dotData.map(d => ({
      source: d.position,
      target: HUB,
      brand: d.brand,
      country: d.country,
      hasBookings: d.hasBookings,
      count: d.count,
    }))
  }, [dotData])

  const layers = useMemo(() => {
    const isDark = currentTheme === 'dark'

    return [
      // Soft glow behind the reservation routes.
      new ArcLayer({
        id: 'arcs-glow',
        data: arcData.filter(d => d.hasBookings),
        pickable: false,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getSourceColor: d => {
          const c = BRAND_COLORS[d.brand]?.dot || [59, 130, 246]
          return [...c, isDark ? 45 : 25]
        },
        getTargetColor: d => {
          const c = BRAND_COLORS[d.brand]?.dot || [59, 130, 246]
          return [...c, 0]
        },
        getWidth: 5,
        getHeight: 0.38,
        greatCircle: true,
        opacity: isDark ? 0.8 : 0.5,
      }),

      // Main route.
      new ArcLayer({
        id: 'arcs',
        data: arcData,
        pickable: true,
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getSourceColor: d => {
          const c = BRAND_COLORS[d.brand]?.dot || [59, 130, 246]
          return d.hasBookings ? [...c, isDark ? 225 : 205] : [...c, 45]
        },
        getTargetColor: d => {
          const c = BRAND_COLORS[d.brand]?.dot || [59, 130, 246]
          return d.hasBookings ? [...c, isDark ? 110 : 80] : [...c, 20]
        },
        getWidth: d => d.hasBookings ? 1.8 : 0.8,
        getHeight: d => d.hasBookings ? 0.42 : 0.28,
        greatCircle: true,
        opacity: isDark ? 0.9 : 0.72,
      }),

      // Country / partner nodes.
      new ScatterplotLayer({
        id: 'dots',
        data: dotData,
        pickable: true,
        radiusScale: 40,
        radiusMinPixels: 4,
        radiusMaxPixels: 18,
        getPosition: d => d.position,
        getFillColor: d => {
          const c = BRAND_COLORS[d.brand]?.dot || [59, 130, 246]
          return d.hasBookings
            ? [...c, isDark ? 245 : 225]
            : [...c, isDark ? 90 : 65]
        },
        getRadius: d =>
          d.hasBookings
            ? Math.sqrt(d.count) * 6500 + 4500
            : 2800,
        getLineColor: isDark
          ? [210, 220, 235, 220]
          : [70, 82, 100, 180],
        stroked: true,
        lineWidthMinPixels: 1.2,
        lineWidthMaxPixels: 2,
        opacity: 0.95,
      }),

      // Main Morocco hub.
      new ScatterplotLayer({
        id: 'hub',
        data: [{
          position: HUB,
          label: 'MOROCCO HUB',
        }],
        pickable: true,
        radiusScale: 55,
        radiusMinPixels: 7,
        radiusMaxPixels: 22,
        getPosition: d => d.position,
        getRadius: 6500,
        getFillColor: isDark
          ? [59, 130, 246, 245]
          : [37, 99, 235, 235],
        getLineColor: [255, 255, 255, 235],
        stroked: true,
        lineWidthMinPixels: 2,
        opacity: 1,
      }),
    ]
  }, [dotData, arcData, currentTheme])

  const getTooltip = useCallback(({ object, layer }) => {
    if (!object) return null

    if (layer?.id === 'hub') {
      return {
        html: `
          <div class="live-map-tooltip">
            <strong>Morocco Hub</strong>
            <div>Live reservation origin</div>
          </div>
        `,
      }
    }

    if (layer?.id === 'arcs' || layer?.id === 'arcs-glow') {
      return {
        html: `
          <div class="live-map-tooltip">
            <strong>${object.country}</strong>
            <div>→ Morocco Hub</div>
            <small>${object.brand} · ${object.count || 0} reservations</small>
          </div>
        `,
      }
    }

    return {
      html: `
        <div class="live-map-tooltip">
          <strong>${object.country}</strong>
          <div>${object.hasBookings ? `${object.count} reservations` : 'No bookings yet'}</div>
          <small>${object.brand}</small>
        </div>
      `,
    }
  }, [])

  const applyGlobeTheme = useCallback((map, mode) => {
    const isDark = mode === 'dark'

    // Globe atmosphere / space.
    if (map.getProjection()?.name === 'globe') {
      map.setFog({
        'range': [0.5, 10],
        'horizon-blend': isDark ? 0.12 : 0.06,
        'color': isDark ? '#172033' : '#E9EEF5',
        'high-color': isDark ? '#0B1220' : '#DCE5EF',
        'space-color': isDark ? '#070B12' : '#F7F9FC',
        'star-intensity': isDark ? 0.12 : 0.0,
      })
    }

    // Subtle globe atmosphere color.
    try {
      map.setLight({
        anchor: 'viewport',
        color: isDark ? '#D8E7FF' : '#FFFFFF',
        intensity: isDark ? 0.22 : 0.7,
      })
    } catch (_) {}
  }, [])

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const initialStyle =
      currentTheme === 'dark'
        ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
        : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: [10, 20],
      zoom: 1.15,
      pitch: 25,
      bearing: 0,
      attributionControl: false,
      projection: 'globe',
      antialias: true,
      dragRotate: true,
      touchPitch: true,
    })

    mapRef.current = map

    const onStyleReady = () => {
      applyGlobeTheme(map, currentTheme)

      try {
        if (!overlayRef.current) {
          const overlay = new MapboxOverlay({
            interleaved: true,
            layers: [],
            getTooltip,
          })

          map.addControl(overlay)
          overlayRef.current = overlay
        }

        overlayRef.current.setProps({
          layers,
          getTooltip,
        })
      } catch (err) {
        console.warn('Deck overlay failed:', err)
      }
    }

    map.once('load', onStyleReady)

    // Slow cinematic rotation.
    let bearing = 0

    const rotate = () => {
      if (!mapRef.current) return

      bearing = (bearing + 0.006) % 360
      mapRef.current.setBearing(bearing)
      rotationRef.current = requestAnimationFrame(rotate)
    }

    const startRotation = () => {
      if (!rotationRef.current) {
        rotationRef.current = requestAnimationFrame(rotate)
      }
    }

    const stopRotation = () => {
      if (rotationRef.current) {
        cancelAnimationFrame(rotationRef.current)
        rotationRef.current = null
      }
    }

    const timeout = setTimeout(startRotation, 2500)

    const handleMouseDown = stopRotation
    const handleTouchStart = stopRotation
    const handleMouseUp = () => setTimeout(startRotation, 6000)
    const handleTouchEnd = () => setTimeout(startRotation, 6000)

    map.on('mousedown', handleMouseDown)
    map.on('mouseup', handleMouseUp)
    map.on('touchstart', handleTouchStart)
    map.on('touchend', handleTouchEnd)

    return () => {
      clearTimeout(timeout)
      stopRotation()

      map.off('mousedown', handleMouseDown)
      map.off('mouseup', handleMouseUp)
      map.off('touchstart', handleTouchStart)
      map.off('touchend', handleTouchEnd)

      if (overlayRef.current) {
        try {
          map.removeControl(overlayRef.current)
        } catch (_) {}
        overlayRef.current = null
      }

      map.remove()
      mapRef.current = null
    }
  }, [])

  // Switch Carto's light/dark globe when the dashboard theme changes.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const nextStyle =
      currentTheme === 'dark'
        ? 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
        : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

    map.setStyle(nextStyle, { diff: true })

    const refresh = () => {
      applyGlobeTheme(map, currentTheme)

      if (overlayRef.current) {
        overlayRef.current.setProps({
          layers,
          getTooltip,
        })
      }
    }

    map.once('style.load', refresh)

    return () => map.off('style.load', refresh)
  }, [currentTheme, applyGlobeTheme, layers, getTooltip])

  useEffect(() => {
    if (overlayRef.current) {
      try {
        overlayRef.current.setProps({
          layers,
          getTooltip,
        })
      } catch (_) {}
    }
  }, [layers, getTooltip])

  return (
    <div
      ref={mapContainerRef}
      className={`live-map live-map--${currentTheme}`}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 320,
        borderRadius: '14px',
        overflow: 'hidden',
        background:
          currentTheme === 'dark'
            ? '#070B12'
            : '#F4F7FA',
      }}
    >
      <style>{`
        .live-map .maplibregl-canvas {
          outline: none;
        }

        .live-map .maplibregl-ctrl-bottom-right,
        .live-map .maplibregl-ctrl-bottom-left {
          display: none;
        }

        .live-map-tooltip {
          min-width: 150px;
          padding: 10px 12px;
          border-radius: 10px;
          font-family: Inter, system-ui, sans-serif;
          font-size: 12px;
          line-height: 1.45;
          background: ${
            currentTheme === 'dark'
              ? 'rgba(14, 22, 35, 0.94)'
              : 'rgba(255, 255, 255, 0.96)'
          };
          color: ${
            currentTheme === 'dark'
              ? '#F5F8FC'
              : '#172033'
          };
          border: 1px solid ${
            currentTheme === 'dark'
              ? 'rgba(120, 150, 190, 0.20)'
              : 'rgba(60, 80, 110, 0.15)'
          };
          box-shadow: 0 12px 35px rgba(0,0,0,.22);
          backdrop-filter: blur(12px);
        }

        .live-map-tooltip strong {
          display: block;
          margin-bottom: 2px;
          font-size: 13px;
          letter-spacing: .01em;
        }

        .live-map-tooltip small {
          display: block;
          margin-top: 3px;
          opacity: .65;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: .08em;
        }
      `}</style>
    </div>
  )
}
