import { useEffect, useRef, useMemo, useCallback } from 'react'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { ScatterplotLayer, ArcLayer } from '@deck.gl/layers'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// ═══════════════════════════════════════════════════════════
// GREY BASEMAP — Clean, minimal, grey earth
// ═══════════════════════════════════════════════════════════
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

// Brand colors
const BRAND_COLORS = {
  UNITED: { arc: [15, 39, 162, 160], dot: [15, 39, 162] },     // Blue
  MOVIS:  { arc: [249, 66, 49, 160], dot: [249, 66, 49] },      // Red  
  DRIVO:  { arc: [163, 197, 32, 160], dot: [163, 197, 32] },   // Green
}

// ALL partner countries with their assigned brand
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

export function LiveMap({ bookings = [] }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const overlayRef = useRef(null)
  const rotationRef = useRef(null)

  // Build dot data: ALL partner countries
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
      const dot = dots.find(d => normalizeCountry(d.country) === country)
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
    }))
  }, [dotData])

  const layers = useMemo(() => [
    new ArcLayer({
      id: 'arcs',
      data: arcData,
      pickable: true,
      getSourcePosition: d => d.source,
      getTargetPosition: d => d.target,
      getSourceColor: d => BRAND_COLORS[d.brand]?.arc || [150, 150, 150, 100],
      getTargetColor: d => BRAND_COLORS[d.brand]?.arc || [150, 150, 150, 30],
      getWidth: 1.2,
      getHeight: 0.35,
      greatCircle: true,
      opacity: 0.6,
    }),

    new ScatterplotLayer({
      id: 'dots',
      data: dotData,
      pickable: true,
      radiusScale: 40,
      radiusMinPixels: 5,
      radiusMaxPixels: 16,
      getPosition: d => d.position,
      getFillColor: d => {
        const c = BRAND_COLORS[d.brand]?.dot || [15, 39, 162]
        return d.hasBookings ? [...c, 230] : [...c, 120]
      },
      getRadius: d => d.hasBookings ? Math.sqrt(d.count) * 6000 + 4000 : 3000,
      getLineColor: [255, 255, 255, 200],
      stroked: true,
      lineWidthMinPixels: 1.5,
      lineWidthMaxPixels: 2,
      opacity: 0.9,
    }),
  ], [dotData, arcData])

  const getTooltip = useCallback(({ object, layer }) => {
    if (!object) return null
    if (layer?.id === 'arcs') {
      return {
        html: `<div style="padding:8px 12px;font-family:system-ui,sans-serif;font-size:12px;background:#fff;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);"><b>${object.country}</b> → Hub<br/><span style="color:#666;">Brand: ${object.brand}</span></div>`,
      }
    }
    return {
      html: `<div style="padding:8px 12px;font-family:system-ui,sans-serif;font-size:12px;background:#fff;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.15);"><b style="color:${BRAND_COLORS[object.brand]?.dot ? `rgb(${BRAND_COLORS[object.brand].dot.join(',')})` : '#333'}">${object.country}</b><br/>${object.hasBookings ? `${object.count} reservations` : 'No bookings yet'}<br/><span style="color:#888;font-size:11px;">Brand: ${object.brand}</span></div>`,
    }
  }, [])

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center: [10, 20],
      zoom: 1.2,
      pitch: 45,
      bearing: 0,
      attributionControl: false,
      projection: 'globe',
      antialias: true,
    })

    mapRef.current = map

    map.once('load', () => {
      // GREY atmosphere — no blue tint
      if (map.getProjection()?.name === 'globe') {
        map.setFog({
          'horizon-blend': 0.2,
          'color': '#6b6b6b',        // Grey horizon
          'high-color': '#f0f0f0',   // Light grey sky
          'space-color': '#797979',  // Grey space
          'star-intensity': 0.0
        })
      }

      try {
        const overlay = new MapboxOverlay({ interleaved: true, layers: [], getTooltip })
        map.addControl(overlay)
        overlayRef.current = overlay
        overlay.setProps({ layers })
      } catch (err) {
        console.warn('Deck overlay failed:', err)
      }
    })

    // Auto-rotation
    let bearing = 0
    const rotate = () => {
      if (!mapRef.current) return
      bearing = (bearing + 0.04) % 360
      mapRef.current.setBearing(bearing)
      rotationRef.current = requestAnimationFrame(rotate)
    }
    const timeout = setTimeout(() => { rotationRef.current = requestAnimationFrame(rotate) }, 3000)

    const handleMouseDown = () => { if (rotationRef.current) { cancelAnimationFrame(rotationRef.current); rotationRef.current = null } }
    const handleMouseUp = () => { setTimeout(() => { if (!rotationRef.current && mapRef.current) rotationRef.current = requestAnimationFrame(rotate) }, 6000) }
    map.on('mousedown', handleMouseDown)
    map.on('mouseup', handleMouseUp)

    return () => {
      clearTimeout(timeout)
      if (rotationRef.current) cancelAnimationFrame(rotationRef.current)
      map.off('mousedown', handleMouseDown)
      map.off('mouseup', handleMouseUp)
      if (overlayRef.current) { map.removeControl(overlayRef.current); overlayRef.current = null }
      map.remove()
      mapRef.current = null
    }
  }, [getTooltip])

  useEffect(() => {
    if (overlayRef.current) {
      try { overlayRef.current.setProps({ layers }) } catch (e) {}
    }
  }, [layers])

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100%', borderRadius: '14px' }} />
}