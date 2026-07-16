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
    UNITED: '/assets/logos/United_Logo_BG.png',
    MOVIS: '/assets/logos/Movis_Logo_BG.png',
    DRIVO: '/assets/logos/Drivo_Logo_BG.png',
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
  if (s.includes('confirm') || s.includes('active')) return '#0d9940'
  if (s.includes('cancel')) return '#fc2424'
  if (s.includes('pending')) return '#e49d23'
  if (s.includes('complet')) return '#24aeee'
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

// ═══════════════════════════════════════════════════════════
// ═══ FLAG SYSTEM - HYBRID (Offline + API Fallback) ═════════
// ═══════════════════════════════════════════════════════════

// Cache pour éviter les appels répétés
const flagCache = new Map()

// API Rest Countries (gratuit, pas de clé)
const REST_COUNTRIES_API = 'https://restcountries.com/v3.1/name'

// ── Map: NOM DU PAYS → CODE PAYS (2 lettres) ────────────
const COUNTRY_CODE_MAP = {
  'ANTIGUA AND BARBUDA': 'ag',
  'ALBANIA': 'al',
  'ALGERIA': 'dz',
  'ARGENTINA': 'ar',
  'AUSTRALIA': 'au',
  'AUSTRIA': 'at',
  'AZORES': 'pt',
  'BELGIUM': 'be',
  'BOSNIA': 'ba',
  'BOSNIA AND HERZEGOVINA': 'ba',
  'BRAZIL': 'br',
  'BULGARIA': 'bg',
  'CANADA': 'ca',
  'CHILE': 'cl',
  'CHINA': 'cn',
  'COLOMBIA': 'co',
  'CROATIA': 'hr',
  'CZECH REPUBLIC': 'cz',
  'DENMARK': 'dk',
  'DOMINICAN REPUBLIC': 'do',
  'ECUADOR': 'ec',
  'EGYPT': 'eg',
  'ESTONIA': 'ee',
  'FINLAND': 'fi',
  'FRANCE': 'fr',
  'GERMANY': 'de',
  'GREECE': 'gr',
  'HUNGARY': 'hu',
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
  'MAURITIUS': 'mu',
  'MEXICO': 'mx',
  'MOROCCO': 'ma',
  'MAROC': 'ma',
  'NETHERLANDS': 'nl',
  'NEW ZEALAND': 'nz',
  'NIGERIA': 'ng',
  'NORWAY': 'no',
  'OMAN': 'om',
  'PAKISTAN': 'pk',
  'PARAGUAY': 'py',
  'PERU': 'pe',
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
  'UNITED STATES': 'us',
  'VIETNAM': 'vn',
  'VENEZUELA': 've',
  'URUGUAY': 'uy',
  'BOLIVIA': 'bo',
}

