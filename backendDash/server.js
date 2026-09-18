const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

// ═══════════════════════════════════════════════════════════
// FIXED: Load sheets.js normally — no cache hacking
// ═══════════════════════════════════════════════════════════
const { fetchSheetData, buildDashboardData } = require("./sheets");
console.log("📄 sheets.js loaded successfully");

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

    // FIXED: Use the normally-required module — no cache clearing
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
    console.error("Stack:", err.stack);  // FIXED: Log full stack for debugging
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
    // FIXED: Use fresh fetch, not cache-hacked require
    const reservations = await fetchSheetData();
    const dashboard = buildDashboardData(reservations);

    console.log("🌐 API /api/dashboard — brandStats:", JSON.stringify(dashboard.brandStats));
    res.json(dashboard);
  } catch (err) {
    console.error("API error:", err.message);
    console.error("Stack:", err.stack);  // FIXED: Log full stack
    res.status(500).json({ error: err.message });
  }
});

// ── Socket.IO ───────────────────────────────────────────
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Send cached data to new client
  if (cachedData) {
    socket.emit("dashboard_update", cachedData);
  } else {
    // Force immediate refresh for new clients
    console.log("No cache yet, refreshing for new client...");
    updateDashboard();
  }

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
});