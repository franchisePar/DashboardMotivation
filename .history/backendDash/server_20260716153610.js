const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");
const fs = require("fs");
const path = require("path");

// ═══════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;

const BRANDS = ["UNITED", "MOVIS", "DRIVO"];
const DAILY_GOAL = 300;

// ═══════════════════════════════════════════════════════════
// GOOGLE AUTH — try multiple key formats
// ═══════════════════════════════════════════════════════════
function getPrivateKey() {
  if (!PRIVATE_KEY) {
    throw new Error("GOOGLE_PRIVATE_KEY is not set");
  }

  // Try different formats
  const formats = [
    PRIVATE_KEY,                                    // As-is
    PRIVATE_KEY.replace(/\\n/g, "\n"),           // Double-escaped
    PRIVATE_KEY.replace(/\n/g, "\n"),             // Escaped newlines
    PRIVATE_KEY.split("\n").join("\n"),           // Array join
  ];

  for (const key of formats) {
    try {
      // Quick validation
      if (key.includes("BEGIN PRIVATE KEY") && key.includes("END PRIVATE KEY")) {
        return key;
      }
    } catch (e) {}
  }

  // Last resort: read from file
  const keyPath = path.join(__dirname, "service-account-key.json");
  if (fs.existsSync(keyPath)) {
    const content = fs.readFileSync(keyPath, "utf8");
    const json = JSON.parse(content);
    return json.private_key || json.key;
  }

  throw new Error("Could not parse GOOGLE_PRIVATE_KEY");
}

