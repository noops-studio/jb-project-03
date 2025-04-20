import express from 'express';
import { body } from 'express-validator';
import { register, login, getCurrentUser } from '../controllers/auth.controller';
import { validate } from '../middlewares/validate.middleware';
import { authenticateUser } from '../middlewares/auth.middleware';

const router = express.Router();

// Registration validation rules
const registerValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Must be a valid email address'),
  body('password').isLength({ min: 4 }).withMessage('Password must be at least 4 characters long')
];

// Login validation rules
const loginValidation = [
  body('email').isEmail().withMessage('Must be a valid email address'),
  body('password').isLength({ min: 4 }).withMessage('Password must be at least 4 characters long')
];

// Routes
router.post('/register', validate(registerValidation), register);
router.post('/login', validate(loginValidation), login);
router.get('/me', authenticateUser, getCurrentUser);

export default router;