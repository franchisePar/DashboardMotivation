const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const path = require("path");
const fs = require("fs");

// ═══════════════════════════════════════════════════════════
// CRITICAL: Log exactly which sheets.js we're loading
// ═══════════════════════════════════════════════════════════
const sheetsPath = require.resolve("./sheets");
console.log("═══════════════════════════════════════");
console.log("📄 sheets.js path:", sheetsPath);
console.log("📄 File exists:", fs.existsSync(sheetsPath));
console.log("📄 File size:", fs.statSync(sheetsPath).size, "bytes");
console.log("📄 File modified:", fs.statSync(sheetsPath).mtime);

// Read first 500 chars to verify it's the right file
const content = fs.readFileSync(sheetsPath, "utf8").slice(0, 500);
console.log("📄 File starts with:", content.split("\n")[0]);
console.log("📄 Has 'todayCountryStats':", content.includes("todayCountryStats"));
console.log("📄 Has 'totalThisMonth':", content.includes("totalThisMonth"));
console.log("═══════════════════════════════════════");

const { fetchSheetData, buildDashboardData } = require("./sheets");

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

    // DEBUG: Log what buildDashboardData actually returned
    console.log("\n🔴🔴🔴 BUILD RESULT 🔴🔴🔴");
    console.log("todayStats:", JSON.stringify(dashboard.todayStats));
    console.log("brandStats keys:", Object.keys(dashboard.brandStats || {}));
    console.log("brandStats.UNITED:", JSON.stringify(dashboard.brandStats?.UNITED));
    console.log("has todayCountryStats:", !!dashboard.todayCountryStats);
    console.log("todayCountryStats count:", dashboard.todayCountryStats?.length);
    console.log("meta:", JSON.stringify(dashboard.meta));
    console.log("🔴🔴🔴 END BUILD 🔴🔴🔴\n");

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
    console.log(`[${new Date().toLocaleTimeString()}] Updated — ${reservations.length} rows, ${dashboard.todayStats?.totalBookings} today`);
  } catch (err) {
    console.error("Update failed:", err.message);
    io.emit("error", { message: err.message });
  } finally {
    isFetching = false;
  }
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", clients: io.engine.clientsCount });
});

app.get("/api/dashboard", async (req, res) => {
  try {
    const reservations = await fetchSheetData();
    const dashboard = buildDashboardData(reservations);
    res.json(dashboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  if (cachedData && cachedData.todayCountryStats && cachedData.todayCountryStats.length > 0) {
    socket.emit("dashboard_update", cachedData);
  }

  socket.on("request_refresh", async () => {
    await updateDashboard();
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL) || 30000;
setInterval(updateDashboard, POLL_INTERVAL);
updateDashboard();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server on port ${PORT}`);
});