// src/routes/vacationRoutes.ts
import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import { verifyToken, adminOnly } from '../middleware/auth';
import {
  getAllVacations,
  getVacationById,
  createVacation,
  updateVacation,
  deleteVacation,
  followVacation,
  unfollowVacation,
  getVacationStats,
  generateFollowersCSV
} from '../controllers/vacationController';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!') as any);
    }
  }
});

// Public routes (require authentication)
router.get('/', verifyToken, getAllVacations);
router.get('/:id', verifyToken, getVacationById);
router.post('/:vacationId/follow', verifyToken, followVacation);
router.delete('/:vacationId/follow', verifyToken, unfollowVacation);

// Admin only routes
router.post(
  '/',
  verifyToken,
  adminOnly,
  upload.single('image'),
  [
    body('destination').notEmpty().withMessage('Destination is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('startDate').isISO8601().toDate().withMessage('Valid start date is required'),
    body('endDate').isISO8601().toDate().withMessage('Valid end date is required'),
    body('price')
      .isFloat({ min: 0, max: 10000 })
      .withMessage('Price must be between 0 and 10000'),
  ],
  createVacation
);

router.put(
  '/:id',
  verifyToken,
  adminOnly,
  upload.single('image'),
  [
    body('destination').notEmpty().withMessage('Destination is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('startDate').isISO8601().toDate().withMessage('Valid start date is required'),
    body('endDate').isISO8601().toDate().withMessage('Valid end date is required'),
    body('price')
      .isFloat({ min: 0, max: 10000 })
      .withMessage('Price must be between 0 and 10000'),
  ],
  updateVacation
);

router.delete('/:id', verifyToken, adminOnly, deleteVacation);
router.get('/admin/stats', verifyToken, adminOnly, getVacationStats);
router.get('/admin/csv', verifyToken, adminOnly, generateFollowersCSV);

export default router;