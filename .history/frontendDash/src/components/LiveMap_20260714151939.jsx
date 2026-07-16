import { useEffect, useRef, useMemo, useCallback, useState } from 'react'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { ScatterplotLayer, ArcLayer, TextLayer } from '@deck.gl/layers'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// ═══════════════════════════════════════════════════════════
// FREE LIGHT STYLES
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

const BRAND_COLORS = {
  UNITED: { fill: [74, 123, 255], stroke: [15, 39, 162], arc: [74, 123, 255, 200] },
  MOVIS:  { fill: [255, 123, 107], stroke: [249, 66, 49], arc: [255, 123, 107, 200] },
  DRIVO:  { fill: [212, 240, 96], stroke: [163, 197, 32], arc: [212, 240, 96, 200] },
}

const PARTNER_COUNTRIES = [
  'ALBANIA', 'ANTIGUA AND BARBUDA', 'AZORES', 'BOSNIA', 'BULGARIA',
  'CORFU', 'CROATIA', 'CYPRES', 'DOMINICAN', 'FLORIDA', 'GERMANY',
  'GREECE', 'ITALY', 'JAMAICA', 'MALTA', 'MAURITIUS', 'MIAMI',
  'MONTENEGRO', 'MOROCCO', 'POLAND', 'PORTUGAL', 'SERBIA',
  'SINT MAARTEN', 'TURCS AND CAICOS', 'TURKEY',
]

