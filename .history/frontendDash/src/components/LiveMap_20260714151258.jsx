import { useEffect, useRef, useMemo, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// ═══════════════════════════════════════════════════════════
// LIGHT/WHITE STYLES
// ═══════════════════════════════════════════════════════════
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
// Alternatives:
// const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
// const MAP_STYLE = 'https://tiles.stadiamaps.com/styles/alidade_smooth.json'

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

// Brand colors for LIGHT background
const BRAND_COLORS = {
  UNITED: { fill: '#e8ecf8', stroke: '#0f27a2', text: '#0f27a2' },
  MOVIS:  { fill: '#fdecea', stroke: '#f94231', text: '#f94231' },
  DRIVO:  { fill: '#f3f7e0', stroke: '#a3c520', text: '#5a6b0a' },
}

const PARTNER_COUNTRIES = [
  'ALBANIA', 'ANTIGUA AND BARBUDA', 'AZORES', 'BOSNIA', 'BULGARIA',
  'CORFU', 'CROATIA', 'CYPRES', 'DOMINICAN', 'FLORIDA', 'GERMANY',
  'GREECE', 'ITALY', 'JAMAICA', 'MALTA', 'MAURITIUS', 'MIAMI',
  'MONTENEGRO', 'MOROCCO', 'POLAND', 'PORTUGAL', 'SERBIA',
  'SINT MAARTEN', 'TURCS AND CAICOS', 'TURKEY',
]

function normalizeCountry(name) {
  if (!name) return null
  return name.toString().toUpperCase().trim()
}

function getCountryCoords(countryName) {
  const normalized = normalizeCountry(countryName)
  if (!normalized) return null
  return COUNTRY_COORDS[normalized] || null
}

// Create clean dot marker for light theme
function createDotMarker(count, brand, isPartner) {
  const colors = isPartner 
    ? { fill: '#e2e8f0', stroke: '#94a3b8', text: '#64748b' }
    : (BRAND_COLORS[brand] || BRAND_COLORS.UNITED)
  
  const size = Math.min(16 + count * 1.2, 32)
  
  const el = document.createElement('div')
  el.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    position: relative;
    cursor: pointer;
  `
  
  el.innerHTML = `
    <div style="
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: ${size * 0.45}px;
      height: ${size * 0.45}px;
      border-radius: 50%;
      background: ${colors.stroke};
      border: 2px solid #ffffff;
      box-shadow: 0 0 0 3px ${colors.fill}, 0 2px 8px rgba(0,0,0,0.15);
    "></div>
  `
  
  return el
}

export function LiveMap({ bookings = [] }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const rotationRef = useRef(null)
  const [currentStyle, setCurrentStyle] = useState(MAP_STYLE)

  const locationData = useMemo(() => {
    const grouped = {}
    bookings.forEach((booking) => {
      const country = booking.country || booking.location
      if (!country) return
      const normalized = normalizeCountry(country)
      const coords = getCountryCoords(country)
      if (!coords) return
      if (!grouped[normalized]) {
        grouped[normalized] = { position: [coords.lng, coords.lat], country: normalized, count: 0, brands: {} }
      }
      grouped[normalized].count += 1
      const brand = (booking.brand || 'UNITED').toUpperCase()
      grouped[normalized].brands[brand] = (grouped[normalized].brands[brand] || 0) + 1
    })
    if (Object.keys(grouped).length === 0) {
      PARTNER_COUNTRIES.forEach((country) => {
        const coords = getCountryCoords(country)
        if (!coords) return
        grouped[country] = { position: [coords.lng, coords.lat], country, count: 1, brands: { UNITED: 1 }, isPartner: true }
      })
    }
    return Object.values(grouped)
  }, [bookings])

  const getDominantBrand = (brands) => {
    return Object.entries(brands).sort((a, b) => b[1] - a[1])[0]?.[0] || 'UNITED'
  }

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: currentStyle,
      center: [10, 25],
      zoom: 1.3,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
      projection: 'globe',
    })

    mapRef.current = map

    // Auto-rotation
    let bearing = 0
    const rotate = () => {
      if (!mapRef.current) return
      bearing = (bearing + 0.06) % 360
      mapRef.current.setBearing(bearing)
      rotationRef.current = requestAnimationFrame(rotate)
    }
    
    const timeout = setTimeout(() => {
      rotationRef.current = requestAnimationFrame(rotate)
    }, 3000)

    const handleMouseDown = () => {
      if (rotationRef.current) {
        cancelAnimationFrame(rotationRef.current)
        rotationRef.current = null
      }
    }
    map.on('mousedown', handleMouseDown)
    
    let resumeTimeout
    const handleMouseUp = () => {
      clearTimeout(resumeTimeout)
      resumeTimeout = setTimeout(() => {
        if (!rotationRef.current && mapRef.current) {
          rotationRef.current = requestAnimationFrame(rotate)
        }
      }, 5000)
    }
    map.on('mouseup', handleMouseUp)

    return () => {
      clearTimeout(timeout)
      clearTimeout(resumeTimeout)
      if (rotationRef.current) cancelAnimationFrame(rotationRef.current)
      map.off('mousedown', handleMouseDown)
      map.off('mouseup', handleMouseUp)
      map.remove()
      mapRef.current = null
    }
  }, [currentStyle])

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current

    // Clear old markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    // Add markers
    locationData.forEach((d) => {
      const brand = d.isPartner ? 'UNITED' : getDominantBrand(d.brands)
      const el = createDotMarker(d.count, brand, d.isPartner)
      
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(d.position)
        .setPopup(new maplibregl.Popup({ offset: 10 }).setHTML(`
          <div style="padding:10px 14px;font-family:system-ui,sans-serif;">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px;color:${BRAND_COLORS[brand]?.text || '#333'};">${d.country}</div>
            <div style="font-size:12px;color:#64748b;">${d.count} reservations</div>
            ${Object.entries(d.brands).map(([b, c]) => `<div style="font-size:11px;color:#64748b;">${b}: ${c}</div>`).join('')}
          </div>
        `))
        .addTo(map)
      
      markersRef.current.push(marker)
    })
  }, [locationData])

  const styles = [
    { name: 'Light', url: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json' },
    { name: 'Voyager', url: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json' },
    { name: 'Smooth', url: 'https://tiles.stadiamaps.com/styles/alidade_smooth.json' },
  ]

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '14px', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 10,
        display: 'flex',
        gap: '4px',
        background: 'rgba(255,255,255,0.95)',
        padding: '6px',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #e2e8f0',
      }}>
        {styles.map(({ name, url }) => (
          <button
            key={name}
            onClick={() => setCurrentStyle(url)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '10px',
              fontWeight: 700,
              cursor: 'pointer',
              background: currentStyle === url ? '#0f27a2' : 'transparent',
              color: currentStyle === url ? '#fff' : '#64748b',
              transition: 'all 0.15s',
            }}
          >
            {name}
          </button>
        ))}
      </div>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}