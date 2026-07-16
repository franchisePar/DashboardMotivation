import { useEffect, useRef, useMemo, useCallback } from 'react'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { ScatterplotLayer, ArcLayer } from '@deck.gl/layers'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// ═══════════════════════════════════════════════════════════
// GREY BASEMAP — CARTO Positron No Labels (clean, minimal)
// ═══════════════════════════════════════════════════════════
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

// Brand colors: fill (soft) + stroke (vibrant)
const BRAND_COLORS = {
  UNITED: { fill: [200, 210, 245], stroke: [15, 39, 162] },      // Blue
  MOVIS:  { fill: [255, 200, 195], stroke: [249, 66, 49] },      // Red
  DRIVO:  { fill: [230, 245, 180], stroke: [163, 197, 32] },     // Green
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

export function LiveMap({ bookings = [] }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const overlayRef = useRef(null)

  // Aggregate bookings by country with brand breakdown
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

    // Fallback: show partner countries
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

  // Get dominant brand for a location
  const getDominantBrand = (brands) => {
    return Object.entries(brands).sort((a, b) => b[1] - a[1])[0]?.[0] || 'UNITED'
  }

  // Get brand colors
  const getBrandColors = (d) => {
    if (d.isPartner) {
      return { fill: [200, 200, 200], stroke: [150, 150, 150] }
    }
    const brand = getDominantBrand(d.brands)
    return BRAND_COLORS[brand] || BRAND_COLORS.UNITED
  }

  // Build layers: Arcs + Dots
  const layers = useMemo(() => {
    const HUB = [10, 35] // Central hub (Mediterranean area)

    // Arc data: one arc per location pointing to hub
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

    const colors = locationData.map(getBrandColors)

    return [
      // ArcLayer: curved lines from each country to hub, colored by brand
      new ArcLayer({
        id: 'arcs',
        data: arcData,
        pickable: true,
        getSourcePosition: (d) => d.source,
        getTargetPosition: (d) => d.target,
        getSourceColor: (d) => BRAND_COLORS[d.brand]?.stroke || [150, 150, 150],
        getTargetColor: (d) => BRAND_COLORS[d.brand]?.stroke || [150, 150, 150],
        getWidth: (d) => Math.max(1, Math.min(d.count * 0.8, 4)),
        getHeight: 0.3,
        greatCircle: true,
        opacity: 0.6,
      }),

      // ScatterplotLayer: dots at each country
      new ScatterplotLayer({
        id: 'dots',
        data: locationData,
        pickable: true,
        radiusScale: 150,
        radiusMinPixels: 6,
        radiusMaxPixels: 40,
        getPosition: (d) => d.position,
        getFillColor: (d, { index }) => colors[index].fill,
        getRadius: (d) => Math.sqrt(d.count) * 15000,
        getLineColor: (d, { index }) => colors[index].stroke,
        stroked: true,
        lineWidthMinPixels: 2,
        lineWidthMaxPixels: 4,
        opacity: 0.9,
      }),
    ]
  }, [locationData])

  const getTooltip = useCallback(({ object, layer }) => {
    if (!object) return null

    if (layer?.id === 'arcs') {
      return {
        html: `
          <div style="padding:10px 14px;font-family:system-ui,sans-serif;">
            <div style="font-weight:700;font-size:13px;color:#0f172a;">
              ${object.country} → Hub
            </div>
            <div style="font-size:11px;color:#64748b;">
              ${object.count} reservations · ${object.brand}
            </div>
          </div>
        `,
      }
    }

    const brandEntries = Object.entries(object.brands)
      .map(([b, c]) => `${b}: ${c}`)
      .join(' | ')
    return {
      html: `
        <div style="padding:10px 14px;font-family:system-ui,sans-serif;min-width:140px;">
          <div style="font-weight:700;font-size:14px;margin-bottom:4px;color:#0f172a;">
            ${object.country}
          </div>
          <div style="font-size:12px;color:#475569;margin-bottom:4px;">
            ${object.count} reservation${object.count > 1 ? 's' : ''}
          </div>
          ${object.isPartner ? '<div style="font-size:11px;color:#94a3b8;">Partner location</div>' : `<div style="font-size:11px;color:#64748b;">${brandEntries}</div>`}
        </div>
      `,
    }
  }, [])

  // Initialize map + deck overlay
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center: [10, 25],        // Zoomed out center
      zoom: 1.8,               // Zoomed out
      pitch: 0,                // Flat view for cleaner look
      bearing: 0,
      attributionControl: false,
    })

    mapRef.current = map

    map.once('load', () => {
      const overlay = new MapboxOverlay({
        interleaved: true,
        layers: [],
        getTooltip,
      })
      map.addControl(overlay)
      overlayRef.current = overlay
    })

    return () => {
      if (overlayRef.current) {
        map.removeControl(overlayRef.current)
        overlayRef.current = null
      }
      map.remove()
      mapRef.current = null
    }
  }, [getTooltip])

  // Update layers
  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.setProps({ layers })
    }
  }, [layers])

  return (
    <div
      ref={mapContainerRef}
      style={{ width: '100%', height: '100%', borderRadius: '14px' }}
    />
  )
}