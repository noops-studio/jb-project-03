import express from "express";
import cors from "cors";
import { sequelize } from "./config/db";
import authRoutes from "./routes/auth.routes";
import vacationRoutes from "./routes/vacation.routes";
import { authMiddleware } from "./middlewares/auth.middleware";
import { checkAndCreateBucket } from "./utils/s3";
import { syncUploadsToS3 } from "./utils/syncUploads";

// Set default fallback option - will be changed if S3 connection fails
global.useLocalImages = false;

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
// Vacation routes - note: authentication is handled in the route definitions
// so that image endpoints can be public while others require auth
app.use("/api/vacations", vacationRoutes);

// Health check with detailed configuration info
app.get("/api/health", (_req, res) => {
  const config = {
    status: "OK",
    db: {
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'vacation_db',
      user: process.env.DB_USER || 'root'
    },
    s3: {
      endpoint: process.env.S3_ENDPOINT || 'http://localhost:4566',
      publicEndpoint: process.env.S3_PUBLIC_ENDPOINT || 'http://localhost:4566',
      bucket: process.env.S3_BUCKET || 'vacations',
      useLocalImages: global.useLocalImages || false
    },
    env: process.env.NODE_ENV || 'development'
  };
  
  return res.json(config);
});

// Start the server
const PORT = process.env.PORT || 3000;
// Function to retry database connection
const connectWithRetry = async (retries = 5, delay = 5000) => {
  let currentTry = 0;
  
  while (currentTry < retries) {
    try {
      console.log(`Attempting to connect to database (attempt ${currentTry + 1}/${retries})`);
      await sequelize.authenticate();
      console.log("Database connected successfully.");
      return true;
    } catch (err: any) {
      currentTry++;
      console.error(`Database connection error (attempt ${currentTry}/${retries}):`, err.message);
      
      if (currentTry >= retries) {
        console.error("Max retries reached. Unable to connect to database.");
        return false;
      }
      
      console.log(`Retrying in ${delay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return false;
};

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  
  try {
    // Initialize S3 bucket first
    await checkAndCreateBucket();
    console.log("S3 bucket initialized.");
    
    // Connect to the database with retry
    const dbConnected = await connectWithRetry();
    
    if (dbConnected) {
      // Sync uploads folder to S3
      console.log("Starting upload folder sync with S3...");
      await syncUploadsToS3();
      console.log("Uploads folder sync completed.");
    } else {
      console.warn("Server running with limited functionality (database unavailable)");
    }
  } catch (err: any) {
    console.error("Startup error:", err.message);
    // Continue running server even with errors for resilience
  }
});
