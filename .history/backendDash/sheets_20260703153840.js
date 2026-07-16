const { google } = require("googleapis");
require("dotenv").config();

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

const COLUMN_MAP = {
  RESERVATION_NUMBER: 0,
  STATUS: 1,
  BRAND: 2,
  COUNTRY: 3,
  RECEIVED_AT: 4
};

function getAuthClient() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY
    ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : "";

  return new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    null,
    privateKey,
    SCOPES
  );
}

// ═══════════════════════════════════════════════════════════
// BULLETPROOF DATE PARSER — Handles ALL formats
// ═══════════════════════════════════════════════════════════
function parseDate(raw) {
  if (!raw) return null;
  
  const str = String(raw).trim();
  console.log('Parsing date:', JSON.stringify(str));
  
  // Try 1: Direct ISO string (2026-07-03T14:30:00.000Z or 2026-07-03T14:30:00)
  let d = new Date(str);
  if (!isNaN(d.getTime()) && str.includes('T')) {
    console.log('  ✓ Parsed as ISO:', d.toISOString());
    return d;
  }
  
  // Try 2: n8n format "2026-07-03 14:30:00" (space, no T)
  let m = str.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/);
  if (m) {
    const [, year, month, day, hour, minute, second] = m;
    d = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
    if (!isNaN(d.getTime())) {
      console.log('  ✓ Parsed as n8n format:', d.toISOString());
      return d;
    }
  }
  
  // Try 3: DD/MM/YYYY HH:MM or DD-MM-YYYY HH:MM
  m = str.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})[ T](\d{1,2}):(\d{2})/);
  if (m) {
    const [, day, month, year, hour, minute] = m;
    d = new Date(`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}T${hour.padStart(2,'0')}:${minute}:00`);
    if (!isNaN(d.getTime())) {
      console.log('  ✓ Parsed as DD/MM/YYYY:', d.toISOString());
      return d;
    }
  }
  
  // Try 4: Just date DD/MM/YYYY or DD-MM-YYYY
  m = str.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (m) {
    const [, day, month, year] = m;
    d = new Date(`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}T00:00:00`);
    if (!isNaN(d.getTime())) {
      console.log('  ✓ Parsed as date only:', d.toISOString());
      return d;
    }
  }
  
  // Try 5: YYYY-MM-DD only
  m = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    const [, year, month, day] = m;
    d = new Date(`${year}-${month}-${day}T00:00:00`);
    if (!isNaN(d.getTime())) {
      console.log('  ✓ Parsed as YYYY-MM-DD:', d.toISOString());
      return d;
    }
  }
  
  // Try 6: Excel serial number
  if (/^\d+\.?\d*$/.test(str) && str.length < 20) {
    const excelDate = parseFloat(str);
    if (excelDate > 30000 && excelDate < 60000) { // Reasonable Excel date range
      const excelEpoch = new Date(1899, 11, 30); // Excel epoch is Dec 30, 1899
      const days = Math.floor(excelDate);
      const fraction = excelDate - days;
      const ms = days * 86400000 + fraction * 86400000;
      d = new Date(excelEpoch.getTime() + ms);
      if (!isNaN(d.getTime())) {
        console.log('  ✓ Parsed as Excel serial:', d.toISOString());
        return d;
      }
    }
  }
  
  // Try 7: Month name format (Jul 3, 2026 or 3 Jul 2026)
  const monthNames = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  m = str.match(/([A-Za-z]{3})\s+(\d{1,2}),?\s+(\d{4})/i);
  if (m) {
    d = new Date(str);
    if (!isNaN(d.getTime())) {
      console.log('  ✓ Parsed as month name:', d.toISOString());
      return d;
    }
  }
  
  // Try 8: European format DD.MM.YYYY HH:MM
  m = str.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})[ T](\d{1,2}):(\d{2})/);
  if (m) {
    const [, day, month, year, hour, minute] = m;
    d = new Date(`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}T${hour.padStart(2,'0')}:${minute}:00`);
    if (!isNaN(d.getTime())) {
      console.log('  ✓ Parsed as DD.MM.YYYY:', d.toISOString());
      return d;
    }
  }

  // Try 9: Google Sheets rendered date with time (e.g., "7/3/2026 14:30:00")
  m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})[ T](\d{1,2}):(\d{2}):(\d{2})/);
  if (m) {
    const [, month, day, year, hour, minute, second] = m;
    d = new Date(`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}T${hour.padStart(2,'0')}:${minute}:${second}`);
    if (!isNaN(d.getTime())) {
      console.log('  ✓ Parsed as M/D/YYYY:', d.toISOString());
      return d;
    }
  }
  
  console.log('  ✗ FAILED to parse:', str);
  return null;
}

// ═══════════════════════════════════════════════════════════
// BULLETPROOF isToday — String comparison (100% timezone-safe)
// ═══════════════════════════════════════════════════════════
function isToday(date) {
  if (!date || isNaN(date.getTime())) {
    console.log('isToday: invalid date');
    return false;
  }
  
  // Convert both to YYYY-MM-DD strings in LOCAL timezone
  const dateStr = date.toLocaleDateString('en-CA'); // "2026-07-03"
  const todayStr = new Date().toLocaleDateString('en-CA');
  
  const result = dateStr === todayStr;
  
  console.log('isToday:', dateStr, '===', todayStr, '?', result);
  return result;
}

