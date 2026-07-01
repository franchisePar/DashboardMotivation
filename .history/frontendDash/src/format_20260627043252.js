
// ── Currency & Numbers ────────────────────────────────────
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

// ── Brand Logo Path ───────────────────────────────────────
export function brandLogo(brand) {
  const map = {
    UNITED: '../public/assets/logos/United-Logo.jpg',
    MOVIS: '../public/assets/logos/Movis-Logo.png',
    DRIVO: '../public/assets/logos/Drivo-Logo.png',
  }
  return map[brand?.toUpperCase()] || '/assets/logos/unknown.png'
}

// ── Brand Colors ──────────────────────────────────────────
export function brandColor(brand) {
  const map = {
    UNITED: '#0f27a2',
    MOVIS: '#f94231',
    DRIVO: '#c8fa1b',
  }
  return map[brand?.toUpperCase()] || '#64748b'
}

export function brandGlow(brand) {
  const map = {
    UNITED: 'rgba(15,39,162,0.25)',
    MOVIS: 'rgba(249,66,49,0.25)',
    DRIVO: 'rgba(200,250,27,0.25)',
  }
  return map[brand?.toUpperCase()] || 'rgba(100,116,139,0.25)'
}

// ── Status Colors ─────────────────────────────────────────
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

// ── Country Flag (DYNAMIC with flagcdn.com) ───────────────
const COUNTRY_CODE_MAP = {
  'ALBANIA': 'al',
  'ALGERIA': 'dz',
  'ARGENTINA': 'ar',
  'AUSTRALIA': 'au',
  'AUSTRIA': 'at',
  'BELGIUM': 'be',
  'BRAZIL': 'br',
  'BULGARIA': 'bg',
  'CANADA': 'ca',
  'CHINA': 'cn',
  'CROATIA': 'hr',
  'CZECH REPUBLIC': 'cz',
  'DENMARK': 'dk',
  'EGYPT': 'eg',
  'ESTONIA': 'ee',
  'FINLAND': 'fi',
  'FRANCE': 'fr',
  'GERMANY': 'de',
  'GREECE': 'gr',
  'HUNGARY': 'hu',
  'HOUSTON': 'us',
  'ICELAND': 'is',
  'INDIA': 'in',
  'INDONESIA': 'id',
  'IRELAND': 'ie',
  'ISRAEL': 'il',
  'ITALY': 'it',
  'JAPAN': 'jp',
  'KENYA': 'ke',
  'KUWAIT': 'kw',
  'LATVIA': 'lv',
  'LITHUANIA': 'lt',
  'LUXEMBOURG': 'lu',
  'MALAYSIA': 'my',
  'MALTA': 'mt',
  'MEXICO': 'mx',
  'MOROCCO': 'ma',
  'MAROC': 'ma',
  'NETHERLANDS': 'nl',
  'NEW ZEALAND': 'nz',
  'NIGERIA': 'ng',
  'NORWAY': 'no',
  'OMAN': 'om',
  'PAKISTAN': 'pk',
  'POLAND': 'pl',
  'PORTUGAL': 'pt',
  'QATAR': 'qa',
  'ROMANIA': 'ro',
  'RUSSIA': 'ru',
  'SAUDI ARABIA': 'sa',
  'SENEGAL': 'sn',
  'SERBIA': 'rs',
  'SINGAPORE': 'sg',
  'SLOVAKIA': 'sk',
  'SLOVENIA': 'si',
  'SOUTH AFRICA': 'za',
  'SOUTH KOREA': 'kr',
  'SPAIN': 'es',
  'SWEDEN': 'se',
  'SWITZERLAND': 'ch',
  'THAILAND': 'th',
  'TUNISIA': 'tn',
  'TUNISIE': 'tn',
  'TURKEY': 'tr',
  'UAE': 'ae',
  'UK': 'gb',
  'USA': 'us',
  'VIETNAM': 'vn',
}

export function countryFlag(country) {
  if (!country) return '🌍'
  
  const code = country.toUpperCase().trim()
  const cc = COUNTRY_CODE_MAP[code]
  
  if (!cc) {
    return code.slice(0, 2)
  }
  
  return cc
}

// Fonction pour obtenir l'URL du drapeau
export function countryFlagUrl(country) {
  const cc = countryFlag(country)
  if (cc.length === 2) {
    return `https://flagcdn.com/w40/${cc}.png`
  }
  return null
}