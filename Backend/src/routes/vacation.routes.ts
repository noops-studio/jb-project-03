import { Router } from "express";
import { VacationController } from "../controllers/vacation.controller";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validation.middleware";
import { vacationSchemas } from "../utils/validation";
import { upload } from "../utils/uploader";
import fs from "fs";
import path from "path";

const router = Router();

// Admin-only report endpoints should come first - note we MUST apply auth middleware first
router.get("/report/csv", authMiddleware, adminMiddleware, VacationController.getFollowReportCSV);
router.get("/report", authMiddleware, adminMiddleware, VacationController.getFollowReport);

// Image routes (public, no auth needed)
router.get("/images/:filename", VacationController.getVacationImage);

// Debugging route - only for development
if (process.env.NODE_ENV !== 'production') {
  router.get("/debug", (req, res) => {
    const data = {
      s3Config: {
        endpoint: process.env.S3_ENDPOINT,
        publicEndpoint: process.env.S3_PUBLIC_ENDPOINT,
        bucket: process.env.S3_BUCKET,
        usingLocalImages: global.useLocalImages
      },
      uploadedImages: fs.existsSync(path.join(process.cwd(), 'uploads')) 
        ? fs.readdirSync(path.join(process.cwd(), 'uploads')).filter(f => !f.startsWith('.'))
        : []
    };
    return res.json(data);
  });
}

// Other routes

// Get all vacations (for logged-in users and admins)
router.get("/", authMiddleware, VacationController.getAllVacations);

// Follow/unfollow endpoints for users (keep dynamic routes for follow/unfollow separately)
router.post("/:id/follow", authMiddleware, validate(vacationSchemas.id, 'params'), VacationController.followVacation);
router.delete("/:id/follow", authMiddleware, validate(vacationSchemas.id, 'params'), VacationController.unfollowVacation);

// Get one vacation by ID (for editing/viewing details) 
// Place this after the specific routes to avoid conflict with reserved endpoints like "report"
router.get("/:id", authMiddleware, validate(vacationSchemas.id, 'params'), VacationController.getVacationById);

// Admin-only vacation management
router.post("/", authMiddleware, adminMiddleware, upload.single("image"), validate(vacationSchemas.create), VacationController.createVacation);
router.put("/:id", authMiddleware, adminMiddleware, upload.single("image"), validate(vacationSchemas.id, 'params'), validate(vacationSchemas.update), VacationController.updateVacation);
router.delete("/:id", authMiddleware, adminMiddleware, validate(vacationSchemas.id, 'params'), VacationController.deleteVacation);

export default router;
