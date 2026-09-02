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

function normalizeBrand(raw) {
  const brand = (raw || "").toUpperCase().trim();
  if (brand.includes("UNITED")) return "UNITED";
  if (brand === "MOVIS") return "MOVIS";
  if (brand === "DRIVO") return "DRIVO";
  return brand;
}

function isConfirmed(status) {
  return (status || "").toUpperCase().trim() === "CONFIRMED";
}

function parseDate(raw) {
  if (!raw) return null;

  const str = String(raw).trim();

  if (str.match(/^\d{4}-\d{2}-\d{2}/)) {
    const d = new Date(str.replace(" ", "T"));
    if (!isNaN(d.getTime())) return d;
  }

  let m = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})[ T](\d{1,2}):(\d{2}):(\d{2})$/);
  if (m) {
    const [, day, month, year, hour, minute, second] = m;
    const d = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hour.padStart(2, "0")}:${minute}:${second}`);
    if (!isNaN(d.getTime())) return d;
  }

  m = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})[ T](\d{1,2}):(\d{2})$/);
  if (m) {
    const [, day, month, year, hour, minute] = m;
    const d = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hour.padStart(2, "0")}:${minute}:00`);
    if (!isNaN(d.getTime())) return d;
  }

  m = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (m) {
    const [, day, month, year] = m;
    const d = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00`);
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

function isToday(date) {
  if (!date || isNaN(date.getTime())) return false;

  const dateStr = date.toLocaleDateString("sv-SE");
  const todayStr = new Date().toLocaleDateString("sv-SE");

  return dateStr === todayStr;
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
    console.log(`Fetched ${rows.length} rows from sheet`);

    return rows
      .filter((row) => row && row.length >= 3)
      .map((row, index) => {
        let brand = (row[COLUMN_MAP.BRAND] || "").toUpperCase().trim();
        let status = (row[COLUMN_MAP.STATUS] || "").toUpperCase().trim();

        const isBrandActuallyStatus = ["CONFIRMED", "CANCELED", "CANCELLED"].includes(brand);
        const isStatusActuallyBrand = ["UNITED", "MOVIS", "DRIVO"].includes(status);
        if (isBrandActuallyStatus && isStatusActuallyBrand) {
          [brand, status] = [status, brand];
        }

        const receivedAt = parseDate(row[COLUMN_MAP.RECEIVED_AT]);

        return {
          id: `row-${index}`,
          reservationNumber: row[COLUMN_MAP.RESERVATION_NUMBER] || "",
          status,
          brand: normalizeBrand(brand),
          country: row[COLUMN_MAP.COUNTRY] || "",
          receivedAtDate: receivedAt,
          isToday: isToday(receivedAt),
        };
      });
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error.message);
    throw error;
  }
}

function buildDashboardData(reservations) {
  const BRANDS = ["UNITED", "MOVIS", "DRIVO"];
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const confirmed = reservations.filter((r) => isConfirmed(r.status));
  const todayBookings = reservations.filter((r) => r.isToday);
  const todayConfirmed = todayBookings.filter((r) => isConfirmed(r.status));

  const thisMonthConfirmed = confirmed.filter((r) => {
    if (!r.receivedAtDate) return false;
    return (
      r.receivedAtDate.getFullYear() === currentYear &&
      r.receivedAtDate.getMonth() === currentMonth
    );
  });

  const brandStats = {};
  BRANDS.forEach((brand) => {
    const allBrandConfirmed = confirmed.filter((r) => r.brand === brand);
    const todayBrandConfirmed = todayConfirmed.filter((r) => r.brand === brand);

    brandStats[brand] = {
      brand,
      totalBookings: allBrandConfirmed.length,
      todayBookings: todayBrandConfirmed.length,
      yesterdayBookings: 0,
    };
  });

  const countryMap = {};
  confirmed.forEach((r) => {
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

  const todayCountryMap = {};
  todayConfirmed.forEach((r) => {
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

  const latestReservations = [...reservations]
    .sort((a, b) => {
      const da = a.receivedAtDate ? a.receivedAtDate.getTime() : 0;
      const db = b.receivedAtDate ? b.receivedAtDate.getTime() : 0;
      return db - da;
    })
    .slice(0, 30);

  const leaderboard = BRANDS.map((brand) => brandStats[brand])
    .sort((a, b) => b.todayBookings - a.todayBookings);

  const dailyGoal = parseInt(process.env.DAILY_GOAL) || 200;
  const dailyProgress = Math.min((todayConfirmed.length / dailyGoal) * 100, 100);

  const hourlyMap = {};
  todayConfirmed.forEach((r) => {
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
      updatedAt: now.toISOString(),
      totalReservations: reservations.length,
      totalConfirmedReservations: confirmed.length,
      totalThisMonth: thisMonthConfirmed.length,
    },
    todayStats: {
      totalBookings: todayConfirmed.length,
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
