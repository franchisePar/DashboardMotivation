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
    UNITED: '/assets/logos/United-Logo.jpg',
    MOVIS: '/assets/logos/Movis-Logo.png',
    DRIVO: '/assets/logos/Drivo-Logo.png',
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
// Map: country name → ISO 2-letter code
const COUNTRY_CODE_MAP = {
  // A
  'ALBANIA': 'al',
  'ALGERIA': 'dz', 'ALGÉRIE': 'dz',
  'ARGENTINA': 'ar',
  'AUSTRALIA': 'au',
  'AUSTRIA': 'at',
  // B
  'BELGIUM': 'be', 'BELGIQUE': 'be',
  'BRAZIL': 'br', 'BRÉSIL': 'br',
  'BULGARIA': 'bg',
  // C
  'CANADA': 'ca',
  'CHINA': 'cn', 'CHINE': 'cn',
  'CROATIA': 'hr',
  'CZECH REPUBLIC': 'cz',
  // D
  'DENMARK': 'dk',
  // E
  'EGYPT': 'eg', 'ÉGYPTE': 'eg',
  'ESTONIA': 'ee',
  // F
  'FINLAND': 'fi',
  'FRANCE': 'fr',
  // G
  'GERMANY': 'de', 'ALLEMAGNE': 'de', 'ALMANIA': 'de',
  'GREECE': 'gr', 'GRÈCE': 'gr',
  // H
  'HUNGARY': 'hu',
  'HOUSTON': 'us', // Ville, mais on met US
  // I
  'ICELAND': 'is',
  'INDIA': 'in',
  'INDONESIA': 'id',
  'IRELAND': 'ie',
  'ISRAEL': 'il',
  'ITALY': 'it', 'ITALIE': 'it',
  // J
  'JAPAN': 'jp', 'JAPON': 'jp',
  // K
  'KENYA': 'ke',
  'KUWAIT': 'kw',
  // L
  'LATVIA': 'lv',
  'LITHUANIA': 'lt',
  'LUXEMBOURG': 'lu',
  // M
  'MALAYSIA': 'my',
  'MALTA': 'mt',
  'MEXICO': 'mx', 'MEXIQUE': 'mx',
  'MOROCCO': 'ma', 'MAROC': 'ma',
  // N
  'NETHERLANDS': 'nl',
  'NEW ZEALAND': 'nz',
  'NIGERIA': 'ng',
  'NORWAY': 'no',
  // O
  'OMAN': 'om',
  // P
  'PAKISTAN': 'pk',
  'POLAND': 'pl', 'POLOGNE': 'pl',
  'PORTUGAL': 'pt',
  // Q
  'QATAR': 'qa',
  // R
  'ROMANIA': 'ro',
  'RUSSIA': 'ru', 'RUSSIE': 'ru',
  // S
  'SAUDI ARABIA': 'sa', 'ARABIE SAOUDITE': 'sa',
  'SENEGAL': 'sn',
  'SERBIA': 'rs',
  'SINGAPORE': 'sg',
  'SLOVAKIA': 'sk',
  'SLOVENIA': 'si',
  'SOUTH AFRICA': 'za',
  'SOUTH KOREA': 'kr',
  'SPAIN': 'es', 'ESPAGNE': 'es', 'ESPANA': 'es',
  'SWEDEN': 'se', 'SUÈDE': 'se',
  'SWITZERLAND': 'ch', 'SUISSE': 'ch',
  // T
  'THAILAND': 'th',
  'TUNISIA': 'tn', 'TUNISIE': 'tn',
  'TURKEY': 'tr', 'TURQUIE': 'tr',
  // U
  'UAE': 'ae', 'UNITED ARAB EMIRATES': 'ae',
  'UK': 'gb', 'UNITED KINGDOM': 'gb', 'GRANDE-BRETAGNE': 'gb',
  'USA': 'us', 'UNITED STATES': 'us', 'ETATS-UNIS': 'us', 'ÉTATS-UNIS': 'us',
  // V
  'VIETNAM': 'vn',
  // Autres codes directs
  'MA': 'ma', 'FR': 'fr', 'US': 'us', 'ES': 'es', 'DE': 'de',
  'IT': 'it', 'GB': 'gb', 'PT': 'pt', 'NL': 'nl', 'BE': 'be',
  'CH': 'ch', 'AT': 'at', 'SE': 'se', 'NO': 'no', 'DK': 'dk',
  'FI': 'fi', 'IE': 'ie', 'PL': 'pl', 'CZ': 'cz', 'SK': 'sk',
  'HU': 'hu', 'SI': 'si', 'HR': 'hr', 'RS': 'rs', 'BG': 'bg',
  'RO': 'ro', 'GR': 'gr', 'CY': 'cy', 'MT': 'mt', 'EE': 'ee',
  'LV': 'lv', 'LT': 'lt', 'LU': 'lu', 'IS': 'is', 'AL': 'al',
  'BA': 'ba', 'ME': 'me', 'MK': 'mk', 'MD': 'md', 'UA': 'ua',
  'BY': 'by', 'RU': 'ru', 'TR': 'tr', 'GE': 'ge', 'AM': 'am',
  'AZ': 'az', 'KZ': 'kz', 'UZ': 'uz', 'TM': 'tm', 'KG': 'kg',
  'TJ': 'tj', 'MN': 'mn', 'CN': 'cn', 'JP': 'jp', 'KR': 'kr',
  'KP': 'kp', 'TW': 'tw', 'HK': 'hk', 'MO': 'mo', 'IN': 'in',
  'PK': 'pk', 'BD': 'bd', 'LK': 'lk', 'NP': 'np', 'BT': 'bt',
  'MV': 'mv', 'AF': 'af', 'IR': 'ir', 'IQ': 'iq', 'SY': 'sy',
  'LB': 'lb', 'JO': 'jo', 'IL': 'il', 'PS': 'ps', 'SA': 'sa',
  'YE': 'ye', 'OM': 'om', 'AE': 'ae', 'QA': 'qa', 'BH': 'bh',
  'KW': 'kw', 'EG': 'eg', 'LY': 'ly', 'TN': 'tn', 'DZ': 'dz',
  'MR': 'mr', 'ML': 'ml', 'NE': 'ne', 'TD': 'td', 'SD': 'sd',
  'ER': 'er', 'DJ': 'dj', 'ET': 'et', 'SO': 'so', 'KE': 'ke',
  'UG': 'ug', 'TZ': 'tz', 'RW': 'rw', 'BI': 'bi', 'CD': 'cd',
  'CG': 'cg', 'GA': 'ga', 'GQ': 'gq', 'ST': 'st', 'CM': 'cm',
  'CF': 'cf', 'TD': 'td', 'NG': 'ng', 'BJ': 'bj', 'TG': 'tg',
  'GH': 'gh', 'CI': 'ci', 'LR': 'lr', 'SL': 'sl', 'GN': 'gn',
  'GW': 'gw', 'GM': 'gm', 'SN': 'sn', 'CV': 'cv', 'MU': 'mu',
  'MG': 'mg', 'SC': 'sc', 'KM': 'km', 'MZ': 'mz', 'MW': 'mw',
  'ZM': 'zm', 'ZW': 'zw', 'BW': 'bw', 'NA': 'na', 'AO': 'ao',
  'ZA': 'za', 'LS': 'ls', 'SZ': 'sz', 'CA': 'ca', 'MX': 'mx',
  'CU': 'cu', 'JM': 'jm', 'HT': 'ht', 'DO': 'do', 'PR': 'pr',
  'GT': 'gt', 'BZ': 'bz', 'SV': 'sv', 'HN': 'hn', 'NI': 'ni',
  'CR': 'cr', 'PA': 'pa', 'CO': 'co', 'VE': 've', 'GY': 'gy',
  'SR': 'sr', 'GF': 'gf', 'EC': 'ec', 'PE': 'pe', 'BO': 'bo',
  'PY': 'py', 'CL': 'cl', 'AR': 'ar', 'UY': 'uy', 'BR': 'br',
  'FK': 'fk', 'GS': 'gs', 'AU': 'au', 'NZ': 'nz', 'PG': 'pg',
  'SB': 'sb', 'VU': 'vu', 'NC': 'nc', 'PF': 'pf', 'WF': 'wf',
  'KI': 'ki', 'TV': 'tv', 'NR': 'nr', 'TO': 'to', 'FJ': 'fj',
  'WS': 'ws', 'AS': 'as', 'CK': 'ck', 'NU': 'nu', 'TK': 'tk',
  'PM': 'pm', 'GL': 'gl', 'AX': 'ax', 'FO': 'fo', 'SJ': 'sj',
  'BV': 'bv', 'HM': 'hm', 'CX': 'cx', 'CC': 'cc', 'IO': 'io',
}

export function countryFlag(country) {
  if (!country) return null
  
  const code = country.toUpperCase().trim()
  const cc = COUNTRY_CODE_MAP[code]
  
  if (!cc) {
    // Si le pays n'est pas dans la map, retourne les 2 premières lettres
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '22px',
        height: '16px',
        borderRadius: '3px',
        background: '#1a2d45',
        color: '#94a3b8',
        fontSize: '8px',
        fontWeight: '700',
        fontFamily: 'var(--font-mono)',
        border: '1px solid #234068',
      }}>
        {code.slice(0, 2)}
      </span>
    )
  }
  
  // Utilise flagcdn.com pour les vrais drapeaux
  return (
    <img 
      src={`https://flagcdn.com/w40/${cc}.png`}
      alt={country}
      style={{ 
        width: '22px', 
        height: '16px', 
        borderRadius: '3px', 
        objectFit: 'cover',
        display: 'block',
        boxShadow: '0 0 4px rgba(0,0,0,0.3)',
      }}
      onError={(e) => { 
        e.target.style.display = 'none'
        e.target.nextSibling.style.display = 'inline-flex'
      }}
    />
  )
}