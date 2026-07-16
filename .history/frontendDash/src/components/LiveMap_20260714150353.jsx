import { useEffect, useRef, useMemo, useCallback, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json'

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
  UNITED: { fill: '#0f27a2', stroke: '#4a7bff', glow: 'rgba(74,123,255,0.6)', neon: '#4a7bff' },
  MOVIS:  { fill: '#f94231', stroke: '#ff7b6b', glow: 'rgba(255,123,107,0.6)', neon: '#ff7b6b' },
  DRIVO:  { fill: '#a3c520', stroke: '#d4f060', glow: 'rgba(212,240,96,0.6)', neon: '#d4f060' },
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

function createNeonMarker(count, brand, isPartner) {
  const colors = isPartner 
    ? { fill: '#444444', stroke: '#888888', glow: 'rgba(136,136,136,0.4)', neon: '#888888' }
    : (BRAND_COLORS[brand] || BRAND_COLORS.UNITED)
  
  const size = Math.min(20 + count * 1.5, 40)
  
  const el = document.createElement('div')
  el.style.cssText = `
    width: ${size * 2}px;
    height: ${size * 2}px;
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
      animation: neon-pulse 2s ease-out infinite;
      filter: blur(4px);
    "></div>
    <div style="
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: ${size * 0.6}px;
      height: ${size * 0.6}px;
      border-radius: 50%;
      background: ${colors.fill};
      border: 2px solid ${colors.neon};
      box-shadow: 0 0 12px ${colors.glow}, 0 0 24px ${colors.glow};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: ${Math.max(8, size * 0.25)}px;
      font-weight: 800;
      color: #ffffff;
      font-family: system-ui, sans-serif;
      text-shadow: 0 0 4px rgba(0,0,0,0.8);
    ">${count > 1 ? count : ''}</div>
  `
  
  if (!document.getElementById('neon-pulse-style')) {
    const style = document.createElement('style')
    style.id = 'neon-pulse-style'
    style.textContent = `
      @keyframes neon-pulse {
        0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
        50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.3; }
        100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
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
  const drawArcsRef = useRef(null) // ← Store draw function here
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

    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;'
    mapContainerRef.current.appendChild(canvas)
    canvasRef.current = canvas

    // Auto-rotation with arc redraw
    let bearing = 0
    const rotate = () => {
      if (!mapRef.current) return
      bearing = (bearing + 0.06) % 360
      mapRef.current.setBearing(bearing)
      // Redraw arcs during rotation
      if (drawArcsRef.current) drawArcsRef.current()
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
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas)
      map.remove()
      mapRef.current = null
    }
  }, [currentStyle])

  // Update markers and arcs
  useEffect(() => {
    if (!mapRef.current) return
    const map = mapRef.current

    // Clear old markers
    markersRef.current.forEach(m => m.remove())
    markersRef.current = []

    // Add markers
    locationData.forEach((d) => {
      const brand = d.isPartner ? 'UNITED' : getDominantBrand(d.brands)
      const el = createNeonMarker(d.count, brand, d.isPartner)
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(d.position)
        .setPopup(new maplibregl.Popup({ offset: 10 }).setHTML(`
          <div style="padding:10px 14px;font-family:system-ui,sans-serif;background:#1a1a2e;color:#fff;border-radius:8px;">
            <div style="font-weight:700;font-size:14px;margin-bottom:6px;color:${BRAND_COLORS[brand]?.neon || '#fff'};">${d.country}</div>
            <div style="font-size:12px;color:#aaa;margin-bottom:4px;">${d.count} reservations</div>
            ${Object.entries(d.brands).map(([b, c]) => `<div style="font-size:11px;color:${BRAND_COLORS[b]?.neon || '#888'};">● ${b}: ${c}</div>`).join('')}
          </div>
        `))
        .addTo(map)
      markersRef.current.push(marker)
    })

    // Draw arcs function — stored in ref so rotation can call it
    const drawArcs = () => {
      const canvas = canvasRef.current
      if (!canvas || !mapRef.current) return
      
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
        
        // Neon arc
        ctx.beginPath()
        ctx.strokeStyle = colors.neon
        ctx.lineWidth = Math.max(1.5, Math.min(d.count * 0.4, 3))
        ctx.globalAlpha = 0.5
        ctx.shadowColor = colors.neon
        ctx.shadowBlur = 10
        
        const midX = (pos.x + hub.x) / 2
        const midY = (pos.y + hub.y) / 2 - 40
        
        ctx.moveTo(pos.x, pos.y)
        ctx.quadraticCurveTo(midX, midY, hub.x, hub.y)
        ctx.stroke()
        
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        
        // Glow dot
        ctx.beginPath()
        ctx.fillStyle = colors.glow
        ctx.globalAlpha = 0.4
        ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2)
        ctx.fill()
      })
      
      ctx.globalAlpha = 1
    }

    drawArcsRef.current = drawArcs

    // Draw on map move
    const handleMove = () => drawArcs()
    map.on('move', handleMove)
    setTimeout(drawArcs, 500)

    return () => {
      map.off('move', handleMove)
      drawArcsRef.current = null
    }
  }, [locationData])

  const styles = [
    { name: 'Dark Matter', url: 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json' },
    { name: 'Alidade Light', url: 'https://tiles.stadiamaps.com/styles/alidade_smooth_light.json' },
    { name: 'Protomaps', url: 'https://api.protomaps.com/styles/dark.json' },
    { name: 'Toner', url: 'https://tiles.stadiamaps.com/styles/stamen_toner.json' },
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
        background: 'rgba(20,20,30,0.9)',
        padding: '6px',
        borderRadius: '10px',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.1)',
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
              background: currentStyle === url ? '#4a7bff' : 'transparent',
              color: currentStyle === url ? '#fff' : '#888',
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