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

function parseDate(raw) {
  if (!raw) return null;
  const parsed = new Date(String(raw).trim());
  return !isNaN(parsed.getTime()) ? parsed : null;
}

function isToday(date) {
  if (!date) return false;
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

async function fetchSheetData() {
  try {
    const auth = getAuthClient();
    const sheets = google.sheets({ version: "v4", auth });

    // Fetches the streamlined data columns
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "A2:E10000", // Grabs exactly your 5 data columns, skipping headers
    });

    const rows = response.data.values || [];

    return rows
      .filter((row) => row && row.length >= 3)
      .map((row, index) => ({
        id: `row-${index}`,
        reservationNumber: row[COLUMN_MAP.RESERVATION_NUMBER] || "",
        status: row[COLUMN_MAP.STATUS] || "",
        brand: (row[COLUMN_MAP.BRAND] || "").toUpperCase().trim(),
        country: row[COLUMN_MAP.COUNTRY] || "",
        receivedAtDate: parseDate(row[COLUMN_MAP.RECEIVED_AT]),
      }));
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error.message);
    throw error;
  }
}

function buildDashboardData(reservations) {
  const BRANDS = ["UNITED", "MOVIS", "DRIVO"];
  const today = new Date();

  // Filter out bookings arrived today
  const todayBookings = reservations.filter((r) => isToday(r.receivedAtDate));

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

  // Country ranking leaderboard by Volume
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
    latestReservations,
    leaderboard,
    hourlyData,
  };
}

module.exports = { fetchSheetData, buildDashboardData };