// ═══════════════════════════════════════════════════════════
// GOOGLE SHEETS FETCH
// ═══════════════════════════════════════════════════════════
async function fetchSheetData() {
  const key = getPrivateKey();

  const serviceAccountAuth = new JWT({
    email: CLIENT_EMAIL,
    key: key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const doc = new GoogleSpreadsheet(SHEET_ID, serviceAccountAuth);
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex[0];
  const rows = await sheet.getRows();

  console.log(`Fetched ${rows.length} rows from sheet`);

  const reservations = rows.map((row, idx) => {
    const rawStatus = (row.get("Status") || "").toString().trim();
    const status = rawStatus.toUpperCase() === "CANCELLED" ? "CANCELED" : rawStatus.toUpperCase();

    return {
      id: row.get("Reservation Number") || `row-${idx}`,
      brand: (row.get("Brand") || "UNITED").toString().toUpperCase().trim(),
      status: status,
      country: (row.get("Country") || "").toString().toUpperCase().trim(),
      reservationDate: row.get("Reservation Date") || null,
      receivedAt: row.get("Received At") || row.get("Date") || null,
      raw: row.toObject(),
    };
  });

  return reservations;
}

// ═══════════════════════════════════════════════════════════
// DATE PARSING — LOCAL TIME
// ═══════════════════════════════════════════════════════════
function parseDate(dateStr) {
  if (!dateStr) return null;

  // Try ISO format: 2026-07-16 10:30:00
  let d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d;

  // Try DD/MM/YYYY HH:MM
  const ddmm = dateStr.match(/(\d{2})[\/\-\.](\d{2})[\/\-\.](\d{4})\s+(\d{2}):?(\d{2})?/);
  if (ddmm) {
    const iso = `${ddmm[3]}-${ddmm[2]}-${ddmm[1]}T${ddmm[4]}:${ddmm[5] || "00"}:00`;
    d = new Date(iso);
    if (!isNaN(d.getTime())) return d;
  }

  // Try MM/DD/YYYY
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

// ═══════════════════════════════════════════════════════════
// BUILD DASHBOARD DATA — INLINE, NO EXTERNAL DEPENDENCY
// ═══════════════════════════════════════════════════════════
function buildDashboardData(reservations) {
  console.log("\n═══════════════════════════════════════");
  console.log("BUILDING DASHBOARD — INLINE VERSION");
  console.log("Total reservations:", reservations.length);

  // Parse dates
  const parsed = reservations.map(r => {
    const d = parseDate(r.receivedAt);
    return { ...r, receivedAtDate: d };
  });

  // ── TODAY CONFIRMED ──
  const todayBookings = parsed.filter(r => isToday(r.receivedAtDate));
  const todayConfirmed = todayBookings.filter(r => r.status === "CONFIRMED");
  console.log("Today all:", todayBookings.length, "| Confirmed:", todayConfirmed.length);

  // ── YESTERDAY CONFIRMED ──
  const yesterdayConfirmed = parsed.filter(r => 
    isYesterday(r.receivedAtDate) && r.status === "CONFIRMED"
  );

  // ── THIS MONTH CONFIRMED ──
  const thisMonthConfirmed = parsed.filter(r => 
    isThisMonth(r.receivedAtDate) && r.status === "CONFIRMED"
  );

  // ── BRAND STATS (confirmed only) ──
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

  // ── TODAY COUNTRIES (confirmed only) ──
  const todayCountryMap = {};
  todayConfirmed.forEach(r => {
    const c = r.country || "UNKNOWN";
    todayCountryMap[c] = (todayCountryMap[c] || 0) + 1;
  });
  const todayCountryStats = Object.entries(todayCountryMap)
    .map(([country, bookings]) => ({ country, bookings }))
    .sort((a, b) => b.bookings - a.bookings);
  console.log("todayCountryStats:", JSON.stringify(todayCountryStats.slice(0, 5)));

  // ── ALL-TIME COUNTRIES (for map) ──
  const allCountryMap = {};
  parsed.forEach(r => {
    const c = r.country || "UNKNOWN";
    allCountryMap[c] = (allCountryMap[c] || 0) + 1;
  });
  const countryStats = Object.entries(allCountryMap)
    .map(([country, bookings]) => ({ country, bookings }))
    .sort((a, b) => b.bookings - a.bookings);

  // ── HOURLY DATA (confirmed today) ──
  const hourlyData = Array.from({ length: 24 }, (_, hour) => {
    const bookings = todayConfirmed.filter(r => {
      if (!r.receivedAtDate) return false;
      return r.receivedAtDate.getHours() === hour;
    }).length;
    return { hour, bookings };
  });

  // ── LATEST RESERVATIONS (all statuses for feed) ──
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

  // ── LEADERBOARD ──
  const leaderboard = BRANDS.map(brand => ({
    brand,
    ...brandStats[brand],
  })).sort((a, b) => b.todayBookings - a.todayBookings);

  // ── META ──
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

// ═══════════════════════════════════════════════════════════
// EXPRESS + SOCKET.IO
// ═══════════════════════════════════════════════════════════
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(cors());
app.use(express.json());

let cachedData = null;
let lastRowCount = 0;
let isFetching = false;

async function updateDashboard() {
  if (isFetching) return;
  isFetching = true;

  try {
    io.emit("loading");
    const reservations = await fetchSheetData();
    const dashboard = buildDashboardData(reservations);

    const currentRowCount = reservations.length;
    if (lastRowCount > 0 && currentRowCount > lastRowCount) {
      const newCount = currentRowCount - lastRowCount;
      const newBookings = reservations.slice(-newCount);
      newBookings.forEach((booking) => {
        io.emit("new_booking", { booking, timestamp: new Date().toISOString() });
      });
    }
    lastRowCount = currentRowCount;

    cachedData = dashboard;
    io.emit("dashboard_update", dashboard);
    console.log(`[${new Date().toLocaleTimeString()}] Updated — ${reservations.length} rows, ${dashboard.todayStats.totalBookings} today`);
  } catch (err) {
    console.error("Update failed:", err.message);
    io.emit("error", { message: err.message });
  } finally {
    isFetching = false;
  }
}

// ── Routes ──────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", clients: io.engine.clientsCount });
});

app.get("/api/dashboard", async (req, res) => {
  try {
    const reservations = await fetchSheetData();
    const dashboard = buildDashboardData(reservations);
    res.json(dashboard);
  } catch (err) {
    console.error("API error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Socket.IO ───────────────────────────────────────────
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  if (cachedData) {
    socket.emit("dashboard_update", cachedData);
  }

  socket.on("request_refresh", async () => {
    console.log("Refresh by", socket.id);
    await updateDashboard();
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// ── Polling ─────────────────────────────────────────────
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL) || 30000;
setInterval(updateDashboard, POLL_INTERVAL);
updateDashboard();

// ── Start ───────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server on port ${PORT}`);
  console.log(`📊 Polling every ${POLL_INTERVAL / 1000}s`);
});