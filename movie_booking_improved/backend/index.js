const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");

// Load env first
dotenv.config();

// Validate critical env vars
if (!process.env.JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET not set — using insecure fallback. Set JWT_SECRET in .env for production.");
}
if (!process.env.DB_URL) {
  console.error("FATAL: DB_URL is not set in .env");
  process.exit(1);
}

// Importing routes
const movieRoute = require("./routes/movie.routes");
const theaterRoute = require("./routes/theater.routes");
const userRoute = require("./routes/user.routes");
const showRoute = require("./routes/show.routes");
const bookingRoute = require("./routes/booking.routes");
const reviewRoute = require("./routes/review.routes");

const PORT = process.env.PORT || 8000;
const app = express();

// CORS — support comma-separated list of origins (or * to allow all) via env
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://127.0.0.1:5173"];

const allowAllOrigins = allowedOrigins.includes("*");

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowAllOrigins || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
movieRoute(app);
theaterRoute(app);
userRoute(app);
showRoute(app);
bookingRoute(app);
// Fix: reviewRoute uses express.Router — mount it properly
app.use("/mba/api/v1/reviews", reviewRoute);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, msg: "Route not found", err: "NOT_FOUND", data: {} });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, msg: "Internal server error", err: err.message, data: {} });
});

mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("DB connected!");
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
    process.exit(1);
  });