// ── Map: VILLE → NOM DU PAYS ─────────────────────────────
const CITY_TO_COUNTRY = {
  // USA
  'ORLANDO': 'USA',
  'HOUSTON': 'USA',
  'NEW YORK': 'USA',
  'LOS ANGELES': 'USA',
  'FLORIDA': 'USA',
  'MIAMI': 'USA',
  'CHICAGO': 'USA',
  'DALLAS': 'USA',
  'LAS VEGAS': 'USA',
  'SAN FRANCISCO': 'USA',
  'BOSTON': 'USA',
  'SEATTLE': 'USA',
  'ATLANTA': 'USA',
  'DENVER': 'USA',
  'PHOENIX': 'USA',
  'WASHINGTON': 'USA',
  'PHILADELPHIA': 'USA',
  'DETROIT': 'USA',
  'NASHVILLE': 'USA',
  'PORTLAND': 'USA',
  'AUSTIN': 'USA',
  'SAN DIEGO': 'USA',
  'SAN JOSE': 'USA',
  'FORT WORTH': 'USA',
  'JACKSONVILLE': 'USA',
  'COLUMBUS': 'USA',
  'CHARLOTTE': 'USA',
  'INDIANAPOLIS': 'USA',
  'SAN ANTONIO': 'USA',
  
  // Europe
  'PARIS': 'FRANCE',
  'LONDON': 'UK',
  'BARCELONA': 'SPAIN',
  'MADRID': 'SPAIN',
  'ROME': 'ITALY',
  'MILAN': 'ITALY',
  'BERLIN': 'GERMANY',
  'MUNICH': 'GERMANY',
  'FRANKFURT': 'GERMANY',
  'HAMBURG': 'GERMANY',
  'AMSTERDAM': 'NETHERLANDS',
  'BRUSSELS': 'BELGIUM',
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
  'ATHENS': 'GREECE',
  'LISBON': 'PORTUGAL',
  'AZORES': 'PORTUGAL',
  'MADEIRA': 'PORTUGAL',
  'PORTO': 'PORTUGAL',
  'FARO': 'PORTUGAL',
  'NICE': 'FRANCE',
  'LYON': 'FRANCE',
  'MARSEILLE': 'FRANCE',
  'TOULOUSE': 'FRANCE',
  'BORDEAUX': 'FRANCE',
  'STRASBOURG': 'FRANCE',
  'LILLE': 'FRANCE',
  'NANTES': 'FRANCE',
  'MONTPELLIER': 'FRANCE',
  'EDINBURGH': 'UK',
  'MANCHESTER': 'UK',
  'BIRMINGHAM': 'UK',
  'GLASGOW': 'UK',
  'LIVERPOOL': 'UK',
  'BRISTOL': 'UK',
  'BELFAST': 'UK',
  'CARDIFF': 'UK',
  'LEEDS': 'UK',
  'NEWCASTLE': 'UK',
  'SHEFFIELD': 'UK',
  'NOTTINGHAM': 'UK',
  'LEICESTER': 'UK',
  'COVENTRY': 'UK',
  'KINGSTON': 'UK',
  
  // Middle East
  'DUBAI': 'UAE',
  'ABU DHABI': 'UAE',
  'SHARJAH': 'UAE',
  'DOHA': 'QATAR',
  'RIYADH': 'SAUDI ARABIA',
  'JEDDAH': 'SAUDI ARABIA',
  'MECCA': 'SAUDI ARABIA',
  'MEDINA': 'SAUDI ARABIA',
  'DAMMAM': 'SAUDI ARABIA',
  'CAIRO': 'EGYPT',
  'ALEXANDRIA': 'EGYPT',
  'SHARM EL SHEIKH': 'EGYPT',
  'HURGHADA': 'EGYPT',
  'LUXOR': 'EGYPT',
  'ASWAN': 'EGYPT',
  'KUWAIT CITY': 'KUWAIT',
  'MUSCAT': 'OMAN',
  'SALALAH': 'OMAN',
  'MANAMA': 'BAHRAIN',
  'BEIRUT': 'LEBANON',
  'AMMAN': 'JORDAN',
  'AQABA': 'JORDAN',
  'PETRA': 'JORDAN',
  'DEAD SEA': 'JORDAN',
  'JERUSALEM': 'ISRAEL',
  'TEL AVIV': 'ISRAEL',
  'HAIFA': 'ISRAEL',
  'EILAT': 'ISRAEL',
  'BAGHDAD': 'IRAQ',
  'BASRA': 'IRAQ',
  'ERBIL': 'IRAQ',
  'TEHRAN': 'IRAN',
  'ISFAHAN': 'IRAN',
  'SHIRAZ': 'IRAN',
  'MASHHAD': 'IRAN',
  'TABRIZ': 'IRAN',
  'DAMASCUS': 'SYRIA',
  'ALEPO': 'SYRIA',
  'LATAKIA': 'SYRIA',
  'SANA': 'YEMEN',
  'ADEN': 'YEMEN',
  'MUKALLA': 'YEMEN',
  
  // North Africa
  'TUNIS': 'TUNISIA',
  'SFAX': 'TUNISIA',
  'SOUSSE': 'TUNISIA',
  'MONASTIR': 'TUNISIA',
  'DJERBA': 'TUNISIA',
  'TOZEUR': 'TUNISIA',
  'CASABLANCA': 'MOROCCO',
  'MARRAKECH': 'MOROCCO',
  'RABAT': 'MOROCCO',
  'FES': 'MOROCCO',
  'TANGIER': 'MOROCCO',
  'AGADIR': 'MOROCCO',
  'ESSAOUIRA': 'MOROCCO',
  'OUARZAZATE': 'MOROCCO',
  'CHEFCHAOUEN': 'MOROCCO',
  'ALGIERS': 'ALGERIA',
  'ORAN': 'ALGERIA',
  'CONSTANTINE': 'ALGERIA',
  'ANNABA': 'ALGERIA',
  'TRIPOLI': 'LIBYA',
  'BENGHAZI': 'LIBYA',
  'SABHA': 'LIBYA',
  'MISRATA': 'LIBYA',
  'CAIRO': 'EGYPT',
  'ALEXANDRIA': 'EGYPT',
  'SHARM EL SHEIKH': 'EGYPT',
  'HURGHADA': 'EGYPT',
  'LUXOR': 'EGYPT',
  'ASWAN': 'EGYPT',
  'DAKHLA': 'WESTERN SAHARA',
  'NOUAKCHOTT': 'MAURITANIA',
  'NOUADHIBOU': 'MAURITANIA',
  'DAKAR': 'SENEGAL',
  'SAINT LOUIS': 'SENEGAL',
  'BANJUL': 'GAMBIA',
  'BISSAU': 'GUINEA BISSAU',
  'CONAKRY': 'GUINEA',
  'FREETOWN': 'SIERRA LEONE',
  'MONROVIA': 'LIBERIA',
  'ABIDJAN': 'IVORY COAST',
  'YAMOUSSOUKRO': 'IVORY COAST',
  'ACCRA': 'GHANA',
  'LOME': 'TOGO',
  'PORTO NOVO': 'BENIN',
  'COTONOU': 'BENIN',
  'LAGOS': 'NIGERIA',
  'ABUJA': 'NIGERIA',
  'IBADAN': 'NIGERIA',
  'KANO': 'NIGERIA',
  'PORT HARCOURT': 'NIGERIA',
  'DOUALA': 'CAMEROON',
  'YAOUNDE': 'CAMEROON',
  'BANGUI': 'CENTRAL AFRICAN REPUBLIC',
  'BRAZZAVILLE': 'CONGO',
  'KINSHASA': 'DEMOCRATIC REPUBLIC OF THE CONGO',
  'LIBREVILLE': 'GABON',
  'MALABO': 'EQUATORIAL GUINEA',
  'SAO TOME': 'SAO TOME AND PRINCIPE',
  'LUANDA': 'ANGOLA',
  'WINDHOEK': 'NAMIBIA',
  'GABORONE': 'BOTSWANA',
  'HARARE': 'ZIMBABWE',
  'LUSAKA': 'ZAMBIA',
  'MAPUTO': 'MOZAMBIQUE',
  'ANTANANARIVO': 'MADAGASCAR',
  'MORONI': 'COMOROS',
  'VICTORIA': 'SEYCHELLES',
  'PORT LOUIS': 'MAURITIUS',
  'SAINT DENIS': 'REUNION',
  'PRETORIA': 'SOUTH AFRICA',
  'CAPE TOWN': 'SOUTH AFRICA',
  'JOHANNESBURG': 'SOUTH AFRICA',
  'DURBAN': 'SOUTH AFRICA',
  'PORT ELIZABETH': 'SOUTH AFRICA',
  'BLOEMFONTEIN': 'SOUTH AFRICA',
  'EAST LONDON': 'SOUTH AFRICA',
  'MBABANE': 'ESWATINI',
  'MASERU': 'LESOTHO',
  'GABORONE': 'BOTSWANA',
  'FRANCISTOWN': 'BOTSWANA',
  'MAUN': 'BOTSWANA',
  'KASANE': 'BOTSWANA',
  
  // Asia
  'TOKYO': 'JAPAN',
  'OSAKA': 'JAPAN',
  'KYOTO': 'JAPAN',
  'YOKOHAMA': 'JAPAN',
  'NAGOYA': 'JAPAN',
  'SAPPORO': 'JAPAN',
  'FUKUOKA': 'JAPAN',
  'KOBE': 'JAPAN',
  'SEOUL': 'SOUTH KOREA',
  'BUSAN': 'SOUTH KOREA',
  'INCHEON': 'SOUTH KOREA',
  'DAEGU': 'SOUTH KOREA',
  'SINGAPORE': 'SINGAPORE',
  'KUALA LUMPUR': 'MALAYSIA',
  'PENANG': 'MALAYSIA',
  'LANGKAWI': 'MALAYSIA',
  'JAKARTA': 'INDONESIA',
  'BALI': 'INDONESIA',
  'YOGYAKARTA': 'INDONESIA',
  'SURABAYA': 'INDONESIA',
  'BANDUNG': 'INDONESIA',
  'BANGKOK': 'THAILAND',
  'PHUKET': 'THAILAND',
  'CHIANG MAI': 'THAILAND',
  'PATTAYA': 'THAILAND',
  'HANOI': 'VIETNAM',
  'HO CHI MINH CITY': 'VIETNAM',
  'DA NANG': 'VIETNAM',
  'HUE': 'VIETNAM',
  'MUMBAI': 'INDIA',
  'DELHI': 'INDIA',
  'BANGALORE': 'INDIA',
  'CHENNAI': 'INDIA',
  'KOLKATA': 'INDIA',
  'HYDERABAD': 'INDIA',
  'PUNE': 'INDIA',
  'JAIPUR': 'INDIA',
  'AHMEDABAD': 'INDIA',
  'SURAT': 'INDIA',
  'LUCKNOW': 'INDIA',
  'KANPUR': 'INDIA',
  'NAGPUR': 'INDIA',
  'INDORE': 'INDIA',
  'THANE': 'INDIA',
  'BHOPAL': 'INDIA',
  'VISAKHAPATNAM': 'INDIA',
  'PATNA': 'INDIA',
  'VADODARA': 'INDIA',
  'GHAZIABAD': 'INDIA',
  'LUDHIANA': 'INDIA',
  'AGRA': 'INDIA',
  'NASHIK': 'INDIA',
  'FARIDABAD': 'INDIA',
  'MEERUT': 'INDIA',
  'RAJKOT': 'INDIA',
  'KALYAN': 'INDIA',
  'VASAI VIRAR': 'INDIA',
  'VARANASI': 'INDIA',
  'SRINAGAR': 'INDIA',
  'AURANGABAD': 'INDIA',
  'DHANBAD': 'INDIA',
  'AMRITSAR': 'INDIA',
  'NAVI MUMBAI': 'INDIA',
  'ALLAHABAD': 'INDIA',
  'RANCHI': 'INDIA',
  'HOWRAH': 'INDIA',
  'COIMBATORE': 'INDIA',
  'JABALPUR': 'INDIA',
  'GWALIOR': 'INDIA',
  'VIJAYAWADA': 'INDIA',
  'JODHPUR': 'INDIA',
  'MADURAI': 'INDIA',
  'RAIPUR': 'INDIA',
  'KOTA': 'INDIA',
  'GUWAHATI': 'INDIA',
  'CHANDIGARH': 'INDIA',
  'SOLAPUR': 'INDIA',
  'HUBBALLI': 'INDIA',
  'TIRUCHIRAPPALLI': 'INDIA',
  'MYSORE': 'INDIA',
  'TIRUPPUR': 'INDIA',
  'GURGAON': 'INDIA',
  'ALIGARH': 'INDIA',
  'JAMMU': 'INDIA',
  'BHIWANDI': 'INDIA',
  'BHUBANESWAR': 'INDIA',
  'BHILAI': 'INDIA',
  'MANGALORE': 'INDIA',
  'AMRAVATI': 'INDIA',
  'KARACHI': 'PAKISTAN',
  'LAHORE': 'PAKISTAN',
  'ISLAMABAD': 'PAKISTAN',
  'FAISALABAD': 'PAKISTAN',
  'RAWALPINDI': 'PAKISTAN',
  'GUJRANWALA': 'PAKISTAN',
  'MULTAN': 'PAKISTAN',
  'PESHAWAR': 'PAKISTAN',
  'SIALKOT': 'PAKISTAN',
  'DHAKA': 'BANGLADESH',
  'CHITTAGONG': 'BANGLADESH',
  'KHULNA': 'BANGLADESH',
  'COLOMBO': 'SRI LANKA',
  'KANDY': 'SRI LANKA',
  'NEGOMBO': 'SRI LANKA',
  'KATHMANDU': 'NEPAL',
  'POKHARA': 'NEPAL',
  'THIMPHU': 'BHUTAN',
  'MALE': 'MALDIVES',
  'MANILA': 'PHILIPPINES',
  'CEBU': 'PHILIPPINES',
  'DAVAO': 'PHILIPPINES',
  'HONG KONG': 'CHINA',
  'SHANGHAI': 'CHINA',
  'BEIJING': 'CHINA',
  'GUANGZHOU': 'CHINA',
  'SHENZHEN': 'CHINA',
  'CHENGDU': 'CHINA',
  'HANGZHOU': 'CHINA',
  'WUHAN': 'CHINA',
  'XI AN': 'CHINA',
  'SUZHOU': 'CHINA',
  'TIANJIN': 'CHINA',
  'NANJING': 'CHINA',
  'CHONGQING': 'CHINA',
  'DALIAN': 'CHINA',
  'QINGDAO': 'CHINA',
  'HARBIN': 'CHINA',
  'TAIPEI': 'TAIWAN',
  'KAOHSIUNG': 'TAIWAN',
  'TAICHUNG': 'TAIWAN',
  'MACAU': 'CHINA',
  'PYONGYANG': 'NORTH KOREA',
  'ULAANBAATAR': 'MONGOLIA',
  'TASHKENT': 'UZBEKISTAN',
  'ALMATY': 'KAZAKHSTAN',
  'ASTANA': 'KAZAKHSTAN',
  'BISHKEK': 'KYRGYZSTAN',
  'DUSHANBE': 'TAJIKISTAN',
  'ASHGABAT': 'TURKMENISTAN',
  'KABUL': 'AFGHANISTAN',
  'ISLAMABAD': 'PAKISTAN',
  'KARACHI': 'PAKISTAN',
  'LAHORE': 'PAKISTAN',
  'YANGON': 'MYANMAR',
  'MANDALAY': 'MYANMAR',
  'PHNOM PENH': 'CAMBODIA',
  'SIEM REAP': 'CAMBODIA',
  'VIENTIANE': 'LAOS',
  'LUANG PRABANG': 'LAOS',
  'BRUNEI': 'BRUNEI',
  'BANDAR SERI BEGAWAN': 'BRUNEI',
  
  // Oceania
  'SYDNEY': 'AUSTRALIA',
  'MELBOURNE': 'AUSTRALIA',
  'BRISBANE': 'AUSTRALIA',
  'PERTH': 'AUSTRALIA',
  'ADELAIDE': 'AUSTRALIA',
  'GOLD COAST': 'AUSTRALIA',
  'CAIRNS': 'AUSTRALIA',
  'DARWIN': 'AUSTRALIA',
  'CANBERRA': 'AUSTRALIA',
  'HOBART': 'AUSTRALIA',
  'AUCKLAND': 'NEW ZEALAND',
  'WELLINGTON': 'NEW ZEALAND',
  'CHRISTCHURCH': 'NEW ZEALAND',
  'QUEENSTOWN': 'NEW ZEALAND',
  'FIJI': 'FIJI',
  'NAADI': 'FIJI',
  'SUVA': 'FIJI',
  'PORT MORESBY': 'PAPUA NEW GUINEA',
  'HONIARA': 'SOLOMON ISLANDS',
  'APIA': 'SAMOA',
  'Nuku alofa': 'TONGA',
  'TARAWA': 'KIRIBATI',
  'FUNAFUTI': 'TUVALU',
  'YAREN': 'NAURU',
  'PALIKIR': 'MICRONESIA',
  'MAJURO': 'MARSHALL ISLANDS',
  'SAIPAN': 'NORTHERN MARIANA ISLANDS',
  'GUAM': 'GUAM',
  'HAGATNA': 'GUAM',
  'NOUMEA': 'NEW CALEDONIA',
  'PAPEETE': 'FRENCH POLYNESIA',
  'RAROTONGA': 'COOK ISLANDS',
  'APIA': 'SAMOA',
  'PAGO PAGO': 'AMERICAN SAMOA',
  'HONOLULU': 'USA',
  'GUAM': 'USA',
  
  // Americas
  'TORONTO': 'CANADA',
  'VANCOUVER': 'CANADA',
  'MONTREAL': 'CANADA',
  'CALGARY': 'CANADA',
  'OTTAWA': 'CANADA',
  'EDMONTON': 'CANADA',
  'QUEBEC CITY': 'CANADA',
  'WINNIPEG': 'CANADA',
  'HALIFAX': 'CANADA',
  'VICTORIA': 'CANADA',
  'SASKATOON': 'CANADA',
  'REGINA': 'CANADA',
  'ST JOHNS': 'CANADA',
  'YELLOWKNIFE': 'CANADA',
  'WHITEHORSE': 'CANADA',
  'IQALUIT': 'CANADA',
  'MEXICO CITY': 'MEXICO',
  'CANCUN': 'MEXICO',
  'GUADALAJARA': 'MEXICO',
  'MONTERREY': 'MEXICO',
  'PUERTO VALLARTA': 'MEXICO',
  'ACAPULCO': 'MEXICO',
  'TIJUANA': 'MEXICO',
  'MERIDA': 'MEXICO',
  'OAXACA': 'MEXICO',
  'PUEBLA': 'MEXICO',
  'SAN MIGUEL DE ALLENDE': 'MEXICO',
  'PLAYA DEL CARMEN': 'MEXICO',
  'TULUM': 'MEXICO',
  'CABO SAN LUCAS': 'MEXICO',
  'MAZATLAN': 'MEXICO',
  'PUERTO ESCONDIDO': 'MEXICO',
  'BAJA CALIFORNIA': 'MEXICO',
  'BAHAMAS': 'BAHAMAS',
  'NASSAU': 'BAHAMAS',
  'PARADISE ISLAND': 'BAHAMAS',
  'CUBA': 'CUBA',
  'HAVANA': 'CUBA',
  'VARADERO': 'CUBA',
  'JAMAICA': 'JAMAICA',
  'MONTEGO BAY': 'JAMAICA',
  'OCHO RIOS': 'JAMAICA',
  'NEGRIL': 'JAMAICA',
  'KINGSTON': 'JAMAICA',
  'HAITI': 'HAITI',
  'PORT AU PRINCE': 'HAITI',
  'DOMINICAN REPUBLIC': 'DOMINICAN REPUBLIC',
  'PUNTA CANA': 'DOMINICAN REPUBLIC',
  'SANTO DOMINGO': 'DOMINICAN REPUBLIC',
  'PUERTO PLATA': 'DOMINICAN REPUBLIC',
  'LA ROMANA': 'DOMINICAN REPUBLIC',
  'SAMANA': 'DOMINICAN REPUBLIC',
  'BARBADOS': 'BARBADOS',
  'BRIDGETOWN': 'BARBADOS',
  'TRINIDAD AND TOBAGO': 'TRINIDAD AND TOBAGO',
  'PORT OF SPAIN': 'TRINIDAD AND TOBAGO',
  'GRENADA': 'GRENADA',
  'ST GEORGES': 'GRENADA',
  'ST LUCIA': 'ST LUCIA',
  'CASTRIES': 'ST LUCIA',
  'ST VINCENT': 'ST VINCENT AND THE GRENADINES',
  'KINGSTOWN': 'ST VINCENT AND THE GRENADINES',
  'ANTIGUA': 'ANTIGUA AND BARBUDA',
  'ST JOHNS': 'ANTIGUA AND BARBUDA',
  'GUATEMALA': 'GUATEMALA',
  'ANTIGUA': 'GUATEMALA',
  'BELIZE': 'BELIZE',
  'BELIZE CITY': 'BELIZE',
  'HONDURAS': 'HONDURAS',
  'TEGUCIGALPA': 'HONDURAS',
  'ROATAN': 'HONDURAS',
  'EL SALVADOR': 'EL SALVADOR',
  'SAN SALVADOR': 'EL SALVADOR',
  'NICARAGUA': 'NICARAGUA',
  'MANAGUA': 'NICARAGUA',
  'GRANADA': 'NICARAGUA',
  'COSTA RICA': 'COSTA RICA',
  'SAN JOSE': 'COSTA RICA',
  'LIBERIA': 'COSTA RICA',
  'PANAMA': 'PANAMA',
  'PANAMA CITY': 'PANAMA',
  'BOCAS DEL TORO': 'PANAMA',
  'COLOMBIA': 'COLOMBIA',
  'BOGOTA': 'COLOMBIA',
  'MEDELLIN': 'COLOMBIA',
  'CARTAGENA': 'COLOMBIA',
  'CALI': 'COLOMBIA',
  'SANTA MARTA': 'COLOMBIA',
  'SAN ANDRES': 'COLOMBIA',
  'BARRANQUILLA': 'COLOMBIA',
  'ECUADOR': 'ECUADOR',
  'QUITO': 'ECUADOR',
  'GUAYAQUIL': 'ECUADOR',
  'GALAPAGOS': 'ECUADOR',
  'PERU': 'PERU',
  'LIMA': 'PERU',
  'CUSCO': 'PERU',
  'AREQUIPA': 'PERU',
  'MACHU PICCHU': 'PERU',
  'TRUJILLO': 'PERU',
  'BRAZIL': 'BRAZIL',
  'SAO PAULO': 'BRAZIL',
  'RIO DE JANEIRO': 'BRAZIL',
  'SALVADOR': 'BRAZIL',
  'FORTALEZA': 'BRAZIL',
  'RECIFE': 'BRAZIL',
  'NATAL': 'BRAZIL',
  'JOAO PESSOA': 'BRAZIL',
  'BELEM': 'BRAZIL',
  'MANAUS': 'BRAZIL',
  'CURITIBA': 'BRAZIL',
  'PORTO ALEGRE': 'BRAZIL',
  'FLORIANOPOLIS': 'BRAZIL',
  'BALNEARIO CAMBORIU': 'BRAZIL',
  'CAMBORIU': 'BRAZIL',
  'ARGENTINA': 'ARGENTINA',
  'BUENOS AIRES': 'ARGENTINA',
  'MENDOZA': 'ARGENTINA',
  'CORDOBA': 'ARGENTINA',
  'BARILOCHE': 'ARGENTINA',
  'USHUAIA': 'ARGENTINA',
  'EL CALAFATE': 'ARGENTINA',
  'IGUAZU': 'ARGENTINA',
  'SALTA': 'ARGENTINA',
  'JUJUY': 'ARGENTINA',
  'CHILE': 'CHILE',
  'SANTIAGO': 'CHILE',
  'VALPARAISO': 'CHILE',
  'VINA DEL MAR': 'CHILE',
  'SAN PEDRO DE ATACAMA': 'CHILE',
  'PUCON': 'CHILE',
  'TORRES DEL PAINE': 'CHILE',
  'EASTER ISLAND': 'CHILE',
  'URUGUAY': 'URUGUAY',
  'MONTEVIDEO': 'URUGUAY',
  'PUNTA DEL ESTE': 'URUGUAY',
  'PARAGUAY': 'PARAGUAY',
  'ASUNCION': 'PARAGUAY',
  'BOLIVIA': 'BOLIVIA',
  'LA PAZ': 'BOLIVIA',
  'SUCRE': 'BOLIVIA',
  'SANTA CRUZ': 'BOLIVIA',
  'UYUNI': 'BOLIVIA',
  'VENEZUELA': 'VENEZUELA',
  'CARACAS': 'VENEZUELA',
  'MARGARITA ISLAND': 'VENEZUELA',
  'GUYANA': 'GUYANA',
  'GEORGETOWN': 'GUYANA',
  'SURINAME': 'SURINAME',
  'PARAMARIBO': 'SURINAME',
  'FRENCH GUIANA': 'FRENCH GUIANA',
  'CAYENNE': 'FRENCH GUIANA',
  'ARUBA': 'ARUBA',
  'ORANJESTAD': 'ARUBA',
  'CURACAO': 'CURACAO',
  'WILLEMSTAD': 'CURACAO',
  'BONAIRE': 'BONAIRE',
  'SINT MAARTEN': 'SINT MAARTEN',
  'PHILIPSBURG': 'SINT MAARTEN',
  'ST BARTS': 'SAINT BARTHELEMY',
  'GUSTAVIA': 'SAINT BARTHELEMY',
  'ST MARTIN': 'SAINT MARTIN',
  'MARIGOT': 'SAINT MARTIN',
  'ANGUILLA': 'ANGUILLA',
  'THE VALLEY': 'ANGUILLA',
  'MONTSERRAT': 'MONTSERRAT',
  'PLYMOUTH': 'MONTSERRAT',
  'ST KITTS': 'SAINT KITTS AND NEVIS',
  'BASSETERRE': 'SAINT KITTS AND NEVIS',
  'NEVIS': 'SAINT KITTS AND NEVIS',
  'CHARLESTOWN': 'SAINT KITTS AND NEVIS',
  'DOMINICA': 'DOMINICA',
  'ROSEAU': 'DOMINICA',
  'MARTINIQUE': 'MARTINIQUE',
  'FORT DE FRANCE': 'MARTINIQUE',
  'GUADELOUPE': 'GUADELOUPE',
  'BASSE TERRE': 'GUADELOUPE',
  'POINTE A PITRE': 'GUADELOUPE',
  'ST LUCIA': 'ST LUCIA',
  'CASTRIES': 'ST LUCIA',
  'ST VINCENT': 'ST VINCENT AND THE GRENADINES',
  'KINGSTOWN': 'ST VINCENT AND THE GRENADINES',
  'BEQUIA': 'ST VINCENT AND THE GRENADINES',
  'MUSTIQUE': 'ST VINCENT AND THE GRENADINES',
  'CANOUAN': 'ST VINCENT AND THE GRENADINES',
  'UNION ISLAND': 'ST VINCENT AND THE GRENADINES',
  'GRENADA': 'GRENADA',
  'ST GEORGES': 'GRENADA',
  'CARRIACOU': 'GRENADA',
  'PETIT MARTINIQUE': 'GRENADA',
  'TRINIDAD': 'TRINIDAD AND TOBAGO',
  'TOBAGO': 'TRINIDAD AND TOBAGO',
  'SCARBOROUGH': 'TRINIDAD AND TOBAGO',
  'BARBADOS': 'BARBADOS',
  'BRIDGETOWN': 'BARBADOS',
  'ANTIGUA': 'ANTIGUA AND BARBUDA',
  'ST JOHNS': 'ANTIGUA AND BARBUDA',
  'BARBUDA': 'ANTIGUA AND BARBUDA',
  'MONTSERRAT': 'MONTSERRAT',
  'PLYMOUTH': 'MONTSERRAT',
  'ANGUILLA': 'ANGUILLA',
  'THE VALLEY': 'ANGUILLA',
  'ST MAARTEN': 'SINT MAARTEN',
  'PHILIPSBURG': 'SINT MAARTEN',
  'ST MARTIN': 'SAINT MARTIN',
  'MARIGOT': 'SAINT MARTIN',
  'ST BARTS': 'SAINT BARTHELEMY',
  'GUSTAVIA': 'SAINT BARTHELEMY',
  'SABA': 'SABA',
  'THE BOTTOM': 'SABA',
  'ST EUSTATIUS': 'SINT EUSTATIUS',
  'ORANJESTAD': 'SINT EUSTATIUS',
  'ARUBA': 'ARUBA',
  'ORANJESTAD': 'ARUBA',
  'CURACAO': 'CURACAO',
  'WILLEMSTAD': 'CURACAO',
  'BONAIRE': 'BONAIRE',
  'KRALENDIJK': 'BONAIRE',
  'GUYANA': 'GUYANA',
  'GEORGETOWN': 'GUYANA',
  'SURINAME': 'SURINAME',
  'PARAMARIBO': 'SURINAME',
  'FRENCH GUIANA': 'FRENCH GUIANA',
  'CAYENNE': 'FRENCH GUIANA',
  'FALKLAND ISLANDS': 'FALKLAND ISLANDS',
  'STANLEY': 'FALKLAND ISLANDS',
  'SOUTH GEORGIA': 'SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS',
  'GRYTVIKEN': 'SOUTH GEORGIA AND THE SOUTH SANDWICH ISLANDS',
  'ANTARCTICA': 'AQ',
  'MCMURDO': 'AQ',
  'SOUTH POLE': 'AQ'
}

