import { Router } from "express";
import { VacationController } from "../controllers/vacation.controller";
import { adminMiddleware } from "../middlewares/admin.middleware";
import { upload } from "../utils/uploader";

const router = Router();

// Admin-only report endpoints should come first
router.get("/report/csv", adminMiddleware, VacationController.getFollowReportCSV);
router.get("/report", adminMiddleware, VacationController.getFollowReport);

// Other routes

// Get all vacations (for logged-in users and admins)
router.get("/", VacationController.getAllVacations);

// Follow/unfollow endpoints for users (keep dynamic routes for follow/unfollow separately)
router.post("/:id/follow", VacationController.followVacation);
router.delete("/:id/follow", VacationController.unfollowVacation);

// Get one vacation by ID (for editing/viewing details) 
// Place this after the specific routes to avoid conflict with reserved endpoints like "report"
router.get("/:id", VacationController.getVacationById);

// Admin-only vacation management
router.post("/", adminMiddleware, upload.single("image"), VacationController.createVacation);
router.put("/:id", adminMiddleware, upload.single("image"), VacationController.updateVacation);
router.delete("/:id", adminMiddleware, VacationController.deleteVacation);

export default router;
