import { useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet icons in Vite
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

// ── Country → Lat/Lng (tes partenaires + communs) ──
const COUNTRY_COORDS = {
  'ALBANIA':              { lat: 41.1533, lng: 20.1683 },
  'ANTIGUA AND BARBUDA':  { lat: 17.0608, lng: -61.7964 },
  'AZORES':               { lat: 37.7412, lng: -25.6756 },
  'BOSNIA':               { lat: 43.9159, lng: 17.6791 },
  'BOSNIA AND HERZEGOVINA': { lat: 43.9159, lng: 17.6791 },
  'BULGARIA':             { lat: 42.7339, lng: 25.4858 },
  'CORFU':                { lat: 39.6243, lng: 19.9217 },
  'CROATIA':              { lat: 45.1000, lng: 15.2000 },
  'CYPRES':               { lat: 35.1264, lng: 33.4299 },
  'CYPRUS':               { lat: 35.1264, lng: 33.4299 },
  'DOMINICAN':            { lat: 18.7357, lng: -70.1627 },
  'DOMINICAN REPUBLIC':   { lat: 18.7357, lng: -70.1627 },
  'FLORIDA':              { lat: 27.6648, lng: -81.5158 },
  'GERMANY':              { lat: 51.1657, lng: 10.4515 },
  'GREECE':               { lat: 39.0742, lng: 21.8243 },
  'ITALY':                { lat: 41.8719, lng: 12.5674 },
  'JAMAICA':              { lat: 18.1096, lng: -77.2975 },
  'MALTA':                { lat: 35.9375, lng: 14.3754 },
  'MAURITIUS':            { lat: -20.3484, lng: 57.5522 },
  'MIAMI':                { lat: 25.7617, lng: -80.1918 },
  'MONTENEGRO':           { lat: 42.7087, lng: 19.3744 },
  'MOROCCO':              { lat: 31.7917, lng: -7.0926 },
  'POLAND':               { lat: 51.9194, lng: 19.1451 },
  'PORTUGAL':             { lat: 39.3999, lng: -8.2245 },
  'SERBIA':               { lat: 44.0165, lng: 21.0059 },
  'SINT MAARTEN':         { lat: 18.0425, lng: -63.0548 },
  'TURCS AND CAICOS':     { lat: 21.6940, lng: -71.7979 },
  'TURKS AND CAICOS':     { lat: 21.6940, lng: -71.7979 },
  'TURKEY':               { lat: 38.9637, lng: 35.2433 },
  'USA':                  { lat: 37.0902, lng: -95.7129 },
  'UNITED STATES':        { lat: 37.0902, lng: -95.7129 },
  'FRANCE':               { lat: 46.2276, lng: 2.2137 },
  'UK':                   { lat: 55.3781, lng: -3.4360 },
  'SPAIN':                { lat: 40.4637, lng: -3.7492 },
  'NETHERLANDS':          { lat: 52.1326, lng: 5.2913 },
  'BELGIUM':              { lat: 50.5039, lng: 4.4699 },
  'SWITZERLAND':          { lat: 46.8182, lng: 8.2275 },
  'AUSTRIA':              { lat: 47.5162, lng: 14.5501 },
  'TUNISIA':              { lat: 33.8869, lng: 9.5375 },
  'ALGERIA':              { lat: 28.0339, lng: 1.6596 },
  'EGYPT':                { lat: 26.8206, lng: 30.8025 },
  'UAE':                  { lat: 23.4241, lng: 53.8478 },
  'INDIA':                { lat: 20.5937, lng: 78.9629 },
  'CHINA':                { lat: 35.8617, lng: 104.1954 },
  'AUSTRALIA':            { lat: -25.2744, lng: 133.7751 },
  'BRAZIL':               { lat: -14.2350, lng: -51.9253 },
  'CANADA':               { lat: 56.1304, lng: -106.3468 },
  'MEXICO':               { lat: 23.6345, lng: -102.5528 },
  'SOUTH AFRICA':         { lat: -30.5595, lng: 22.9375 },
  'JAPAN':                { lat: 36.2048, lng: 138.2529 },
  'THAILAND':             { lat: 15.8700, lng: 100.9925 },
  'SINGAPORE':            { lat: 1.3521, lng: 103.8198 },
  'NEW ZEALAND':          { lat: -40.9006, lng: 174.8860 },
  'IRELAND':              { lat: 53.1424, lng: -7.6921 },
  'NORWAY':               { lat: 60.4720, lng: 8.4689 },
  'SWEDEN':               { lat: 60.1282, lng: 18.6435 },
  'DENMARK':              { lat: 56.2639, lng: 9.5018 },
  'FINLAND':              { lat: 61.9241, lng: 25.7482 },
  'ICELAND':              { lat: 64.9631, lng: -19.0208 },
  'LUXEMBOURG':           { lat: 49.8153, lng: 6.1296 },
  'CZECH REPUBLIC':       { lat: 49.8175, lng: 15.4730 },
  'HUNGARY':              { lat: 47.1625, lng: 19.5033 },
  'ROMANIA':              { lat: 45.9432, lng: 24.9668 },
  'SLOVENIA':             { lat: 46.1512, lng: 14.9955 },
  'SLOVAKIA':             { lat: 48.6690, lng: 19.6990 },
  'UKRAINE':              { lat: 48.3794, lng: 31.1656 },
  'RUSSIA':               { lat: 61.5240, lng: 105.3188 },
  'KENYA':                { lat: -0.0236, lng: 37.9062 },
  'NIGERIA':              { lat: 9.0820, lng: 8.6753 },
  'GHANA':                { lat: 7.9465, lng: -1.0232 },
  'SENEGAL':              { lat: 14.4974, lng: -14.4524 },
  'PAKISTAN':             { lat: 30.3753, lng: 69.3451 },
  'BANGLADESH':           { lat: 23.6850, lng: 90.3563 },
  'SRI LANKA':            { lat: 7.8731, lng: 80.7718 },
  'NEPAL':                { lat: 28.3949, lng: 84.1240 },
  'MALDIVES':             { lat: 3.2028, lng: 73.2207 },
  'MYANMAR':              { lat: 21.9162, lng: 95.9560 },
  'LAOS':                 { lat: 19.8563, lng: 102.4955 },
  'CAMBODIA':             { lat: 12.5657, lng: 104.9910 },
  'VIETNAM':              { lat: 14.0583, lng: 108.2772 },
  'MALAYSIA':             { lat: 4.2105, lng: 101.9758 },
  'INDONESIA':            { lat: -0.7893, lng: 113.9213 },
  'PHILIPPINES':          { lat: 12.8797, lng: 121.7740 },
  'TAIWAN':               { lat: 23.6978, lng: 120.9605 },
  'SOUTH KOREA':          { lat: 35.9078, lng: 127.7669 },
  'MONGOLIA':             { lat: 46.8625, lng: 103.8467 },
  'IRAN':                 { lat: 32.4279, lng: 53.6880 },
  'IRAQ':                 { lat: 33.2232, lng: 43.6793 },
  'SYRIA':                { lat: 34.8021, lng: 38.9968 },
  'LEBANON':              { lat: 33.8547, lng: 35.8623 },
  'JORDAN':               { lat: 30.5852, lng: 36.2384 },
  'ISRAEL':               { lat: 31.0461, lng: 34.8516 },
  'SAUDI ARABIA':         { lat: 23.8859, lng: 45.0792 },
  'KUWAIT':               { lat: 29.3117, lng: 47.4818 },
  'BAHRAIN':              { lat: 26.0667, lng: 50.5577 },
  'QATAR':                { lat: 25.3548, lng: 51.1839 },
  'OMAN':                 { lat: 21.4735, lng: 55.9754 },
  'YEMEN':                { lat: 15.5527, lng: 48.5164 },
  'AFGHANISTAN':          { lat: 33.9391, lng: 67.7100 },
  'LIBYA':                { lat: 26.3351, lng: 17.2283 },
  'SUDAN':                { lat: 12.8628, lng: 30.2176 },
  'ETHIOPIA':             { lat: 9.1450, lng: 40.4897 },
  'SOMALIA':              { lat: 5.1521, lng: 46.1996 },
  'UGANDA':               { lat: 1.3733, lng: 32.2903 },
  'TANZANIA':             { lat: -6.3690, lng: 34.8888 },
  'RWANDA':               { lat: -1.9403, lng: 29.8739 },
  'BURUNDI':              { lat: -3.3731, lng: 29.9189 },
  'CONGO':                { lat: -0.2280, lng: 15.8277 },
  'GABON':                { lat: -0.8037, lng: 11.6094 },
  'CAMEROON':             { lat: 7.3697, lng: 12.3547 },
  'CHAD':                 { lat: 15.4542, lng: 18.7322 },
  'NIGER':                { lat: 17.6078, lng: 8.0817 },
  'MALI':                 { lat: 17.5707, lng: -3.9962 },
  'BURKINA FASO':         { lat: 12.2383, lng: -1.5616 },
  'IVORY COAST':          { lat: 7.5400, lng: -5.5471 },
  'GUINEA':               { lat: 9.9456, lng: -9.6966 },
  'SIERRA LEONE':         { lat: 8.4606, lng: -11.7799 },
  'LIBERIA':              { lat: 6.4281, lng: -9.4295 },
  'TOGO':                 { lat: 8.6195, lng: 0.8248 },
  'BENIN':                { lat: 9.3077, lng: 2.3158 },
  'ANGOLA':               { lat: -11.2027, lng: 17.8739 },
  'ZAMBIA':               { lat: -13.1339, lng: 27.8493 },
  'ZIMBABWE':             { lat: -19.0154, lng: 29.1549 },
  'MALAWI':               { lat: -13.2543, lng: 34.3015 },
  'MOZAMBIQUE':           { lat: -18.6657, lng: 35.5296 },
  'MADAGASCAR':           { lat: -18.7669, lng: 46.8691 },
  'SEYCHELLES':           { lat: -4.6796, lng: 55.4920 },
  'NAMIBIA':              { lat: -22.9576, lng: 18.4904 },
  'BOTSWANA':             { lat: -22.3285, lng: 24.6849 },
  'LESOTHO':              { lat: -29.6100, lng: 28.2336 },
  'ESWATINI':             { lat: -26.5225, lng: 31.4659 },
  'GAMBIA':               { lat: 13.4432, lng: -15.3101 },
  'CAPE VERDE':           { lat: 16.5388, lng: -23.0418 },
  'GUATEMALA':            { lat: 15.7835, lng: -90.2308 },
  'BELIZE':               { lat: 17.1899, lng: -88.4976 },
  'HONDURAS':             { lat: 15.2000, lng: -86.2419 },
  'EL SALVADOR':          { lat: 13.7942, lng: -88.8965 },
  'NICARAGUA':            { lat: 12.8654, lng: -85.2072 },
  'COSTA RICA':           { lat: 9.7489, lng: -83.7534 },
  'PANAMA':               { lat: 8.5380, lng: -80.7821 },
  'VENEZUELA':            { lat: 6.4238, lng: -66.5897 },
  'GUYANA':               { lat: 4.8604, lng: -58.9302 },
  'SURINAME':             { lat: 3.9193, lng: -56.0278 },
  'FRENCH GUIANA':        { lat: 3.9339, lng: -53.1258 },
  'ECUADOR':              { lat: -1.8312, lng: -78.1834 },
  'BOLIVIA':              { lat: -16.2902, lng: -63.5887 },
  'PARAGUAY':             { lat: -23.4425, lng: -58.4438 },
  'URUGUAY':              { lat: -32.5228, lng: -55.7658 },
  'CUBA':                 { lat: 21.5218, lng: -77.7812 },
  'HAITI':                { lat: 18.9712, lng: -72.2852 },
  'TRINIDAD AND TOBAGO':  { lat: 10.6918, lng: -61.2225 },
  'GRENADA':              { lat: 12.1165, lng: -61.6790 },
  'ST LUCIA':             { lat: 13.9094, lng: -60.9789 },
  'DOMINICA':             { lat: 15.4150, lng: -61.3710 },
  'ST KITTS AND NEVIS':   { lat: 17.3578, lng: -62.7820 },
  'MONTSERRAT':           { lat: 16.7425, lng: -62.1874 },
  'ANGUILLA':             { lat: 18.2206, lng: -63.0686 },
  'PUERTO RICO':          { lat: 18.2208, lng: -66.5901 },
  'ARUBA':                { lat: 12.5211, lng: -69.9683 },
  'CURACAO':              { lat: 12.1696, lng: -68.9900 },
  'MARTINIQUE':           { lat: 14.6415, lng: -61.0242 },
  'GUADELOUPE':           { lat: 16.2660, lng: -61.5504 },
  'REUNION':              { lat: -21.1151, lng: 55.5364 },
  'FIJI':                 { lat: -16.5782, lng: 179.4141 },
  'PAPUA NEW GUINEA':     { lat: -6.3149, lng: 143.9555 },
  'SAMOA':                { lat: -13.7590, lng: -172.1046 },
  'TONGA':                { lat: -21.1790, lng: -175.1982 },
  'MARSHALL ISLANDS':     { lat: 7.1315, lng: 171.1845 },
  'PALAU':                { lat: 7.5150, lng: 134.5825 },
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

// ── Simple dot marker (no animation) ──
function createDotMarker(color) {
  return L.divIcon({
    className: 'simple-dot-marker',
    html: `<div class="dot-marker" style="background:${color}"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -7],
  })
}

// ── Your partner countries ──
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

  // Build markers from bookings (unique countries)
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

  // Fallback: show partner countries if no bookings
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

  // Init map
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

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return

    // Clear old
    markersRef.current.forEach((m) => mapRef.current.removeLayer(m))
    markersRef.current = []

    // Add new
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