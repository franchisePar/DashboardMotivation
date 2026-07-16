const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const { fetchSheetData, buildDashboardData } = require("./sheets");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// ── State ───────────────────────────────────────────────
let cachedData = null;
let lastRowCount = 0;
let isFetching = false;

// ── Fetch & Broadcast ───────────────────────────────────
async function updateDashboard() {
  if (isFetching) return;
  isFetching = true;

  try {
    io.emit("loading");
    const reservations = await fetchSheetData();
    const dashboard = buildDashboardData(reservations);

    // ═══════════════════════════════════════════════════════
    // DEBUG: Log exactly what we're about to emit
    // ═══════════════════════════════════════════════════════
    console.log('\n🔴🔴🔴 EMITTING DASHBOARD_UPDATE 🔴🔴🔴');
    console.log('todayStats:', JSON.stringify(dashboard.todayStats));
    console.log('brandStats:', JSON.stringify(dashboard.brandStats));
    console.log('todayCountryStats count:', dashboard.todayCountryStats?.length);
    console.log('todayCountryStats:', JSON.stringify(dashboard.todayCountryStats));
    console.log('hourlyData non-zero:', dashboard.hourlyData?.filter(h => h.bookings > 0).length);
    console.log('meta:', JSON.stringify(dashboard.meta));
    console.log('latestReservations count:', dashboard.latestReservations?.length);
    console.log('🔴🔴🔴 END EMIT 🔴🔴🔴\n');

    // Detect new bookings
    const currentRowCount = reservations.length;
    if (lastRowCount > 0 && currentRowCount > lastRowCount) {
      const newCount = currentRowCount - lastRowCount;
      const newBookings = reservations.slice(-newCount);
      newBookings.forEach((booking) => {
        io.emit("new_booking", {
          booking,
          timestamp: new Date().toISOString(),
        });
      });
    }
    lastRowCount = currentRowCount;

    cachedData = dashboard;
    io.emit("dashboard_update", dashboard);
    console.log(`[${new Date().toLocaleTimeString()}] Dashboard updated — ${reservations.length} reservations, ${dashboard.todayStats.totalBookings} today`);
  } catch (err) {
    console.error("Update failed:", err.message);
    io.emit("error", { message: err.message });
  } finally {
    isFetching = false;
  }
}

// ── Routes ──────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", connectedClients: io.engine.clientsCount });
});

app.get("/api/dashboard", async (req, res) => {
  if (cachedData) return res.json(cachedData);
  try {
    const reservations = await fetchSheetData();
    const dashboard = buildDashboardData(reservations);
    cachedData = dashboard;
    res.json(dashboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Socket.IO ───────────────────────────────────────────
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Send cached data immediately if available
  if (cachedData) {
    // ═══════════════════════════════════════════════════════
    // DEBUG: Log what we send on initial connection
    // ═══════════════════════════════════════════════════════
    console.log('\n🟢🟢🟢 SENDING CACHED DATA TO NEW CLIENT 🟢🟢🟢');
    console.log('todayStats:', JSON.stringify(cachedData.todayStats));
    console.log('brandStats:', JSON.stringify(cachedData.brandStats));
    console.log('todayCountryStats:', JSON.stringify(cachedData.todayCountryStats));
    console.log('meta:', JSON.stringify(cachedData.meta));
    console.log('🟢🟢🟢 END 🟢🟢🟢\n');

    socket.emit("dashboard_update", cachedData);
  }

  socket.on("request_refresh", async () => {
    console.log("Manual refresh requested by", socket.id);
    await updateDashboard();
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// ── Polling ─────────────────────────────────────────────
const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL) || 30000;
setInterval(updateDashboard, POLL_INTERVAL);

// Initial fetch on startup
updateDashboard();

// ── Start ───────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Polling every ${POLL_INTERVAL / 1000}s`);
});