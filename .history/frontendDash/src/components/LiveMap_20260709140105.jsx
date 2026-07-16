import { useEffect, useRef, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon issue in webpack/vite
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

// ── Custom animated pulse marker ──
function createPulseMarker(color) {
  return L.divIcon({
    className: 'custom-pulse-marker',
    html: `
      <div class="pulse-ring" style="--marker-color: ${color}"></div>
      <div class="pulse-core" style="--marker-color: ${color}"></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  })
}

// ── Locations data (lat, lng, label, color) ──
const LOCATIONS = [
  { lat: 40.7128, lng: -74.0060, label: 'New York', color: '#3b82f6', brand: 'UNITED' },
  { lat: 34.0522, lng: -118.2437, label: 'Los Angeles', color: '#3b82f6', brand: 'UNITED' },
  { lat: 51.5074, lng: -0.1278, label: 'London', color: '#f59e0b', brand: 'MOVIS' },
  { lat: 48.8566, lng: 2.3522, label: 'Paris', color: '#f59e0b', brand: 'MOVIS' },
  { lat: 52.5200, lng: 13.4050, label: 'Berlin', color: '#f59e0b', brand: 'MOVIS' },
  { lat: 31.6295, lng: -7.9811, label: 'Marrakech', color: '#22c55e', brand: 'DRIVO' },
  { lat: 36.7538, lng: 3.0588, label: 'Algiers', color: '#22c55e', brand: 'DRIVO' },
  { lat: 30.0444, lng: 31.2357, label: 'Cairo', color: '#22c55e', brand: 'DRIVO' },
  { lat: 25.2048, lng: 55.2708, label: 'Dubai', color: '#ef4444', brand: 'UNITED' },
  { lat: 28.6139, lng: 77.2090, label: 'New Delhi', color: '#ef4444', brand: 'UNITED' },
  { lat: 39.9042, lng: 116.4074, label: 'Beijing', color: '#ef4444', brand: 'UNITED' },
  { lat: -33.8688, lng: 151.2093, label: 'Sydney', color: '#8b5cf6', brand: 'MOVIS' },
  { lat: -23.5505, lng: -46.6333, label: 'São Paulo', color: '#f59e0b', brand: 'MOVIS' },
  { lat: 4.7110, lng: -74.0721, label: 'Bogotá', color: '#f59e0b', brand: 'MOVIS' },
]

// ── Map style component ──
function MapStyle() {
  const map = useMap()
  useEffect(() => {
    // Remove attribution control for cleaner look
    map.attributionControl.remove()
  }, [map])
  return null
}

export function LiveMap() {
  return (
    <>
      <MapContainer
        center={[25, 10]}
        zoom={2}
        minZoom={2}
        maxZoom={5}
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%', borderRadius: '14px' }}
        zoomControl={false}
      >
        <TileLayer
          attribution=''
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapStyle />
        
        {LOCATIONS.map((loc, i) => (
          <Marker
            key={i}
            position={[loc.lat, loc.lng]}
            icon={createPulseMarker(loc.color)}
          >
            <Popup>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>
                {loc.label}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {loc.brand}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* CSS for animated markers */}
      <style>{`
        .custom-pulse-marker {
          background: transparent !important;
          border: none !important;
        }
        .pulse-core {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 10px;
          height: 10px;
          background: var(--marker-color);
          border-radius: 50%;
          box-shadow: 0 0 8px var(--marker-color), 0 0 16px var(--marker-color);
          z-index: 2;
        }
        .pulse-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 10px;
          height: 10px;
          border: 2px solid var(--marker-color);
          border-radius: 50%;
          animation: map-pulse-ring 2s ease-out infinite;
          z-index: 1;
        }
        @keyframes map-pulse-ring {
          0% { width: 10px; height: 10px; opacity: 1; }
          100% { width: 40px; height: 40px; opacity: 0; }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 10px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important;
          border: 1px solid #e2e8f0 !important;
        }
        .leaflet-popup-tip {
          background: white !important;
          box-shadow: none !important;
        }
      `}</style>
    </>
  )
}