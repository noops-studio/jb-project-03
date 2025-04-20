
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database';

// Import routes
import authRoutes from './routes/auth.routes';
import vacationRoutes from './routes/vacation.routes';
import followRoutes from './routes/follow.routes';
import reportRoutes from './routes/report.routes';

// Initialize dotenv
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vacations', vacationRoutes);
app.use('/api/vacations', followRoutes);
app.use('/api/reports', reportRoutes);

// Basic route for testing
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to Vacation System API' });
});

// Handle 404 - Route not found
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  try {
    // Test database connection on startup
    await testConnection();
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.error('Server startup failed:', error);
  }
});

export default app;