// ── HYBRID FLAG RESOLVER ─────────────────────────────────
// 1. Check cache (fastest)
// 2. Check offline maps (fast, no API)
// 3. Call Rest Countries API (fallback, async)

export async function resolveFlagAsync(location) {
  if (!location) return 'xx'
  
  const key = location.toUpperCase().trim()
  
  // 1. Cache
  if (flagCache.has(key)) {
    return flagCache.get(key)
  }
  
  // 2. Offline maps
  if (COUNTRY_CODE_MAP[key]) {
    flagCache.set(key, COUNTRY_CODE_MAP[key])
    return COUNTRY_CODE_MAP[key]
  }
  
  if (CITY_TO_COUNTRY[key]) {
    const countryName = CITY_TO_COUNTRY[key]
    const code = COUNTRY_CODE_MAP[countryName]
    if (code) {
      flagCache.set(key, code)
      return code
    }
  }
  
  // 3. Try to extract country from compound strings like "Florida, USA"
  const parts = key.split(/[,;\/]/)
  for (const part of parts) {
    const trimmed = part.trim()
    if (COUNTRY_CODE_MAP[trimmed]) {
      flagCache.set(key, COUNTRY_CODE_MAP[trimmed])
      return COUNTRY_CODE_MAP[trimmed]
    }
    if (CITY_TO_COUNTRY[trimmed]) {
      const code = COUNTRY_CODE_MAP[CITY_TO_COUNTRY[trimmed]]
      if (code) {
        flagCache.set(key, code)
        return code
      }
    }
  }
  
  // 4. API Fallback: Rest Countries
  try {
    const response = await fetch(
      `${REST_COUNTRIES_API}/${encodeURIComponent(location)}?fields=cca2`
    )
    if (!response.ok) throw new Error('API error')
    
    const data = await response.json()
    const code = data[0]?.cca2?.toLowerCase() || 'xx'
    flagCache.set(key, code)
    return code
    
  } catch (error) {
    // 5. Ultimate fallback: first 2 letters
    const fallback = key.slice(0, 2).toLowerCase() || 'xx'
    flagCache.set(key, fallback)
    return fallback
  }
}

