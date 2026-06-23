const { google } = require("googleapis");
require("dotenv").config();

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

const COLUMN_MAP = {
  RECEIVED_AT: 0,
  BRAND: 1,
  RESERVATION_NUMBER: 2,
  STATUS: 3,
  CUSTOMER_NAME: 4,
  PHONE: 5,
  PICKUP_LOCATION: 6,
  PICKUP_DATE: 7,
  RETURN_LOCATION: 8,
  RETURN_DATE: 9,
  VEHICLE: 10,
  DURATION: 11,
  AMOUNT: 12,
  COUNTRY: 13,
};

function getAuthClient() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY
    ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : "";

  const auth = new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    null,
    privateKey,
    SCOPES
  );
  return auth;
}

function parseAmount(raw) {
  if (!raw) return 0;
  const cleaned = String(raw).replace(/[^0-9.,-]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

function parseDate(raw) {
  if (!raw) return null;
  // Handle various date formats
  const dateStr = String(raw).trim();
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed;
  // Try DD/MM/YYYY
  const parts = dateStr.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
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

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "A2:N10000", // Skip header row
    });

    const rows = response.data.values || [];

    const reservations = rows
      .filter((row) => row && row.length > 2)
      .map((row, index) => ({
        id: `row-${index}`,
        receivedAt: row[COLUMN_MAP.RECEIVED_AT] || "",
        brand: (row[COLUMN_MAP.BRAND] || "").toUpperCase(),
        reservationNumber: row[COLUMN_MAP.RESERVATION_NUMBER] || "",
        status: row[COLUMN_MAP.STATUS] || "",
        customerName: row[COLUMN_MAP.CUSTOMER_NAME] || "",
        phone: row[COLUMN_MAP.PHONE] || "",
        pickupLocation: row[COLUMN_MAP.PICKUP_LOCATION] || "",
        pickupDate: row[COLUMN_MAP.PICKUP_DATE] || "",
        returnLocation: row[COLUMN_MAP.RETURN_LOCATION] || "",
        returnDate: row[COLUMN_MAP.RETURN_DATE] || "",
        vehicle: row[COLUMN_MAP.VEHICLE] || "",
        duration: row[COLUMN_MAP.DURATION] || "",
        amount: parseAmount(row[COLUMN_MAP.AMOUNT]),
        country: row[COLUMN_MAP.COUNTRY] || "",
        receivedAtDate: parseDate(row[COLUMN_MAP.RECEIVED_AT]),
      }));

    return reservations;
  } catch (error) {
    console.error("Error fetching sheet data:", error.message);
    throw error;
  }
}

function buildDashboardData(reservations) {
  const BRANDS = ["UNITED", "MOVIS", "DRIVO"];
  const today = new Date();

  // Today's bookings
  const todayBookings = reservations.filter((r) =>
    isToday(r.receivedAtDate)
  );

  // Bookings by brand (all time + today)
  const brandStats = {};
  BRANDS.forEach((brand) => {
    const all = reservations.filter((r) => r.brand === brand);
    const todayBrand = todayBookings.filter((r) => r.brand === brand);
    brandStats[brand] = {
      brand,
      totalBookings: all.length,
      todayBookings: todayBrand.length,
      totalRevenue: all.reduce((s, r) => s + r.amount, 0),
      todayRevenue: todayBrand.reduce((s, r) => s + r.amount, 0),
    };
  });

  // Country statistics
  const countryMap = {};
  reservations.forEach((r) => {
    if (!r.country) return;
    if (!countryMap[r.country]) {
      countryMap[r.country] = { country: r.country, bookings: 0, revenue: 0 };
    }
    countryMap[r.country].bookings++;
    countryMap[r.country].revenue += r.amount;
  });
  const countryStats = Object.values(countryMap)
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 10);

  // Latest reservations (last 20)
  const latestReservations = [...reservations]
    .sort((a, b) => {
      const da = a.receivedAtDate ? a.receivedAtDate.getTime() : 0;
      const db = b.receivedAtDate ? b.receivedAtDate.getTime() : 0;
      return db - da;
    })
    .slice(0, 20);

  // Daily goal
  const dailyGoal = parseInt(process.env.DAILY_GOAL) || 50;
  const dailyProgress = Math.min((todayBookings.length / dailyGoal) * 100, 100);

  // Brand leaderboard by today revenue
  const leaderboard = BRANDS.map((brand) => brandStats[brand]).sort(
    (a, b) => b.todayRevenue - a.todayRevenue
  );

  // Hourly breakdown for today
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
      totalRevenue: todayBookings.reduce((s, r) => s + r.amount, 0),
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
