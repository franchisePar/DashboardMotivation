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
    UNITED: '/public/assets/logos/United_Logo_BG.png',
    MOVIS: '/public/assets/logos/Movis_Logo_BG.png',
    DRIVO: '/public/assets/logos/Drivo_Logo_BG.png',
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
  'ANTIGUA AND BARBUDA': 'ag',
  'ALBANIA': 'al',
  'ALGERIA': 'dz',
  'ARGENTINA': 'ar',
  'AUSTRALIA': 'au',
  'AUSTRIA': 'at',
  'AZORES': 'pt',
  'BELGIUM': 'be',
  'BRAZIL': 'br',
  'BULGARIA': 'bg',
  'CANADA': 'ca',
  'CHINA': 'cn',
  'CROATIA': 'hr',
  'CZECH REPUBLIC': 'cz',
  'DENMARK': 'dk',
  'DOMINICAN REPUBLIC': 'do',
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

// City to country mapping for flag detection
const CITY_TO_COUNTRY = {
  'HOUSTON': 'USA',
  'NEW YORK': 'USA',
  'LOS ANGELES': 'USA',
  'MIAMI': 'USA',
  'CHICAGO': 'USA',
  'DALLAS': 'USA',
  'PARIS': 'FRANCE',
  'LONDON': 'UK',
  'BARCELONA': 'SPAIN',
  'MADRID': 'SPAIN',
  'ROME': 'ITALY',
  'MILAN': 'ITALY',
  'BERLIN': 'GERMANY',
  'MUNICH': 'GERMANY',
  'AMSTERDAM': 'NETHERLANDS',
  'BRUSSELS': 'BELGIUM',
  'DUBAI': 'UAE',
  'DOHA': 'QATAR',
  'RIYADH': 'SAUDI ARABIA',
  'JEDDAH': 'SAUDI ARABIA',
  'CAIRO': 'EGYPT',
  'TUNIS': 'TUNISIA',
  'CASABLANCA': 'MOROCCO',
  'MARRAKECH': 'MOROCCO',
  'RABAT': 'MOROCCO',
  'ALGIERS': 'ALGERIA',
  'ISTANBUL': 'TURKEY',
  'ANKARA': 'TURKEY',
  'ATHENS': 'GREECE',
  'LISBON': 'PORTUGAL',
  'AZORES': 'PORTUGAL',
  'VIENNA': 'AUSTRIA',
  'ZURICH': 'SWITZERLAND',
  'GENEVA': 'SWITZERLAND',
  'STOCKHOLM': 'SWEDEN',
  'OSLO': 'NORWAY',
  'COPENHAGEN': 'DENMARK',
  'HELSINKI': 'FINLAND',
  'PRAGUE': 'CZECH REPUBLIC',
  'WARSAW': 'POLAND',
  'BUDAPEST': 'HUNGARY',
  'BUCHAREST': 'ROMANIA',
  'SOFIA': 'BULGARIA',
  'BELGRADE': 'SERBIA',
  'ZAGREB': 'CROATIA',
  'LJUBLJANA': 'SLOVENIA',
  'BRATISLAVA': 'SLOVAKIA',
  'TALLINN': 'ESTONIA',
  'RIGA': 'LATVIA',
  'VILNIUS': 'LITHUANIA',
  'LUXEMBOURG': 'LUXEMBOURG',
  'VALLETTA': 'MALTA',
  'DUBLIN': 'IRELAND',
  'REYKJAVIK': 'ICELAND',
  'TOKYO': 'JAPAN',
  'SEOUL': 'SOUTH KOREA',
  'SINGAPORE': 'SINGAPORE',
  'KUALA LUMPUR': 'MALAYSIA',
  'JAKARTA': 'INDONESIA',
  'BANGKOK': 'THAILAND',
  'HANOI': 'VIETNAM',
  'MUMBAI': 'INDIA',
  'DELHI': 'INDIA',
  'KARACHI': 'PAKISTAN',
  'LAGOS': 'NIGERIA',
  'NAIROBI': 'KENYA',
  'DAKAR': 'SENEGAL',
  'MOSCOW': 'RUSSIA',
  'SYDNEY': 'AUSTRALIA',
  'AUCKLAND': 'NEW ZEALAND',
  'TORONTO': 'CANADA',
  'VANCOUVER': 'CANADA',
  'MONTREAL': 'CANADA',
  'MEXICO CITY': 'MEXICO',
  'SAO PAULO': 'BRAZIL',
  'RIO DE JANEIRO': 'BRAZIL',
  'BUENOS AIRES': 'ARGENTINA',
  'SANTIAGO': 'CHILE',
  'BOGOTA': 'COLOMBIA',
  'LIMA': 'PERU',
  'CARACAS': 'VENEZUELA',
  'QUITO': 'ECUADOR',
  'LA PAZ': 'BOLIVIA',
  'ASUNCION': 'PARAGUAY',
  'MONTEVIDEO': 'URUGUAY',
  'SANTO DOMINGO': 'DOMINICAN REPUBLIC',
}

export function countryFlag(country) {
  if (!country) return '🌍'
  
  const code = country.toUpperCase().trim()
  
  // Direct country match
  if (COUNTRY_CODE_MAP[code]) {
    return COUNTRY_CODE_MAP[code]
  }
  
  // City match - convert to country first
  if (CITY_TO_COUNTRY[code]) {
    const countryName = CITY_TO_COUNTRY[code]
    return COUNTRY_CODE_MAP[countryName] || code.slice(0, 2)
  }
  
  // Fallback: return first 2 letters
  return code.slice(0, 2)
}

// Fonction pour obtenir l'URL du drapeau
export function countryFlagUrl(country) {
  const cc = countryFlag(country)
  if (cc.length === 2) {
    return `https://flagcdn.com/w40/${cc}.png`
  }
  return null
}

// Helper to resolve city to country name for display
export function resolveCountry(location) {
  if (!location) return null
  const upper = location.toUpperCase().trim()
  return CITY_TO_COUNTRY[upper] || upper
}