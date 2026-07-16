import { useEffect, useRef, useMemo, useCallback, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json'

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
  UNITED: { fill: '#c8d4f5', stroke: '#0f27a2', glow: 'rgba(15,39,162,0.4)' },
  MOVIS:  { fill: '#ffd4d1', stroke: '#f94231', glow: 'rgba(249,66,49,0.4)' },
  DRIVO:  { fill: '#e0f0a0', stroke: '#a3c520', glow: 'rgba(163,197,32,0.4)' },
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

// Create a custom marker element with brand colors
function createMarkerElement(count, brand, isPartner) {
  const colors = isPartner 
    ? { fill: '#e0e0e0', stroke: '#999999', glow: 'rgba(150,150,150,0.3)' }
    : (BRAND_COLORS[brand] || BRAND_COLORS.UNITED)
  
  const size = Math.min(24 + count * 2, 48)
  
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
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${colors.glow};
      animation: pulse 2s ease-out infinite;
    "></div>
    <div style="
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: ${size * 0.5}px;
      height: ${size * 0.5}px;
      border-radius: 50%;
      background: ${colors.fill};
      border: 2px solid ${colors.stroke};
      box-shadow: 0 0 8px ${colors.glow};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9px;
      font-weight: 700;
      color: ${colors.stroke};
      font-family: system-ui, sans-serif;
    ">${count > 1 ? count : ''}</div>
  `
  
  // Add pulse animation style if not already added
  if (!document.getElementById('map-pulse-style')) {
    const style = document.createElement('style')
    style.id = 'map-pulse-style'
    style.textContent = `
      @keyframes pulse {
        0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
        100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
      }
    `
    document.head.appendChild(style)
  }
  
  return el
}

export function LiveMap({ bookings = [] }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const canvasRef = useRef(null)
  const rotationRef = useRef(null)
  const [viewMode, setViewMode] = useState('globe') // 'globe' | 'flat'

  // Aggregate bookings
  const locationData = useMemo(() => {
    const grouped = {}

    bookings.forEach((booking) => {
      const country = booking.country || booking.location
      if (!country) return

      const normalized = normalizeCountry(country)
      const coords = getCountryCoords(country)
      if (!coords) return

      if (!grouped[normalized]) {
        grouped[normalized] = {
          position: [coords.lng, coords.lat],
          country: normalized,
          count: 0,
          brands: {},
        }
      }
      grouped[normalized].count += 1
      const brand = (booking.brand || 'UNITED').toUpperCase()
      grouped[normalized].brands[brand] = (grouped[normalized].brands[brand] || 0) + 1
    })

    if (Object.keys(grouped).length === 0) {
      PARTNER_COUNTRIES.forEach((country) => {
        const coords = getCountryCoords(country)
        if (!coords) return
        grouped[country] = {
          position: [coords.lng, coords.lat],
          country,
          count: 1,
          brands: { UNITED: 1 },
          isPartner: true,
        }
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
      style: MAP_STYLE,
      center: [10, 25],
      zoom: 1.3,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
      projection: viewMode === 'globe' ? 'globe' : 'mercator',
    })

    mapRef.current = map

    // Add canvas overlay for arcs
    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;'
    mapContainerRef.current.appendChild(canvas)
    canvasRef.current = canvas

    // Auto-rotation
    let bearing = 0
    const rotate = () => {
      if (!mapRef.current) return
      bearing = (bearing + 0.08) % 360
      mapRef.current.setBearing(bearing)
      rotationRef.current = requestAnimationFrame(rotate)
    }
    
    const timeout = setTimeout(() => {
      rotationRef.current = requestAnimationFrame(rotate)
    }, 3000)

    // Pause on interaction
    const handleMouseDown = () => {
      if (rotationRef.current) {
        cancelAnimationFrame(rotationRef.current)
        rotationRef.current = null
      }
    }
    map.on('mousedown', handleMouseDown)
    
    // Resume after 5 seconds of inactivity
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
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas)
      map.remove()
      mapRef.current = null
    }
  }, [viewMode])

  // Update markers and arcs when data changes
  useEffect(() => {
    if (!mapRef.current) return

    const map = mapRef.current

    // Clear old markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    // Add new markers
    locationData.forEach((d) => {
      const brand = d.isPartner ? 'UNITED' : getDominantBrand(d.brands)
      const el = createMarkerElement(d.count, brand, d.isPartner)
      
      const marker = new maplibregl.Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat(d.position)
        .setPopup(
          new maplibregl.Popup({ offset: 10 }).setHTML(`
            <div style="padding:8px 12px;font-family:system-ui,sans-serif;">
              <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${d.country}</div>
              <div style="font-size:12px;color:#475569;">${d.count} reservations</div>
              ${Object.entries(d.brands).map(([b, c]) => `<div style="font-size:11px;color:#64748b;">${b}: ${c}</div>`).join('')}
            </div>
          `)
        )
        .addTo(map)
      
      markersRef.current.push(marker)
    })

    // Draw arcs on canvas
    const drawArcs = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * window.devicePixelRatio
      canvas.height = rect.height * window.devicePixelRatio
      
      const ctx = canvas.getContext('2d')
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      ctx.clearRect(0, 0, rect.width, rect.height)

      const hub = map.project([10, 35])
      
      locationData.forEach((d) => {
        const pos = map.project(d.position)
        const brand = d.isPartner ? 'UNITED' : getDominantBrand(d.brands)
        const colors = BRAND_COLORS[brand] || BRAND_COLORS.UNITED
        
        // Draw curved arc
        ctx.beginPath()
        ctx.strokeStyle = colors.stroke
        ctx.lineWidth = Math.max(1, Math.min(d.count * 0.5, 3))
        ctx.globalAlpha = 0.4
        
        const midX = (pos.x + hub.x) / 2
        const midY = (pos.y + hub.y) / 2 - 30 // Arc upward
        
        ctx.moveTo(pos.x, pos.y)
        ctx.quadraticCurveTo(midX, midY, hub.x, hub.y)
        ctx.stroke()
        
        // Draw glow at destination
        ctx.beginPath()
        ctx.fillStyle = colors.glow
        ctx.globalAlpha = 0.3
        ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2)
        ctx.fill()
      })
      
      ctx.globalAlpha = 1
    }

    // Draw arcs on move
    const handleMove = () => drawArcs()
    map.on('move', handleMove)
    
    // Initial draw
    setTimeout(drawArcs, 500)

    return () => {
      map.off('move', handleMove)
    }
  }, [locationData])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '14px', overflow: 'hidden' }}>
      {/* View toggle */}
      <div style={{
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 10,
        display: 'flex',
        gap: '4px',
        background: 'rgba(255,255,255,0.95)',
        padding: '4px',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        {[
          { key: 'globe', label: 'Globe' },
          { key: 'flat', label: 'Flat' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setViewMode(key)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              background: viewMode === key ? '#0f27a2' : 'transparent',
              color: viewMode === key ? '#fff' : '#475569',
            }}
          >
            {label}
          </button>
        ))}
      </div>
      
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}