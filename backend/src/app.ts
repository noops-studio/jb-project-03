import express from 'express';
import cors from 'cors';
import config from 'config';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';

// Initialize express app
const app = express();

// Apply middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply routes
app.use('/api', routes);

// Apply error handler
app.use(errorHandler);

export default app;