const HUB = [10, 35] // Central hub location

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
  const [hasError, setHasError] = useState(false)

  // Aggregate bookings by country
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

  // Build deck.gl layers
  const layers = useMemo(() => {
    const arcData = locationData.map((d) => {
      const brand = d.isPartner ? 'UNITED' : getDominantBrand(d.brands)
      return {
        source: d.position,
        target: HUB,
        brand,
        count: d.count,
        country: d.country,
      }
    })

    const dotColors = locationData.map((d) => {
      if (d.isPartner) return { fill: [180, 180, 180], stroke: [120, 120, 120] }
      const brand = getDominantBrand(d.brands)
      return BRAND_COLORS[brand] || BRAND_COLORS.UNITED
    })

    return [
      // ArcLayer: flowing lines to hub
      new ArcLayer({
        id: 'arcs',
        data: arcData,
        pickable: true,
        getSourcePosition: (d) => d.source,
        getTargetPosition: (d) => d.target,
        getSourceColor: (d) => BRAND_COLORS[d.brand]?.arc || [150, 150, 150, 150],
        getTargetColor: (d) => BRAND_COLORS[d.brand]?.arc || [150, 150, 150, 50],
        getWidth: (d) => Math.max(1, Math.min(d.count * 0.5, 3)),
        getHeight: 0.4,
        getTilt: 60,
        greatCircle: true,
        opacity: 0.8,
        // Animation effect
        getSourceTimestamp: () => 0,
        getTargetTimestamp: () => 1,
        animation: {
          speed: 0.02,
        },
      }),

      // ScatterplotLayer: glowing dots
      new ScatterplotLayer({
        id: 'dots',
        data: locationData,
        pickable: true,
        radiusScale: 150,
        radiusMinPixels: 5,
        radiusMaxPixels: 30,
        getPosition: (d) => d.position,
        getFillColor: (d, { index }) => dotColors[index].fill,
        getRadius: (d) => Math.sqrt(d.count) * 15000,
        getLineColor: (d, { index }) => dotColors[index].stroke,
        stroked: true,
        lineWidthMinPixels: 2,
        lineWidthMaxPixels: 4,
        opacity: 0.9,
        // Glow effect
        parameters: {
          depthTest: false,
        },
      }),

      // TextLayer: country labels
      new TextLayer({
        id: 'labels',
        data: locationData.filter(d => d.count >= 3),
        pickable: false,
        getPosition: (d) => d.position,
        getText: (d) => d.country,
        getSize: 12,
        getColor: [80, 80, 80],
        getAngle: 0,
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',
        billboard: true,
        fontFamily: 'system-ui, sans-serif',
        fontWeight: 600,
      }),
    ]
  }, [locationData])

  const getTooltip = useCallback(({ object, layer }) => {
    if (!object) return null
    if (layer?.id === 'arcs') {
      return {
        html: `
          <div style="padding:10px 14px;font-family:system-ui,sans-serif;background:#fff;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
            <div style="font-weight:700;font-size:13px;color:#1e293b;">${object.country} → Hub</div>
            <div style="font-size:11px;color:#64748b;">${object.count} reservations · ${object.brand}</div>
          </div>
        `,
      }
    }
    const brandEntries = Object.entries(object.brands).map(([b, c]) => `${b}: ${c}`).join(' | ')
    return {
      html: `
        <div style="padding:10px 14px;font-family:system-ui,sans-serif;background:#fff;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
          <div style="font-weight:700;font-size:14px;margin-bottom:4px;color:#1e293b;">${object.country}</div>
          <div style="font-size:12px;color:#475569;">${object.count} reservations</div>
          <div style="font-size:11px;color:#64748b;margin-top:4px;">${brandEntries}</div>
        </div>
      `,
    }
  }, [])

  // Initialize MapLibre + deck.gl overlay
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: MAP_STYLE,
        center: [10, 25],
        zoom: 1.4,
        pitch: 45,        // 3D tilt
        bearing: 0,
        attributionControl: false,
        projection: 'globe', // 3D globe projection
        antialias: true,
      })

      mapRef.current = map

      // Add deck.gl overlay when map loads
      map.once('load', () => {
        try {
          const overlay = new MapboxOverlay({
            interleaved: true,
            layers: [],
            getTooltip,
          })
          map.addControl(overlay)
          overlayRef.current = overlay
          
          // Set initial layers
          overlay.setProps({ layers })
        } catch (overlayErr) {
          console.error('Deck overlay failed:', overlayErr)
          setHasError(true)
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
      
      const timeout = setTimeout(() => {
        rotationRef.current = requestAnimationFrame(rotate)
      }, 4000)

      // Pause on interaction
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
        }, 6000)
      }
      map.on('mouseup', handleMouseUp)

      return () => {
        clearTimeout(timeout)
        clearTimeout(resumeTimeout)
        if (rotationRef.current) cancelAnimationFrame(rotationRef.current)
        map.off('mousedown', handleMouseDown)
        map.off('mouseup', handleMouseUp)
        if (overlayRef.current) {
          map.removeControl(overlayRef.current)
          overlayRef.current = null
        }
        map.remove()
        mapRef.current = null
      }
    } catch (err) {
      console.error('Map init failed:', err)
      setHasError(true)
    }
  }, [getTooltip, layers])

  // Update layers when data changes
  useEffect(() => {
    if (overlayRef.current && !hasError) {
      try {
        overlayRef.current.setProps({ layers })
      } catch (err) {
        console.warn('Layer update failed:', err)
      }
    }
  }, [layers, hasError])

  // Fallback: simple MapLibre markers if deck.gl fails
  const [fallbackMarkers, setFallbackMarkers] = useState([])

  useEffect(() => {
    if (!hasError || !mapRef.current) return

    // Clear old fallback markers
    fallbackMarkers.forEach(m => m.remove())
    
    const newMarkers = locationData.map((d) => {
      const brand = d.isPartner ? 'UNITED' : getDominantBrand(d.brands)
      const colors = BRAND_COLORS[brand] || BRAND_COLORS.UNITED
      
      const el = document.createElement('div')
      el.style.cssText = `
        width: 16px; height: 16px; border-radius: 50%;
        background: rgb(${colors.fill.join(',')});
        border: 2px solid rgb(${colors.stroke.join(',')});
        box-shadow: 0 0 8px rgba(${colors.fill.join(',')}, 0.5);
        cursor: pointer;
      `
      
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(d.position)
        .addTo(mapRef.current)
      
      return marker
    })
    
    setFallbackMarkers(newMarkers)
    
    return () => {
      newMarkers.forEach(m => m.remove())
    }
  }, [hasError, locationData])

  if (hasError) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '14px', overflow: 'hidden' }}>
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
        <div style={{
          position: 'absolute', bottom: 10, left: 10,
          background: 'rgba(255,255,255,0.9)', padding: '4px 8px',
          borderRadius: '4px', fontSize: '11px', color: '#666',
        }}>
          3D effects disabled (GPU compatibility)
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '14px', overflow: 'hidden' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}