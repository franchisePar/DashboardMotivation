const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const path = require("path");

// ═══════════════════════════════════════════════════════════
// CRITICAL: Log which sheets.js file we're actually using
// ═══════════════════════════════════════════════════════════
const sheetsPath = require.resolve("./sheets");
console.log("📄 Loading sheets.js from:", sheetsPath);
console.log("📄 File exists:", require("fs").existsSync(sheetsPath));

// Clear require cache EVERY TIME to force reload
function clearSheetsCache() {
  const keys = Object.keys(require.cache);
  const sheetsKeys = keys.filter(k => k.includes("sheets"));
  sheetsKeys.forEach(k => {
    console.log("🗑️  Clearing cache:", k);
    delete require.cache[k];
  });
}

// ── State ───────────────────────────────────────────────
let cachedData = null;
let lastRowCount = 0;
let isFetching = false;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(cors());
app.use(express.json());

// ── Fetch & Broadcast ───────────────────────────────────
async function updateDashboard() {
  if (isFetching) return;
  isFetching = true;

  try {
    io.emit("loading");

    // FORCE RELOAD sheets.js every time
    clearSheetsCache();
    const { fetchSheetData, buildDashboardData } = require("./sheets");

    const reservations = await fetchSheetData();
    const dashboard = buildDashboardData(reservations);

    // DEBUG: Log exact emission
    console.log("\n🔴🔴🔴 EMITTING DASHBOARD_UPDATE 🔴🔴🔴");
    console.log("todayStats:", JSON.stringify(dashboard.todayStats));
    console.log("brandStats:", JSON.stringify(dashboard.brandStats));
    console.log("todayCountryStats:", JSON.stringify(dashboard.todayCountryStats));
    console.log("meta:", JSON.stringify(dashboard.meta));
    console.log("🔴🔴🔴 END EMIT 🔴🔴🔴\n");

    // Detect new bookings
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
    // FORCE FRESH BUILD — never use cache
    clearSheetsCache();
    const { fetchSheetData, buildDashboardData } = require("./sheets");

    const reservations = await fetchSheetData();
    const dashboard = buildDashboardData(reservations);

    console.log("🌐 API /api/dashboard — brandStats:", JSON.stringify(dashboard.brandStats));
    res.json(dashboard);
  } catch (err) {
    console.error("API error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ── Socket.IO ───────────────────────────────────────────
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // NEVER send cached data — always build fresh
  // (Remove the cachedData send to force fresh data)

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

// Initial fetch
updateDashboard();

// ── Start ───────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server on port ${PORT}`);
  console.log(`📊 Polling every ${POLL_INTERVAL / 1000}s`);
  console.log(`⚠️  Cache CLEARED on every request — using fresh sheets.js`);
});