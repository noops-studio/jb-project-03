import express from 'express';
import { getFollowersReport, downloadCSVReport } from '../controllers/report.controller';
import { authenticateUser, isAdmin } from '../middlewares/auth.middleware';

const router = express.Router();

// Routes for reports (admin only)
router.get('/followers', authenticateUser, isAdmin, getFollowersReport);
router.get('/followers/csv', authenticateUser, isAdmin, downloadCSVReport);

export default router;