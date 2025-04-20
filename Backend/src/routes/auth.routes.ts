import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validation.middleware";
import { authSchemas } from "../utils/validation";

const router = Router();

// Public routes for authentication
router.post("/register", validate(authSchemas.register), AuthController.register);
router.post("/login", validate(authSchemas.login), AuthController.login);

export default router;
