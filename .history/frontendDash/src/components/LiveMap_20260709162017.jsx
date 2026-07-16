import { useEffect, useRef, useMemo } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// ── IMPORTANT: Mets ta clé Mapbox ici (gratuit sur mapbox.com) ──
// Ou utilise un style public sans clé
const MAPBOX_TOKEN = 'pk.eyJ1IjoidW5pdGVkcmVudGFjYXIiLCJhIjoiY2x...' // ← ta clé

// ── Country → Lat/Lng (tes partenaires) ──
const COUNTRY_COORDS = {
  'ALBANIA': { lat: 41.1533, lng: 20.1683 },
  'ANTIGUA AND BARBUDA': { lat: 17.0608, lng: -61.7964 },
  'AZORES': { lat: 37.7412, lng: -25.6756 },
  'BOSNIA': { lat: 43.9159, lng: 17.6791 },
  'BULGARIA': { lat: 42.7339, lng: 25.4858 },
  'CORFU': { lat: 39.6243, lng: 19.9217 },
  'CROATIA': { lat: 45.1000, lng: 15.2000 },
  'CYPRES': { lat: 35.1264, lng: 33.4299 },
  'CYPRUS': { lat: 35.1264, lng: 33.4299 },
  'DOMINICAN': { lat: 18.7357, lng: -70.1627 },
  'DOMINICAN REPUBLIC': { lat: 18.7357, lng: -70.1627 },
  'FLORIDA': { lat: 27.6648, lng: -81.5158 },
  'GERMANY': { lat: 51.1657, lng: 10.4515 },
  'GREECE': { lat: 39.0742, lng: 21.8243 },
  'ITALY': { lat: 41.8719, lng: 12.5674 },
  'JAMAICA': { lat: 18.1096, lng: -77.2975 },
  'MALTA': { lat: 35.9375, lng: 14.3754 },
  'MAURITIUS': { lat: -20.3484, lng: 57.5522 },
  'MIAMI': { lat: 25.7617, lng: -80.1918 },
  'MONTENEGRO': { lat: 42.7087, lng: 19.3744 },
  'MOROCCO': { lat: 31.7917, lng: -7.0926 },
  'POLAND': { lat: 51.9194, lng: 19.1451 },
  'PORTUGAL': { lat: 39.3999, lng: -8.2245 },
  'SERBIA': { lat: 44.0165, lng: 21.0059 },
  'SINT MAARTEN': { lat: 18.0425, lng: -63.0548 },
  'TURCS AND CAICOS': { lat: 21.6940, lng: -71.7979 },
  'TURKS AND CAICOS': { lat: 21.6940, lng: -71.7979 },
  'TURKEY': { lat: 38.9637, lng: 35.2433 },
}

function normalizeCountry(name) {
  if (!name) return null
  return name.toString().toUpperCase().trim()
}

function getCountryCoords(countryName) {
  const normalized = normalizeCountry(countryName)
  if (!normalized) return null
  return COUNTRY_COORDS[normalized] || null
}

const BRAND_COLORS = {
  UNITED: '#0f27a2',
  MOVIS: '#f94231',
  DRIVO: '#a3c520',
}

function getMarkerColor(brand) {
  return BRAND_COLORS[brand?.toUpperCase()] || '#3b82f6'
}

const PARTNER_COUNTRIES = [
  'ALBANIA', 'ANTIGUA AND BARBUDA', 'AZORES', 'BOSNIA', 'BULGARIA',
  'CORFU', 'CROATIA', 'CYPRES', 'DOMINICAN', 'FLORIDA', 'GERMANY',
  'GREECE', 'ITALY', 'JAMAICA', 'MALTA', 'MAURITIUS', 'MIAMI',
  'MONTENEGRO', 'MOROCCO', 'POLAND', 'PORTUGAL', 'SERBIA',
  'SINT MAARTEN', 'TURCS AND CAICOS', 'TURKEY',
]

export function LiveMap({ bookings = [] }) {
  const mapRef = useRef(null)
  const containerRef = useRef(null)

  const bookingMarkers = useMemo(() => {
    const seen = new Set()
    const markers = []

    bookings.forEach((booking) => {
      const country = booking.country || booking.location
      if (!country) return

      const normalized = normalizeCountry(country)
      if (seen.has(normalized)) return
      seen.add(normalized)

      const coords = getCountryCoords(country)
      if (!coords) return

      const brand = booking.brand || 'UNITED'
      const color = getMarkerColor(brand)

      markers.push({
        id: normalized,
        lat: coords.lat,
        lng: coords.lng,
        country: normalized,
        color,
        brand,
      })
    })

    return markers
  }, [bookings])

  const partnerMarkers = useMemo(() => {
    return PARTNER_COUNTRIES.map((country) => {
      const coords = getCountryCoords(country)
      if (!coords) return null
      return {
        id: country,
        lat: coords.lat,
        lng: coords.lng,
        country,
        color: '#3b82f6',
        brand: 'UNITED',
      }
    }).filter(Boolean)
  }, [])

  const markersToShow = bookingMarkers.length > 0 ? bookingMarkers : partnerMarkers

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    mapboxgl.accessToken = MAPBOX_TOKEN

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11', // Style clair
      center: [10, 30],
      zoom: 1.5,
      projection: 'globe', // ← GLOBE 3D !
      attributionControl: false,
      dragRotate: false,
      touchZoomRotate: false,
    })

    // Add atmosphere + stars for globe effect
    map.on('style.load', () => {
      map.setFog({
        'color': 'rgb(255, 255, 255)',
        'high-color': 'rgb(200, 200, 225)',
        'space-color': 'rgb(240, 240, 245)',
        'horizon-blend': 0.1,
        'star-intensity': 0.0
      })
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Add markers
  useEffect(() => {
    if (!mapRef.current) return

    // Remove existing markers (simple approach: reload all)
    const existing = document.querySelectorAll('.mapboxgl-marker')
    existing.forEach((el) => el.remove())

    markersToShow.forEach((marker) => {
      const el = document.createElement('div')
      el.className = 'globe-marker'
      el.style.cssText = `
        width: 14px;
        height: 14px;
        background: ${marker.color};
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 12px ${marker.color}, 0 0 24px ${marker.color}40;
        cursor: pointer;
      `

      new mapboxgl.Marker(el)
        .setLngLat([marker.lng, marker.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 10 })
            .setHTML(`<div style="font-size:13px;font-weight:600">${marker.country}</div>
                      <div style="font-size:11px;color:#64748b">${marker.brand}</div>`)
        )
        .addTo(mapRef.current)
    })
  }, [markersToShow])

  return (
    <>
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', borderRadius: '14px' }}
      />
      <style>{`
        .mapboxgl-popup-content {
          border-radius: 10px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important;
          border: 1px solid #e2e8f0 !important;
          padding: 12px 16px !important;
        }
        .mapboxgl-popup-tip {
          border-top-color: white !important;
        }
      `}</style>
    </>
  )
}