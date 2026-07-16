import { useEffect, useRef, useMemo, useState, useCallback } from 'react'
import { Deck } from '@deck.gl/core'
import { ScatterplotLayer } from '@deck.gl/layers'
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

const BRAND_COLORS = {
  UNITED: [15, 39, 162],
  MOVIS: [249, 66, 49],
  DRIVO: [163, 197, 32],
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
  const deckContainerRef = useRef(null)
  const mapRef = useRef(null)
  const deckRef = useRef(null)

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

  const getColor = (d) => {
    if (d.isPartner) return [148, 163, 184]
    const brand = getDominantBrand(d.brands)
    return BRAND_COLORS[brand] || BRAND_COLORS.UNITED
  }

  const layers = useMemo(() => {
    return [
      new ScatterplotLayer({
        id: 'reservations',
        data: locationData,
        pickable: true,
        radiusScale: 200,
        radiusMinPixels: 8,
        radiusMaxPixels: 60,
        getPosition: (d) => d.position,
        getFillColor: getColor,
        getRadius: (d) => Math.sqrt(d.count) * 20000,
        getLineColor: [255, 255, 255],
        stroked: true,
        lineWidthMinPixels: 2,
      }),
    ]
  }, [locationData])

  const getTooltip = useCallback(({ object }) => {
    if (!object) return null
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

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center: [10, 35],
      zoom: 2.5,
      pitch: 45,
      bearing: -10,
      attributionControl: false,
      interactive: true,
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Initialize DeckGL after map loads
  useEffect(() => {
    if (!deckContainerRef.current || !mapRef.current || deckRef.current) return

    const map = mapRef.current

    const initDeck = () => {
      if (!mapRef.current || !deckContainerRef.current) return

      const deck = new Deck({
        container: deckContainerRef.current,
        initialViewState: {
          longitude: 10,
          latitude: 35,
          zoom: 2.5,
          pitch: 45,
          bearing: -10,
        },
        controller: true,
        layers: [],
        getTooltip,
        onViewStateChange: ({ viewState }) => {
          const m = mapRef.current
          if (!m) return
          m.jumpTo({
            center: [viewState.longitude, viewState.latitude],
            zoom: viewState.zoom,
            bearing: viewState.bearing,
            pitch: viewState.pitch,
          })
        },
      })

      deckRef.current = deck
    }

    if (map.loaded()) {
      initDeck()
    } else {
      map.once('load', initDeck)
    }

    return () => {
      const d = deckRef.current
      if (d) {
        d.finalize()
        deckRef.current = null
      }
    }
  }, [getTooltip])

  // Sync MapLibre to DeckGL
  useEffect(() => {
    if (!mapRef.current || !deckRef.current) return

    const map = mapRef.current
    const deck = deckRef.current

    const handleMove = () => {
      const center = map.getCenter()
      const zoom = map.getZoom()
      const bearing = map.getBearing()
      const pitch = map.getPitch()

      deck.setProps({
        viewState: {
          longitude: center.lng,
          latitude: center.lat,
          zoom,
          bearing,
          pitch,
          transitionDuration: 0,
        },
      })
    }

    map.on('move', handleMove)

    return () => {
      map.off('move', handleMove)
    }
  }, [])

  // Update layers
  useEffect(() => {
    if (deckRef.current) {
      deckRef.current.setProps({ layers })
    }
  }, [layers])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: '14px', overflow: 'hidden' }}>
      {/* MapLibre container */}
      <div
        ref={mapContainerRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      />

      {/* DeckGL overlay */}
      <div
        ref={deckContainerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}