// ── SYNC version (uses cache after first call) ───────────
export function countryFlag(location) {
  if (!location) return '🌍'
  
  const key = location.toUpperCase().trim()
  
  // If in cache, return immediately
  if (flagCache.has(key)) {
    const code = flagCache.get(key)
    return code === 'xx' ? '🌍' : code
  }
  
  // Try offline maps synchronously
  if (COUNTRY_CODE_MAP[key]) {
    flagCache.set(key, COUNTRY_CODE_MAP[key])
    return COUNTRY_CODE_MAP[key]
  }
  
  if (CITY_TO_COUNTRY[key]) {
    const countryName = CITY_TO_COUNTRY[key]
    const code = COUNTRY_CODE_MAP[countryName]
    if (code) {
      flagCache.set(key, code)
      return code
    }
  }
  
  // Compound strings
  const parts = key.split(/[,;\/]/)
  for (const part of parts) {
    const trimmed = part.trim()
    if (COUNTRY_CODE_MAP[trimmed]) {
      flagCache.set(key, COUNTRY_CODE_MAP[trimmed])
      return COUNTRY_CODE_MAP[trimmed]
    }
    if (CITY_TO_COUNTRY[trimmed]) {
      const code = COUNTRY_CODE_MAP[CITY_TO_COUNTRY[trimmed]]
      if (code) {
        flagCache.set(key, code)
        return code
      }
    }
  }
  
  // Not found in offline maps - return placeholder
  // The async version will fetch from API and update cache
  return 'xx'
}

