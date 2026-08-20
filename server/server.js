import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth/index.js";
import notificationRoutes from "./routes/notifications.js";
import updateProfileRoutes from "./routes/updateProfile.js";
import orderRoutes from "./routes/orders.js";
import productRoutes from "./routes/products.js";
import adminRoutes from "./routes/admin.js";
import { startOrderStatusSync } from "./services/orderSync.js";

// ─── Express Setup ───────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite dev server
      "http://localhost:3000",
      "https://asemstore99.firebaseapp.com",
      "https://asemstore99.web.app",
      "https://e-commerce-store-1-dgoc.onrender.com", // production frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Rate limiting — prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

// Stricter rate limit for order placement
const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: "Too many orders, please wait a moment." },
});

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── Mount Routes ────────────────────────────────────────────────────────────
app.use("/api", authRoutes);
app.use("/api", notificationRoutes);
app.use("/api", updateProfileRoutes);
app.use("/api", orderLimiter, orderRoutes);
app.use("/api", productRoutes);
app.use("/api", adminRoutes);

// ─── Background Sync ─────────────────────────────────────────────────────────
startOrderStatusSync();

// ─── Start Server ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🔒 Asem Store — Secure Server                         ║
║   Running on port ${PORT}                                  ║
║                                                          ║
║   Routes:                                                ║
║     POST /api/check-signup     (auth)                   ║
║     POST /api/complete-signup  (auth)                   ║
║     POST /api/complete-google-signin (auth)              ║
║     POST /api/report-verify-failed  (auth)              ║
║     POST /api/notifications    (notifications)            ║
║     POST /api/update-profile   (profile)                  ║
║     POST /api/orders           (orders)                  ║
║     GET  /api/products         (products)                ║
║     GET  /api/products/:id     (products)                ║
║     GET  /api/health           (health)                  ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});
