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

export function brandColor(brand) {
  const map = {
    UNITED: '#3b82f6',
    MOVIS:  '#8b5cf6',
    DRIVO:  '#10b981',
  }
  return map[brand?.toUpperCase()] || '#64748b'
}

export function brandGlow(brand) {
  const map = {
    UNITED: 'rgba(59,130,246,0.25)',
    MOVIS:  'rgba(139,92,246,0.25)',
    DRIVO:  'rgba(16,185,129,0.25)',
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
