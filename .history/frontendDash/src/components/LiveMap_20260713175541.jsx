import { useMemo, useState, useCallback } from 'react'
import DeckGL from '@deck.gl/react'
import { ColumnLayer, ScatterplotLayer } from '@deck.gl/layers'
import { HeatmapLayer } from '@deck.gl/aggregation-layers'
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
  const [viewState, setViewState] = useState({
    longitude: 10,
    latitude: 35,
    zoom: 2.5,
    pitch: 45,
    bearing: -10,
  })
  const [layerMode, setLayerMode] = useState('columns') // 'columns' | 'scatter' | 'heatmap'

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

    // If no bookings, show partner countries as dim markers
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
    if (d.isPartner) return [148, 163, 184] // slate-400 for partner markers
    const brand = getDominantBrand(d.brands)
    return BRAND_COLORS[brand] || BRAND_COLORS.UNITED
  }

  const layers = useMemo(() => {
    const commonProps = {
      id: 'reservations',
      data: locationData,
      pickable: true,
    }

    if (layerMode === 'columns') {
      return [
        new ColumnLayer({
          ...commonProps,
          diskResolution: 12,
          radius: 25000,
          extruded: true,
          elevationScale: 800,
          getPosition: (d) => d.position,
          getFillColor: getColor,
          getElevation: (d) => d.count,
          getLineColor: [255, 255, 255],
          lineWidthMinPixels: 1,
          material: {
            ambient: 0.6,
            diffuse: 0.8,
            shininess: 32,
            specularColor: [255, 255, 255],
          },
          transitions: {
            getElevation: 600,
            getFillColor: 600,
          },
        }),
      ]
    }

    if (layerMode === 'scatter') {
      return [
        new ScatterplotLayer({
          ...commonProps,
          radiusScale: 200,
          radiusMinPixels: 6,
          radiusMaxPixels: 60,
          getPosition: (d) => d.position,
          getFillColor: getColor,
          getRadius: (d) => Math.sqrt(d.count) * 15000,
          getLineColor: [255, 255, 255],
          stroked: true,
          lineWidthMinPixels: 2,
        }),
      ]
    }

    if (layerMode === 'heatmap') {
      return [
        new HeatmapLayer({
          ...commonProps,
          getPosition: (d) => d.position,
          getWeight: (d) => d.count,
          radiusPixels: 60,
          intensity: 1.5,
          threshold: 0.05,
          colorRange: [
            [255, 255, 178],
            [254, 204, 92],
            [253, 141, 60],
            [240, 59, 32],
            [189, 0, 38],
          ],
        }),
      ]
    }

    return []
  }, [locationData, layerMode])

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

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Layer toggle */}
      <div style={{
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 10,
        display: 'flex',
        gap: '4px',
        background: 'rgba(255,255,255,0.95)',
        padding: '4px',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        backdropFilter: 'blur(8px)',
      }}>
        {[
          { key: 'columns', label: '3D' },
          { key: 'scatter', label: 'Dots' },
          { key: 'heatmap', label: 'Heat' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setLayerMode(key)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              background: layerMode === key ? '#0f27a2' : 'transparent',
              color: layerMode === key ? '#fff' : '#475569',
              transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState }) => setViewState(viewState)}
        controller={{ dragPan: true, scrollZoom: true, dragRotate: true, doubleClickZoom: true }}
        layers={layers}
        getTooltip={getTooltip}
        style={{ width: '100%', height: '100%' }}
      >
        <maplibregl.Map
          mapLib={maplibregl}
          mapStyle={MAP_STYLE}
          style={{ width: '100%', height: '100%' }}
          attributionControl={false}
        />
      </DeckGL>
    </div>
  )
}