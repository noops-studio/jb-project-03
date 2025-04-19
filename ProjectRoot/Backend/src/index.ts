import express from "express";
import cors from "cors";
import { sequelize } from "./config/db";
import authRoutes from "./routes/auth.routes";
import vacationRoutes from "./routes/vacation.routes";
import { authMiddleware } from "./middlewares/auth.middleware";
import { checkAndCreateBucket } from "./utils/s3";

// Initialize Express app
const app = express();

// Middleware: CORS (allow all origins for development; adjust in production as needed)
app.use(cors());
// Middleware: JSON request body parsing
app.use(express.json());

// now we will do console log for all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} requast status ${res.statusCode}`);
  next();
});

// Serve images from the uploads folder
app.use("/uploads", express.static("uploads"));

// Routes:
app.use("/api/auth", authRoutes);
// Protect all vacation routes with auth middleware
app.use("/api/vacations", authMiddleware, vacationRoutes);

// Health check (optional)
app.get("/api/health", (_req, res) => res.send("OK"));

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await checkAndCreateBucket();
    // Connect to the database
    await sequelize.authenticate();
    console.log("Database connected.");
  } catch (err) {
    console.error("Database connection failed:", err);
  }
  console.log(`Server is running on port ${PORT}`);
});
