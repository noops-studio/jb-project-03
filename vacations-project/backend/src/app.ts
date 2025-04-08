// src/app.ts
import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { testDatabaseConnection } from './config/database';
import { initializeDatabase } from './models';
import authRoutes from './routes/authRoutes';
import vacationRoutes from './routes/vacationRoutes';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploaded images
const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(path.join(__dirname, '..', uploadDir)));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/vacations', vacationRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Vacations API' });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testDatabaseConnection();
    
    // Initialize database
    await initializeDatabase();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;