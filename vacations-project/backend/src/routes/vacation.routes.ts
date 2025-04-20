import express from 'express';
import { body } from 'express-validator';
import { 
  getAllVacations, 
  getVacationById, 
  createVacation, 
  updateVacation, 
  deleteVacation 
} from '../controllers/vacation.controller';
import { authenticateUser, isAdmin } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import upload from '../middlewares/upload.middleware';

const router = express.Router();

// Vacation validation rules
const vacationValidation = [
  body('destination').notEmpty().withMessage('Destination is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('startDate').isDate().withMessage('Start date must be a valid date'),
  body('endDate').isDate().withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  body('price').isFloat({ min: 0, max: 10000 }).withMessage('Price must be between 0 and 10000')
];

// Routes
router.get('/', authenticateUser, getAllVacations);
router.get('/:id', authenticateUser, getVacationById);
router.post(
  '/',
  authenticateUser,
  isAdmin,
  upload.single('image'),
  validate(vacationValidation),
  createVacation
);
router.put(
  '/:id',
  authenticateUser,
  isAdmin,
  upload.single('image'),
  validate(vacationValidation),
  updateVacation
);
router.delete('/:id', authenticateUser, isAdmin, deleteVacation);

export default router;