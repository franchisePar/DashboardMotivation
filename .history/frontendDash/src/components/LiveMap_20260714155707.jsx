import { useEffect, useRef, useMemo, useCallback, useState } from 'react'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { ScatterplotLayer, ArcLayer } from '@deck.gl/layers'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

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

// Brand colors — EXACT from your screenshot
const BRAND_COLORS = {
  UNITED: { fill: [15, 39, 162], stroke: [15, 39, 162], arc: [15, 39, 162, 180] },   // Deep blue
  MOVIS:  { fill: [249, 66, 49], stroke: [249, 66, 49], arc: [249, 66, 49, 180] },   // Red
  DRIVO:  { fill: [163, 197, 32], stroke: [163, 197, 32], arc: [163, 197, 32, 180] }, // Green
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
  const rotationRef = useRef(null)

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

  const layers = useMemo(() => {
    const HUB = [10, 35]

    const arcData = locationData.map((d) => {
      const brand = d.isPartner ? 'UNITED' : getDominantBrand(d.brands)
      return { source: d.position, target: HUB, brand, count: d.count, country: d.country }
    })

    return [
      // Arcs: thin, subtle, brand-colored
      new ArcLayer({
        id: 'arcs',
        data: arcData,
        pickable: true,
        getSourcePosition: (d) => d.source,
        getTargetPosition: (d) => d.target,
        getSourceColor: (d) => BRAND_COLORS[d.brand]?.arc || [150, 150, 150, 100],
        getTargetColor: (d) => BRAND_COLORS[d.brand]?.arc || [150, 150, 150, 30],
        getWidth: 1.5,
        getHeight: 0.3,
        greatCircle: true,
        opacity: 0.5,
      }),

      // Dots: SMALL, brand-colored, subtle stroke
      new ScatterplotLayer({
        id: 'dots',
        data: locationData,
        pickable: true,
        radiusScale: 30,           // SMALLER
        radiusMinPixels: 3,        // Minimum 6px
        radiusMaxPixels: 9,       // Maximum 18px (was way too big)
        getPosition: (d) => d.position,
        getFillColor: (d) => {
          if (d.isPartner) return [180, 180, 180, 200]
          const brand = getDominantBrand(d.brands)
          const c = BRAND_COLORS[brand]?.fill || [15, 39, 162]
          return [...c, 220] // Add alpha
        },
        getRadius: (d) => Math.sqrt(d.count) * 8000, // Smaller radius multiplier
        getLineColor: [255, 255, 255, 180],
        stroked: true,
        lineWidthMinPixels: 1,
        lineWidthMaxPixels: 2,
        opacity: 0.85,
      }),
    ]
  }, [locationData])

  const getTooltip = useCallback(({ object, layer }) => {
    if (!object) return null
    if (layer?.id === 'arcs') {
      return {
        html: `<div style="padding:8px 12px;font-family:system-ui,sans-serif;font-size:12px;"><b>${object.country}</b> → Hub<br/><span style="color:#666;">${object.count} reservations · ${object.brand}</span></div>`,
      }
    }
    const brandEntries = Object.entries(object.brands).map(([b, c]) => `${b}: ${c}`).join(' | ')
    return {
      html: `<div style="padding:8px 12px;font-family:system-ui,sans-serif;font-size:12px;"><b>${object.country}</b><br/>${object.count} reservations<br/><span style="color:#888;font-size:11px;">${brandEntries}</span></div>`,
    }
  }, [])

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center: [10, 25],
      zoom: 1.4,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
      projection: 'globe',
      antialias: true,
    })

    mapRef.current = map

    map.once('load', () => {
      try {
        const overlay = new MapboxOverlay({ interleaved: true, layers: [], getTooltip })
        map.addControl(overlay)
        overlayRef.current = overlay
        overlay.setProps({ layers })
      } catch (err) {
        console.warn('Deck overlay failed, using fallback:', err)
      }
    })

    // Auto-rotation
    let bearing = 0
    const rotate = () => {
      if (!mapRef.current) return
      bearing = (bearing + 0.05) % 360
      mapRef.current.setBearing(bearing)
      rotationRef.current = requestAnimationFrame(rotate)
    }
    const timeout = setTimeout(() => { rotationRef.current = requestAnimationFrame(rotate) }, 4000)

    const handleMouseDown = () => { if (rotationRef.current) { cancelAnimationFrame(rotationRef.current); rotationRef.current = null } }
    const handleMouseUp = () => { setTimeout(() => { if (!rotationRef.current && mapRef.current) rotationRef.current = requestAnimationFrame(rotate) }, 5000) }
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
      try { overlayRef.current.setProps({ layers }) } catch (e) { console.warn(e) }
    }
  }, [layers])

  return <div ref={mapContainerRef} style={{ width: '100%', height: '100%', borderRadius: '14px' }} />
}