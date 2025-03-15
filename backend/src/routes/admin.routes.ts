
import { Router } from 'express';
import multer from 'multer';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import { validate } from '../middleware/validation.middleware';
import { createVacationSchema, updateVacationSchema } from '../validators/vacation.validator';

const router = Router();
const adminController = new AdminController();

// Setup multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed') as any);
    }
  }
});

// Apply authentication and admin middleware to all routes
router.use(authenticate, requireAdmin);

// Create vacation
router.post(
  '/vacations',
  upload.single('image'),
  validate(createVacationSchema),
  adminController.createVacation
);

// Update vacation
router.put(
  '/vacations/:id',
  upload.single('image'),
  validate(updateVacationSchema),
  adminController.updateVacation
);

// Delete vacation
router.delete('/vacations/:id', adminController.deleteVacation);

// Get vacation reports
router.get('/reports', adminController.getVacationReports);

// Download CSV report
router.get('/reports/csv', adminController.downloadCsvReport);

export default router;
