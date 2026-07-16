const { google } = require("googleapis");

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

const BRANDS = ["UNITED", "MOVIS", "DRIVO"];
const DAILY_GOAL = 300;

async function fetchSheetData() {
  const auth = new google.auth.JWT(CLIENT_EMAIL, null, PRIVATE_KEY, [
    "https://www.googleapis.com/auth/spreadsheets.readonly",
  ]);

  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "Sheet1",
  });

  const rows = res.data.values || [];
  const headers = rows[0] || [];
  const data = rows.slice(1);

  console.log(`Fetched ${data.length} rows from sheet`);

  const reservations = data.map((row, idx) => {
    const get = (col) => {
      const i = headers.indexOf(col);
      return i >= 0 ? row[i] || "" : "";
    };

    const rawStatus = get("Status").toString().trim();
    const status = rawStatus.toUpperCase() === "CANCELLED" ? "CANCELED" : rawStatus.toUpperCase();

    return {
      id: get("Reservation Number") || `row-${idx}`,
      brand: (get("Brand") || "UNITED").toString().toUpperCase().trim(),
      status: status,
      country: get("Country").toString().toUpperCase().trim(),
      reservationDate: get("Reservation Date") || null,
      receivedAt: get("Received At") || get("Date") || null,
    };
  });

  return reservations;
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;
  const ddmm = dateStr.match(/(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{4})\s+(\d{2}):?(\d{2})?/);
  if (ddmm) {
    const iso = `${ddmm[3]}-${ddmm[2]}-${ddmm[1]}T${ddmm[4]}:${ddmm[5] || "00"}:00`;
    d = new Date(iso);
    if (!isNaN(d.getTime())) return d;
  }
  const mmdd = dateStr.match(/(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{4})/);
  if (mmdd) {
    const iso = `${mmdd[3]}-${mmdd[1]}-${mmdd[2]}T00:00:00`;
    d = new Date(iso);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

function isToday(date) {
  if (!date) return false;
  const now = new Date();
  return date.getDate() === now.getDate() &&
         date.getMonth() === now.getMonth() &&
         date.getFullYear() === now.getFullYear();
}

function isYesterday(date) {
  if (!date) return false;
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return date.getDate() === yesterday.getDate() &&
         date.getMonth() === yesterday.getMonth() &&
         date.getFullYear() === yesterday.getFullYear();
}

function isThisMonth(date) {
  if (!date) return false;
  const now = new Date();
  return date.getMonth() === now.getMonth() &&
         date.getFullYear() === now.getFullYear();
}

function buildDashboardData(reservations) {
  console.log("\n═══════════════════════════════════════");
  console.log("BUILDING DASHBOARD");
  console.log("Total reservations:", reservations.length);

  const parsed = reservations.map(r => {
    const d = parseDate(r.receivedAt);
    return { ...r, receivedAtDate: d };
  });

  const todayBookings = parsed.filter(r => isToday(r.receivedAtDate));
  console.log("Today bookings (all):", todayBookings.length);

  const todayConfirmed = todayBookings.filter(r => r.status === "CONFIRMED");
  console.log("Today confirmed:", todayConfirmed.length);

  const yesterdayConfirmed = parsed.filter(r =>
    isYesterday(r.receivedAtDate) && r.status === "CONFIRMED"
  );

  const thisMonthConfirmed = parsed.filter(r =>
    isThisMonth(r.receivedAtDate) && r.status === "CONFIRMED"
  );

  const brandStats = {};
  BRANDS.forEach(brand => {
    const brandAll = parsed.filter(r => r.brand === brand);
    const brandToday = todayConfirmed.filter(r => r.brand === brand);
    const brandYesterday = yesterdayConfirmed.filter(r => r.brand === brand);

    brandStats[brand] = {
      brand,
      totalBookings: brandAll.filter(r => r.status === "CONFIRMED").length,
      todayBookings: brandToday.length,
      yesterdayBookings: brandYesterday.length,
    };
  });
  console.log("Brand stats:", JSON.stringify(brandStats));

  const todayCountryMap = {};
  todayConfirmed.forEach(r => {
    const c = r.country || "UNKNOWN";
    todayCountryMap[c] = (todayCountryMap[c] || 0) + 1;
  });
  const todayCountryStats = Object.entries(todayCountryMap)
    .map(([country, bookings]) => ({ country, bookings }))
    .sort((a, b) => b.bookings - a.bookings);
  console.log("todayCountryStats count:", todayCountryStats.length);

  const allCountryMap = {};
  parsed.forEach(r => {
    const c = r.country || "UNKNOWN";
    allCountryMap[c] = (allCountryMap[c] || 0) + 1;
  });
  const countryStats = Object.entries(allCountryMap)
    .map(([country, bookings]) => ({ country, bookings }))
    .sort((a, b) => b.bookings - a.bookings);

  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const bookings = todayConfirmed.filter(r => {
      if (!r.receivedAtDate) return false;
      return r.receivedAtDate.getHours() === hour;
    }).length;
    return { hour, bookings };
  });
  console.log("hourlyData non-zero:", hourlyData.filter(h => h.bookings > 0).length);

  const latestReservations = parsed
    .sort((a, b) => {
      const da = a.receivedAtDate ? a.receivedAtDate.getTime() : 0;
      const db = b.receivedAtDate ? b.receivedAtDate.getTime() : 0;
      return db - da;
    })
    .slice(0, 20)
    .map(r => ({
      id: r.id,
      brand: r.brand,
      status: r.status,
      country: r.country,
      reservationDate: r.reservationDate,
      receivedAt: r.receivedAt,
    }));

  const leaderboard = BRANDS.map(brand => ({
    brand,
    ...brandStats[brand],
  })).sort((a, b) => b.todayBookings - a.todayBookings);

  const meta = {
    updatedAt: new Date().toISOString(),
    totalReservations: reservations.length,
    totalConfirmedReservations: parsed.filter(r => r.status === "CONFIRMED").length,
    totalThisMonth: thisMonthConfirmed.length,
  };
  console.log("meta:", JSON.stringify(meta));
  console.log("═══════════════════════════════════════\n");

  return {
    meta,
    todayStats: {
      totalBookings: todayConfirmed.length,
      dailyGoal: DAILY_GOAL,
      dailyProgress: todayConfirmed.length > 0 ? (todayConfirmed.length / DAILY_GOAL) * 100 : 0,
    },
    brandStats,
    todayCountryStats,
    countryStats,
    latestReservations,
    leaderboard,
    hourlyData,
  };
}

module.exports = { fetchSheetData, buildDashboardData };