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

// ── IMPROVED DATE PARSING ───────────────────────────────────
function parseDate(raw) {
  if (!raw) return null;
  
  const str = String(raw).trim();
  
  // Try multiple formats
  // Format 1: ISO 2026-07-02 14:30:00
  let parsed = new Date(str);
  if (!isNaN(parsed.getTime())) return parsed;
  
  // Format 2: DD/MM/YYYY HH:MM
  const parts = str.match(/(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{4})\s+(\d{2}):(\d{2})/);
  if (parts) {
    const [, day, month, year, hour, minute] = parts;
    parsed = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  
  // Format 3: Try just date
  parsed = new Date(str.replace(/(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{4})/, '$3-$2-$1'));
  if (!isNaN(parsed.getTime())) return parsed;
  
  console.log('⚠️ Failed to parse date:', str);
  return null;
}

// ── IMPROVED isToday ──────────────────────────────────────
function isToday(date) {
  if (!date || isNaN(date.getTime())) return false;
  
  const today = new Date();
  const result = (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
  
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

    // Fetches the streamlined data columns
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "A2:E10000", // Grabs exactly your 5 data columns, skipping headers
    });

    const rows = response.data.values || [];
    console.log(`📊 Fetched ${rows.length} rows from sheet`);

    const parsed = rows
      .filter((row) => row && row.length >= 3)
      .map((row, index) => {
        const receivedAt = parseDate(row[COLUMN_MAP.RECEIVED_AT]);
        const isTodayFlag = isToday(receivedAt);
        
        if (index < 5) { // Log first 5 rows for debugging
          console.log(`Row ${index}:`, {
            reservation: row[COLUMN_MAP.RESERVATION_NUMBER],
            brand: row[COLUMN_MAP.BRAND],
            dateRaw: row[COLUMN_MAP.RECEIVED_AT],
            dateParsed: receivedAt,
            isToday: isTodayFlag
          });
        }
        
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
    
    // Log summary
    const todayCount = parsed.filter(r => r.isToday).length;
    console.log(`✅ Parsed ${parsed.length} reservations, ${todayCount} from today`);
    
    return parsed;
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error.message);
    throw error;
  }
}

function buildDashboardData(reservations) {
  const BRANDS = ["UNITED", "MOVIS", "DRIVO"];
  const today = new Date();
  console.log('Building dashboard for date:', today.toDateString());

  // Filter out bookings arrived today
  const todayBookings = reservations.filter((r) => r.isToday);
  console.log('Today bookings:', todayBookings.length);
  console.log('Today bookings by brand:', {
    UNITED: todayBookings.filter(r => r.brand === 'UNITED').length,
    MOVIS: todayBookings.filter(r => r.brand === 'MOVIS').length,
    DRIVO: todayBookings.filter(r => r.brand === 'DRIVO').length,
  });

  // Compute Volume Statistics cleanly by Volume (Since pricing data is omitted)
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
    countryStats,        // Total (all time)
    todayCountryStats,   // NEW: Today's only
    latestReservations,
    leaderboard,
    hourlyData,
  };
}

module.exports = { fetchSheetData, buildDashboardData };