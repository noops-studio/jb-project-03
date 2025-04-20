import express from 'express';
import { followVacation, unfollowVacation } from '../controllers/follow.controller';
import { authenticateUser } from '../middlewares/auth.middleware';

const router = express.Router();

// Routes for following/unfollowing vacations
router.post('/:id/follow', authenticateUser, followVacation);
router.post('/:id/unfollow', authenticateUser, unfollowVacation);

export default router;