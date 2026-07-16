import { useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

const COUNTRY_COORDS = {
  'ALBANIA': { lat: 41.1533, lng: 20.1683 },
  'ANTIGUA AND BARBUDA': { lat: 17.0608, lng: -61.7964 },
  'AZORES': { lat: 37.7412, lng: -25.6756 },
  'BOSNIA': { lat: 43.9159, lng: 17.6791 },
  'BOSNIA AND HERZEGOVINA': { lat: 43.9159, lng: 17.6791 },
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
  'USA': { lat: 37.0902, lng: -95.7129 },
  'UNITED STATES': { lat: 37.0902, lng: -95.7129 },
  'FRANCE': { lat: 46.2276, lng: 2.2137 },
  'UK': { lat: 55.3781, lng: -3.4360 },
  'SPAIN': { lat: 40.4637, lng: -3.7492 },
  'NETHERLANDS': { lat: 52.1326, lng: 5.2913 },
  'BELGIUM': { lat: 50.5039, lng: 4.4699 },
  'SWITZERLAND': { lat: 46.8182, lng: 8.2275 },
  'AUSTRIA': { lat: 47.5162, lng: 14.5501 },
  'TUNISIA': { lat: 33.8869, lng: 9.5375 },
  'ALGERIA': { lat: 28.0339, lng: 1.6596 },
  'EGYPT': { lat: 26.8206, lng: 30.8025 },
  'UAE': { lat: 23.4241, lng: 53.8478 },
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

function createDotMarker(color) {
  return L.divIcon({
    className: 'simple-dot-marker',
    html: `<div class="dot-marker" style="background:${color}"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -7],
  })
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
  const markersRef = useRef([])

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

    const map = L.map(containerRef.current, {
      center: [30, 10],
      zoom: 2,
      minZoom: 2,
      maxZoom: 5,
      scrollWheelZoom: false,
      zoomControl: false,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!mapRef.current) return

    markersRef.current.forEach((m) => mapRef.current.removeLayer(m))
    markersRef.current = []

    markersToShow.forEach((marker) => {
      const m = L.marker([marker.lat, marker.lng], {
        icon: createDotMarker(marker.color),
      })
        .addTo(mapRef.current)
        .bindPopup(
          `<div style="font-size:13px;font-weight:600">${marker.country}</div>
           <div style="font-size:11px;color:#64748b">${marker.brand}</div>`
        )

      markersRef.current.push(m)
    })
  }, [markersToShow])

  return (
    <>
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', borderRadius: '14px' }}
      />
      <style>{`
        .simple-dot-marker {
          background: transparent !important;
          border: none !important;
        }
        .dot-marker {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 1px 4px rgba(0,0,0,0.25);
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px !important;
          box-shadow: 0 2px 12px rgba(0,0,0,0.12) !important;
          border: 1px solid #e2e8f0 !important;
        }
        .leaflet-popup-tip {
          background: white !important;
        }
        .leaflet-container {
          background: #e8ecf4 !important;
          font-family: 'Inter', system-ui, -apple-system, sans-serif !important;
        }
      `}</style>
    </>
  )
}