import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import { registerSchema, loginSchema } from '../validators/auth.validator';

const router = Router();
const authController = new AuthController();

// Register route
router.post('/register', validate(registerSchema), authController.register);

// Login route
router.post('/login', validate(loginSchema), authController.login);

export default router;
