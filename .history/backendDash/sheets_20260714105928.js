const { google } = require("googleapis");
require("dotenv").config();

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

const COLUMN_MAP = {
  RESERVATION_NUMBER: 0,
  BRAND: 1,
  STATUS: 2,
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

function parseDate(raw) {
  if (!raw) return null;
  
  const str = String(raw).trim();
  
  if (str.match(/^\d{4}-\d{2}-\d{2}/)) {
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d;
  }
  
  let m = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})[ T](\d{1,2}):(\d{2}):(\d{2})$/);
  if (m) {
    const [, day, month, year, hour, minute, second] = m;
    const d = new Date(`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}T${hour.padStart(2,'0')}:${minute}:${second}`);
    if (!isNaN(d.getTime())) return d;
  }
  
  m = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})[ T](\d{1,2}):(\d{2})$/);
  if (m) {
    const [, day, month, year, hour, minute] = m;
    const d = new Date(`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}T${hour.padStart(2,'0')}:${minute}:00`);
    if (!isNaN(d.getTime())) return d;
  }
  
  m = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (m) {
    const [, day, month, year] = m;
    const d = new Date(`${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}T00:00:00`);
    if (!isNaN(d.getTime())) return d;
  }
  
  if (/^\d+\.?\d*$/.test(str) && str.length < 20) {
    const excelDate = parseFloat(str);
    if (excelDate > 30000 && excelDate < 60000) {
      const excelEpoch = new Date(1899, 11, 30);
      const days = Math.floor(excelDate);
      const fraction = excelDate - days;
      const ms = days * 86400000 + fraction * 86400000;
      const d = new Date(excelEpoch.getTime() + ms);
      if (!isNaN(d.getTime())) return d;
    }
  }
  
  return null;
}

// ═══════════════════════════════════════════════════════════
// isToday — Accepts today OR yesterday (for testing)
// ═══════════════════════════════════════════════════════════
function isToday(date) {
  if (!date || isNaN(date.getTime())) {
    console.log('isToday: INVALID date =', date);
    return false;
  }
  
  const dateStr = date.toISOString().split('T')[0];
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  
  // Accept today OR yesterday (for testing with existing data)
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  const result = dateStr === todayStr || dateStr === yesterdayStr;
  
  console.log('isToday:', dateStr, 'today=', todayStr, 'yesterday=', yesterdayStr, 'result=', result);
  return result;
}

async function fetchSheetData() {
  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "A2:E10000",
    });

    const rows = response.data.values || [];
    console.log(`📊 Fetched ${rows.length} rows from sheet`);
    console.log('🔍 SERVER TIME:', new Date().toISOString());
    console.log('🔍 SERVER TODAY (UTC):', new Date().toISOString().split('T')[0]);

    const parsed = rows
      .filter((row) => row && row.length >= 3)
      .map((row, index) => {
        let brand = (row[COLUMN_MAP.BRAND] || "").toUpperCase().trim();
        let status = (row[COLUMN_MAP.STATUS] || "").toUpperCase().trim();
        
        const isBrandActuallyStatus = ['CONFIRMED', 'CANCELED', 'CANCELLED'].includes(brand);
        const isStatusActuallyBrand = ['UNITED', 'MOVIS', 'DRIVO'].includes(status);
        
        if (isBrandActuallyStatus && isStatusActuallyBrand) {
          console.log(`🔄 Row ${index}: Swapped columns detected! ${brand}<->${status}`);
          [brand, status] = [status, brand];
        }
        
        const receivedAt = parseDate(row[COLUMN_MAP.RECEIVED_AT]);
        const isTodayFlag = isToday(receivedAt);
        
        if (index < 5) {
          console.log(`Row ${index}: brand=${brand}, status=${status}, date=${row[COLUMN_MAP.RECEIVED_AT]}, isToday=${isTodayFlag}`);
        }
        
        return {
          id: `row-${index}`,
          reservationNumber: row[COLUMN_MAP.RESERVATION_NUMBER] || "",
          status: status,
          brand: brand,
          country: row[COLUMN_MAP.COUNTRY] || "",
          receivedAtDate: receivedAt,
          isToday: isTodayFlag,
        };
      });
    
    const todayBookings = parsed.filter(r => r.isToday);
    console.log('═══════════════════════════════════════');
    console.log('TODAY BOOKINGS:', todayBookings.length);
    todayBookings.slice(0, 10).forEach((r, i) => {
      console.log(`  ${i+1}. ${r.brand} | ${r.status} | ${r.reservationNumber}`);
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
 const todayBrandConfirmed = todayBrand.filter((r) => r.status === 'CONFIRMED');
brandStats[brand] = {
  brand,
  totalBookings: allBrand.length,        // ALL reservations for this brand
  todayBookings: todayBrandConfirmed.length  // CONFIRMED only today
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
const todayConfirmed = todayBookings.filter(r => r.status === 'CONFIRMED');
  return {
        meta: {
      updatedAt: new Date().toISOString(),
      totalReservations: reservations.length,
      totalConfirmedReservations: reservations.filter(r => r.status === 'CONFIRMED').length,
    },
  todayStats: {
    totalBookings: todayConfirmed.length,  // ← CONFIRMED seulement
    dailyGoal,
    dailyProgress: Math.min((todayConfirmed.length / dailyGoal) * 100, 100),
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