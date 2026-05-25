require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const smsRoutes = require("./routes/sms.routes");
const ussdRoutes = require("./routes/ussd.routes");
const contactsRoutes = require("./routes/contacts.routes");
const callRoutes = require("./routes/call.routes");

const internetService = require("./services/internet.service");
const smsService = require("./services/sms.service");
const callService = require("./services/call.service");

const app = express();

app.use(cors());
app.use(express.json());

// 1. HTTP SERVER
const server = http.createServer(app);

// 2. SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// 3. SOCKET CONNECTION DEBUG
io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  socket.emit("server-message", "Modem backend connected 🚀");
});

// 4. EXPOSE IO
app.set("io", io);

// 5. ROUTES
app.use("/api/sms", smsRoutes);
app.use("/api/ussd", ussdRoutes);
app.use("/api/contacts", contactsRoutes);
app.use("/api/call", callRoutes);

// -----------------------------
// 🔥 SAFE STARTUP SEQUENCE
// -----------------------------

const startServices = async () => {
  console.log("⏳ Starting modem services...");

  try {
    // delay to ensure ModemManager is ready
    setTimeout(() => {
      
      console.log("📡 Starting SMS broadcast service...");
      smsService.broadcastSMSList(io);

      console.log("🌐 Starting modem monitoring...");
      internetService.watchModem(io);

      console.log("📞 Starting call watch service...");
      callService.watchCalls(io);

    }, 3000); // IMPORTANT delay

  } catch (err) {
    console.error("Service startup error:", err);
  }
};

startServices();

// 6. START SERVER LAST
const PORT = process.env.PORT || 3001;

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use. Please stop the process using it or set a different PORT.`);
    process.exit(1);
  }
  console.error("Server error:", err);
  process.exit(1);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});