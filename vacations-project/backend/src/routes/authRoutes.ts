// src/routes/authRoutes.ts
import express from 'express';
import { body } from 'express-validator';
import { register, login, getMe } from '../controllers/authController';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

// Register a new user
router.post(
  '/register',
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 4 }).withMessage('Password must be at least 4 characters long'),
  ],
  register
);

// Login user
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

// Get authenticated user
router.get('/me', verifyToken, getMe);

export default router;