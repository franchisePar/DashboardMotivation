export function formatCurrency(amount, compact = false) {
  if (compact && amount >= 1000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(n) {
  return new Intl.NumberFormat('en-US').format(n)
}

export function formatTime(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 1. ADDED: Brand Logo Path Mapping Function
export function brandLogo(brand) {
  const map = {
    UNITED: 'United-Logo.jpg', // Change these paths to your exact image file paths
    MOVIS:  'Movis-Logo.png',
    DRIVO:  'Drivo-Logo.png',
  }
  return map[brand?.toUpperCase()] || '/assets/logos/unknown.png'
}

// 2. UPDATED: Brand Colors set to your precise brand hex specifications
export function brandColor(brand) {
  const map = {
    UNITED: '#0f27a2', // United Corporate Blue
    MOVIS:  '#f94231', // Movis Red-Orange
    DRIVO:  '#c8fa1b', // Drivo Lime Green
  }
  return map[brand?.toUpperCase()] || '#64748b'
}

// 3. UPDATED: Brand Shadows/Glows matching your precise hex color transparency codes
export function brandGlow(brand) {
  const map = {
    UNITED: 'rgba(15,39,162,0.25)',
    MOVIS:  'rgba(249,66,49,0.25)',
    DRIVO:  'rgba(200,250,27,0.25)',
  }
  return map[brand?.toUpperCase()] || 'rgba(100,116,139,0.25)'
}

export function statusColor(status) {
  const s = (status || '').toLowerCase()
  if (s.includes('confirm') || s.includes('active')) return '#22c55e'
  if (s.includes('cancel')) return '#ef4444'
  if (s.includes('pending')) return '#f59e0b'
  if (s.includes('complet')) return '#0ea5e9'
  return '#94a3b8'
}

export function getInitials(name) {
  return (name || '??')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const FLAG_MAP = {
  'United States': '🇺🇸', 'USA': '🇺🇸', 'US': '🇺🇸',
  'Morocco': '🇲🇦', 'France': '🇫🇷', 'Spain': '🇪🇸',
  'Germany': '🇩🇪', 'UK': '🇬🇧', 'United Kingdom': '🇬🇧',
  'Italy': '🇮🇹', 'Netherlands': '🇳🇱', 'Belgium': '🇧🇪',
  'Portugal': '🇵🇹', 'Canada': '🇨🇦', 'Australia': '🇦🇺',
  'Japan': '🇯🇵', 'China': '🇨🇳', 'UAE': '🇦🇪',
  'Saudi Arabia': '🇸🇦', 'Qatar': '🇶🇦', 'Algeria': '🇩🇿',
  'Tunisia': '🇹🇳', 'Egypt': '🇪🇬', 'Senegal': '🇸🇳',
  'South Africa': '🇿🇦', 'Brazil': '🇧🇷', 'Mexico': '🇲🇽',
}

export function countryFlag(country) {
  return FLAG_MAP[country] || '🌍'
}