
import { Router } from 'express';
import { VacationController } from '../controllers/vacation.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const vacationController = new VacationController();

// Apply authentication middleware to all routes
router.use(authenticate);

// List vacations
router.get('/', vacationController.listVacations);

// Follow vacation
router.post('/:id/follow', vacationController.followVacation);

// Unfollow vacation
router.delete('/:id/follow', vacationController.unfollowVacation);

export default router;
