
// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import vacationRoutes from './vacation.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Auth routes
router.use('/auth', authRoutes);

// Vacation routes
router.use('/vacations', vacationRoutes);

// Admin routes
router.use('/admin', adminRoutes);

export default router;