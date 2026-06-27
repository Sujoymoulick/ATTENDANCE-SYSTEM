import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { globalLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/error";

// Import Routes
import authRoutes from "./routes/auth";
import userRoutes from "./routes/users";
import subjectRoutes from "./routes/subjects";
import attendanceRoutes from "./routes/attendance";

const app = express();

// Security Headers
app.use(helmet());

// CORS Configuration
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
const allowedOrigins = [
  CLIENT_URL,
  CLIENT_URL.replace(/\/$/, ""),
  "https://attendance-system-frontend-cyan.vercel.app",
  "https://attendance-system-frontend-cyan.vercel.app/",
  "http://localhost:3000",
  "http://localhost:3000/"
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Compression & Body Parsers
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Request logging in development
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Global Rate Limiting
app.use(globalLimiter);

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API Routes (v1)
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/subjects", subjectRoutes);
app.use("/api/v1/attendance", attendanceRoutes);

// Centralized Error Handling
app.use(errorHandler);

export default app;