// ── Flag URL builder ─────────────────────────────────────
export function countryFlagUrl(location) {
  const code = countryFlag(location)
  if (code && code !== '🌍' && code !== 'xx') {
    return `https://flagcdn.com/w40/${code}.png`
  }
  // Fallback: try to resolve asynchronously for next time
  resolveFlagAsync(location).catch(() => {})
  return `https://flagcdn.com/w40/xx.png`
}

// ── Emoji flag (synchronous) ───────────────────────────
export function countryFlagEmoji(location) {
  const code = countryFlag(location)
  if (!code || code === 'xx') return '🌍'
  
  // Convert 2-letter code to emoji flag
  const codePoints = code
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

// ── Resolve country name for display ───────────────────
export function resolveCountry(location) {
  if (!location) return null
  
  const upper = location.toUpperCase().trim()
  
  // If it's a city, return the country name
  if (CITY_TO_COUNTRY[upper]) {
    return CITY_TO_COUNTRY[upper]
  }
  
  // If it's already a country, return it
  if (COUNTRY_CODE_MAP[upper]) {
    return upper
  }
  
  // Try partial match
  const parts = upper.split(/[,;\/]/)
  for (const part of parts) {
    const trimmed = part.trim()
    if (CITY_TO_COUNTRY[trimmed]) {
      return CITY_TO_COUNTRY[trimmed]
    }
    if (COUNTRY_CODE_MAP[trimmed]) {
      return trimmed
    }
  }
  
  return upper
}

// ── Preload common flags (optional optimization) ────────
export function preloadCommonFlags() {
  const common = ['USA', 'FRANCE', 'UK', 'GERMANY', 'ITALY', 'SPAIN', 'MOROCCO', 'GREECE', 'MALTA', 'PORTUGAL', 'UAE', 'TURKEY', 'EGYPT', 'TUNISIA', 'ALGERIA', 'NETHERLANDS', 'BELGIUM', 'SWITZERLAND', 'AUSTRIA', 'ORLANDO', 'FLORIDA', 'MIAMI', 'DUBAI', 'PARIS', 'LONDON', 'BARCELONA', 'ROME']
  
  common.forEach(loc => {
    countryFlag(loc) // Preload into cache
  })
}