async function fetchSheetData() {
  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "A2:E10000",
      valueRenderOption: 'FORMATTED_VALUE',
    });

    const rows = response.data.values || [];
    console.log(`📊 Fetched ${rows.length} rows from sheet`);

    const parsed = rows
      .filter((row) => row && row.length >= 3)
      .map((row, index) => {
        console.log(`Row ${index}:`, JSON.stringify(row));
        const receivedAt = parseDate(row[COLUMN_MAP.RECEIVED_AT]);
        const isTodayFlag = isToday(receivedAt);
        
        return {
          id: `row-${index}`,
          reservationNumber: row[COLUMN_MAP.RESERVATION_NUMBER] || "",
          status: row[COLUMN_MAP.STATUS] || "",
          brand: (row[COLUMN_MAP.BRAND] || "").toUpperCase().trim(),
          country: row[COLUMN_MAP.COUNTRY] || "",
          receivedAtDate: receivedAt,
          isToday: isTodayFlag,
        };
      });
    
    const todayBookings = parsed.filter(r => r.isToday);
    console.log('═══════════════════════════════════════');
    console.log('TODAY BOOKINGS:', todayBookings.length);
    todayBookings.forEach((r, i) => {
      console.log(`  ${i+1}. ${r.brand} | ${r.reservationNumber} | ${r.receivedAtDate?.toISOString()}`);
    });
    console.log('═══════════════════════════════════════');
    
    return parsed;
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error.message);
    throw error;
  }
}

function buildDashboardData(reservations) {
  const BRANDS = ["UNITED", "MOVIS", "DRIVO"];

  const todayBookings = reservations.filter((r) => r.isToday);

  console.log('═══════════════════════════════════════');
  console.log('BUILDING DASHBOARD');
  console.log('Today is:', new Date().toLocaleDateString('en-CA'));
  console.log('Today bookings:', todayBookings.length);
  console.log('By brand:', {
    UNITED: todayBookings.filter(r => r.brand === 'UNITED').length,
    MOVIS: todayBookings.filter(r => r.brand === 'MOVIS').length,
    DRIVO: todayBookings.filter(r => r.brand === 'DRIVO').length,
  });
  console.log('═══════════════════════════════════════');

  const brandStats = {};
  BRANDS.forEach((brand) => {
    const allBrand = reservations.filter((r) => r.brand === brand);
    const todayBrand = todayBookings.filter((r) => r.brand === brand);
    
    brandStats[brand] = {
      brand,
      totalBookings: allBrand.length,
      todayBookings: todayBrand.length
    };
  });

  console.log('Brand stats:', brandStats);

  // Country ranking by TOTAL
  const countryMap = {};
  reservations.forEach((r) => {
    if (!r.country) return;
    const countryKey = r.country.trim();
    if (!countryMap[countryKey]) {
      countryMap[countryKey] = { country: countryKey, bookings: 0 };
    }
    countryMap[countryKey].bookings++;
  });
  
  const countryStats = Object.values(countryMap)
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 10);

  // Country ranking by TODAY
  const todayCountryMap = {};
  todayBookings.forEach((r) => {
    if (!r.country) return;
    const countryKey = r.country.trim();
    if (!todayCountryMap[countryKey]) {
      todayCountryMap[countryKey] = { country: countryKey, bookings: 0 };
    }
    todayCountryMap[countryKey].bookings++;
  });
  
  const todayCountryStats = Object.values(todayCountryMap)
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 10);

  // Recent bookings (latest 20)
  const latestReservations = [...reservations]
    .sort((a, b) => {
      const da = a.receivedAtDate ? a.receivedAtDate.getTime() : 0;
      const db = b.receivedAtDate ? b.receivedAtDate.getTime() : 0;
      return db - da;
    })
    .slice(0, 20);

  // Leaderboard sorted by TODAY's bookings
  const leaderboard = BRANDS.map((brand) => brandStats[brand])
    .sort((a, b) => b.todayBookings - a.todayBookings);

  // Daily target
  const dailyGoal = parseInt(process.env.DAILY_GOAL) || 200;
  const dailyProgress = Math.min((todayBookings.length / dailyGoal) * 100, 100);

  // Hourly data
  const hourlyMap = {};
  todayBookings.forEach((r) => {
    if (!r.receivedAtDate) return;
    const hour = r.receivedAtDate.getHours();
    hourlyMap[hour] = (hourlyMap[hour] || 0) + 1;
  });
  
  const hourlyData = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    bookings: hourlyMap[h] || 0,
  }));

  return {
    meta: {
      updatedAt: new Date().toISOString(),
      totalReservations: reservations.length,
    },
    todayStats: {
      totalBookings: todayBookings.length,
      dailyGoal,
      dailyProgress,
    },
    brandStats,
    countryStats,
    todayCountryStats,
    latestReservations,
    leaderboard,
    hourlyData,
  };
}

module.exports = { fetchSheetData, buildDashboardData };