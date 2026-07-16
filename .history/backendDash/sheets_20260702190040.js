const { google } = require("googleapis");
require("dotenv").config();

// Scope required for Google Sheets API access
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

// Clean 5-column layout mapping matching your exact streamlined n8n output schema
const COLUMN_MAP = {
  RESERVATION_NUMBER: 0, // Column A
  STATUS: 1,             // Column B
  BRAND: 2,              // Column C
  COUNTRY: 3,            // Column D
  RECEIVED_AT: 4         // Column E (Crucial for live tracking filtering)
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
// BULLETPROOF DATE PARSER — Handles almost any format
// ═══════════════════════════════════════════════════════════
function parseDate(raw) {
  if (!raw) return null;
  
  const str = String(raw).trim();
  
  // Log for debugging
  console.log('Parsing date:', str);
  
  // Try 1: Direct ISO string (2026-07-02 14:30:00)
  let d = new Date(str);
  if (!isNaN(d.getTime())) {
    console.log('  ✓ Parsed as ISO:', d.toISOString());
    return d;
  }
  
  // Try 2: DD/MM/YYYY HH:MM or DD-MM-YYYY HH:MM
  let m = str.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})[ T](\d{1,2}):(\d{2})/);
  if (m) {
    const [, day, month, year, hour, minute] = m;
    d = new Date(`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}T${hour.padStart(2,'0')}:${minute}:00`);
    if (!isNaN(d.getTime())) {
      console.log('  ✓ Parsed as DD/MM/YYYY:', d.toISOString());
      return d;
    }
  }
  
  // Try 3: MM/DD/YYYY HH:MM (American format)
  m = str.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})[ T](\d{1,2}):(\d{2})/);
  if (m) {
    const [, month, day, year, hour, minute] = m;
    d = new Date(`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}T${hour.padStart(2,'0')}:${minute}:00`);
    if (!isNaN(d.getTime())) {
      console.log('  ✓ Parsed as MM/DD/YYYY:', d.toISOString());
      return d;
    }
  }
  
  // Try 4: Just date DD/MM/YYYY
  m = str.match(/(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
  if (m) {
    const [, day, month, year] = m;
    d = new Date(`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}T00:00:00`);
    if (!isNaN(d.getTime())) {
      console.log('  ✓ Parsed as date only:', d.toISOString());
      return d;
    }
  }
  
  // Try 5: Excel serial number (e.g., 45123.5)
  if (/^\d+\.?\d*$/.test(str)) {
    const excelDate = parseFloat(str);
    // Excel epoch is 1900-01-01 (with the 1900 leap year bug)
    const excelEpoch = new Date(1900, 0, 1);
    const days = Math.floor(excelDate);
    const fraction = excelDate - days;
    const ms = days * 86400000 + fraction * 86400000;
    d = new Date(excelEpoch.getTime() + ms - 86400000); // Adjust for bug
    if (!isNaN(d.getTime())) {
      console.log('  ✓ Parsed as Excel serial:', d.toISOString());
      return d;
    }
  }
  
  // Try 6: Google Sheets date format (Date object string)
  m = str.match(/([A-Za-z]{3})\s+(\d{1,2}),?\s+(\d{4})/);
  if (m) {
    d = new Date(str);
    if (!isNaN(d.getTime())) {
      console.log('  ✓ Parsed as month name:', d.toISOString());
      return d;
    }
  }
  
  console.log('  ✗ FAILED to parse:', str);
  return null;
}

// ═══════════════════════════════════════════════════════════
// isToday — Compare dates properly
// ═══════════════════════════════════════════════════════════
function isToday(date) {
  if (!date || isNaN(date.getTime())) {
    console.log('isToday: invalid date');
    return false;
  }
  
  const today = new Date();
  const result = (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
  
  console.log('isToday:', date.toDateString(), '===', today.toDateString(), '?', result);
  return result;
}

async function fetchSheetData() {
  console.log('🔍 DEBUG ENV VARS:');
  console.log('🔍 GOOGLE_SHEET_ID:', JSON.stringify(process.env.GOOGLE_SHEET_ID));
  console.log('🔍 GOOGLE_SERVICE_ACCOUNT_EMAIL:', JSON.stringify(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL));
  console.log('🔍 GOOGLE_PRIVATE_KEY exists:', !!process.env.GOOGLE_PRIVATE_KEY);
  console.log('🔍 ALL ENV KEYS:', Object.keys(process.env).filter(k => k.includes('GOOGLE')));
  
  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "A2:E10000",
    });

    const rows = response.data.values || [];
    console.log(`📊 Fetched ${rows.length} rows from sheet`);

    const parsed = rows
      .filter((row) => row && row.length >= 3)
      .map((row, index) => {
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
    
    // Log ALL today's bookings
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
  const today = new Date();

  const todayBookings = reservations.filter((r) => r.isToday);

  console.log('═══════════════════════════════════════');
  console.log('BUILDING DASHBOARD');
  console.log('Today is:', today.toDateString());
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

  // Country ranking leaderboard by TOTAL Volume
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

  // NEW: Country ranking leaderboard by TODAY's Volume
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

  // Recent feed streaming (Latest 20 items mapped)
  const latestReservations = [...reservations]
    .sort((a, b) => {
      const da = a.receivedAtDate ? a.receivedAtDate.getTime() : 0;
      const db = b.receivedAtDate ? b.receivedAtDate.getTime() : 0;
      return db - da;
    })
    .slice(0, 20);

  // Leaderboard structured by daily booking volumes 
  const leaderboard = BRANDS.map((brand) => brandStats[brand])
    .sort((a, b) => b.todayBookings - a.todayBookings);

  // Daily target threshold calculations (Race to 200)
  const dailyGoal = parseInt(process.env.DAILY_GOAL) || 200;
  const dailyProgress = Math.min((todayBookings.length / dailyGoal) * 100, 100);

  // Hourly density timeline map for today
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
      updatedAt: today.toISOString(),
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