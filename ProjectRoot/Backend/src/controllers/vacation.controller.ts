/// <reference path="../types/express/index.d.ts" />

import { Request, Response } from "express";
import { Vacation } from "../models/vacation.model";
import { Follower } from "../models/follower.model";
import { upload } from "../utils/uploader";
import fs from "fs";
import path from "path";
import { sequelize } from "../config/db";
import { QueryTypes } from "sequelize";
import { getPublicUrl, deleteFile } from "../utils/s3";

export const VacationController = {
  // Get image by filename - this doesn't need auth middleware
  getVacationImage: async (req: Request, res: Response) => {
    try {
      const filename = req.params.filename;
      if (!filename) {
        return res.status(400).json({ message: "Image filename is required" });
      }
      
      console.log(`Serving image: ${filename}`);
      
      // If we're using local images (S3 failed to connect), serve from local uploads folder
      if (global.useLocalImages) {
        // Check if file exists in uploads folder
        const localPath = path.join(process.cwd(), 'uploads', filename);
        if (fs.existsSync(localPath)) {
          console.log(`Serving local file from: ${localPath}`);
          return res.sendFile(localPath);
        } else {
          console.warn(`Local file not found: ${localPath}`);
          // File doesn't exist locally - send default image or 404
          return res.status(404).json({ message: "Image not found" });
        }
      } else {
        try {
          // Try to serve from uploads directory first as a fallback
          const localPath = path.join(process.cwd(), 'uploads', filename);
          if (fs.existsSync(localPath)) {
            console.log(`Serving local file (even though S3 is active): ${localPath}`);
            return res.sendFile(localPath);
          }
        } catch (err) {
          console.log("Failed to serve from local uploads, trying S3 redirect");
        }
        
        // Use S3 if available
        const publicUrl = getPublicUrl(filename);
        console.log(`Redirecting to S3 URL: ${publicUrl}`);
        return res.redirect(publicUrl);
      }
    } catch (err: any) {
      console.error("Error serving image:", err.message);
      return res.status(500).json({ message: "Server error" });
    }
  },
  
  // Get all vacations (for logged-in user or admin)
  getAllVacations: async (req: Request, res: Response) => {
    try {
      const currentUserId = req.user!.id;
      const currentUserRole = req.user!.role;
      // Fetch all vacations sorted by start date
      const vacations = await Vacation.findAll({ order: [["startDate", "ASC"]] });
      // For each vacation, determine followers count and if current user follows it
      const result = [];
      for (const vac of vacations) {
        const plainVac = vac.get({ plain: true });
        const count = await Follower.count({ where: { vacationId: plainVac.id } });
        let isFollowed = false;
        if (currentUserRole !== "admin") {
          // Only check follow status for normal users (admin doesn't follow vacations in UI)
          const followRecord = await Follower.findOne({ where: { userId: currentUserId, vacationId: plainVac.id } });
          isFollowed = followRecord ? true : false;
        }
        
        // Add debug info to help with image troubleshooting
        console.log(`Vacation image info - ID: ${plainVac.id}, fileName: ${plainVac.imageFileName}`);
        
        // Use the imageFileName as is - the frontend will construct the correct URL
        result.push({ ...plainVac, followersCount: count, isFollowed });
      }
      return res.json(result);
    } catch (err) {
      console.error("Error getting vacations:", err);
      return res.status(500).json({ message: "Server error" });
    }
  },

  // Get single vacation by ID
  getVacationById: async (req: Request, res: Response) => {
    try {
      const vacId = req.params.id;
      const vacation = await Vacation.findByPk(vacId);
      if (!vacation) {
        return res.status(404).json({ message: "Vacation not found" });
      }
      return res.json(vacation.get({ plain: true }));
    } catch (err) {
      console.error("Error getting vacation:", err);
      return res.status(500).json({ message: "Server error" });
    }
  },

  // Admin: create a new vacation
  createVacation: async (req: Request, res: Response) => {
    try {
      // `upload.single('image')` middleware will have processed the file if any
      const { destination, description, startDate, endDate, price } = req.body;
      // Validation is now handled by Joi middleware
      const start = new Date(startDate);
      const end = new Date(endDate);
      const priceNum = parseFloat(price);
      // Handle image file if provided
      let imageFileName = "no-image.jpg";
      if (req.file) {
        imageFileName = req.file.filename;  // filename set by multer
      } else {
        // If no file uploaded, we could use a default image or return an error.
        // Here we choose to require an image:
        return res.status(400).json({ message: "Image is required" });
      }
      // Create vacation record
      const newVac = await Vacation.create({ destination, description, startDate, endDate, price: priceNum, imageFileName });
      return res.status(201).json(newVac.get({ plain: true }));
    } catch (err: any) {
      console.error("Error creating vacation:", err);
      return res.status(500).json({ message: err.message || "Server error" });
    }
  },

  // Admin: update an existing vacation
  updateVacation: async (req: Request, res: Response) => {
    try {
      const vacId = req.params.id;
      const vacation = await Vacation.findByPk(vacId);
      if (!vacation) {
        return res.status(404).json({ message: "Vacation not found" });
      }
      const { destination, description, startDate, endDate, price } = req.body;
      // Validation is now handled by Joi middleware
      const start = new Date(startDate);
      const end = new Date(endDate);
      const priceNum = parseFloat(price);
      // If a new image file is uploaded, handle it
      let imageFileName = vacation.get("imageFileName") as string;
      if (req.file) {
        try {
          // Try to delete the old file from S3 or local storage
          if (imageFileName) {
            await deleteFile(imageFileName);
            console.log(`Deleted old image: ${imageFileName}`);
          }
        } catch (err) {
          console.warn(`Could not delete old image file: ${imageFileName}`, err);
          // Continue with the update even if old file deletion fails
        }
        
        // Use the new filename provided by multer/S3Storage
        imageFileName = req.file.filename;
        console.log(`New image filename: ${imageFileName}`);
      }
      // Update fields
      await Vacation.update(
        { destination, description, startDate, endDate, price: priceNum, imageFileName },
        { where: { id: vacId } }
      );
      const updated = await Vacation.findByPk(vacId);
      return res.json(updated!.get({ plain: true }));
    } catch (err) {
      console.error("Error updating vacation:", err);
      return res.status(500).json({ message: "Server error" });
    }
  },

  // Admin: delete a vacation
  deleteVacation: async (req: Request, res: Response) => {
    try {
      const vacId = req.params.id;
      const vacation = await Vacation.findByPk(vacId);
      if (!vacation) {
        return res.status(404).json({ message: "Vacation not found" });
      }
      // Delete associated follower records (if not handled by DB cascade)
      await Follower.destroy({ where: { vacationId: vacId } });
      // Remove the vacation
      await Vacation.destroy({ where: { id: vacId } });
      // Delete the image file from S3 or local storage
      const imageFileName = vacation.get("imageFileName") as string;
      try {
        if (imageFileName) {
          await deleteFile(imageFileName);
          console.log(`Deleted vacation image: ${imageFileName}`);
        }
      } catch (err) {
        console.warn(`Failed to delete vacation image: ${imageFileName}`, err);
        // Continue with the deletion even if image removal fails
      }
      return res.json({ message: "Vacation deleted" });
    } catch (err) {
      console.error("Error deleting vacation:", err);
      return res.status(500).json({ message: "Server error" });
    }
  },

  // User: follow a vacation
  followVacation: async (req: Request, res: Response) => {
    try {
      const vacId = req.params.id;
      const userId = req.user!.id;
      
      // Verify the vacation exists
      const vacation = await Vacation.findByPk(vacId);
      if (!vacation) {
        return res.status(404).json({ message: "Vacation not found" });
      }
      
      // Check if already followed
      const exists = await Follower.findOne({ where: { userId, vacationId: vacId } });
      if (exists) {
        return res.status(400).json({ message: "Already following this vacation" });
      }
      await Follower.create({ userId, vacationId: vacId });
      return res.status(201).json({ message: "Followed vacation" });
    } catch (err) {
      console.error("Error following vacation:", err);
      return res.status(500).json({ message: "Server error" });
    }
  },

  // User: unfollow a vacation
  unfollowVacation: async (req: Request, res: Response) => {
    try {
      const vacId = req.params.id;
      const userId = req.user!.id;
      
      // Verify the vacation exists
      const vacation = await Vacation.findByPk(vacId);
      if (!vacation) {
        return res.status(404).json({ message: "Vacation not found" });
      }
      
      const deleted = await Follower.destroy({ where: { userId, vacationId: vacId } });
      if (!deleted) {
        return res.status(400).json({ message: "Not following this vacation" });
      }
      return res.json({ message: "Unfollowed vacation" });
    } catch (err) {
      console.error("Error unfollowing vacation:", err);
      return res.status(500).json({ message: "Server error" });
    }
  },

  // Admin: get vacation followers report (JSON data)

  getFollowReport: async (req: Request, res: Response) => {
    try {
      const rows = await sequelize.query<{ destination: string; followersCount: number }>(
        `SELECT v.destination AS destination, COUNT(f.userId) AS followersCount
         FROM Vacations v 
         LEFT JOIN Followers f ON v.id = f.vacationId
         GROUP BY v.id
         ORDER BY v.destination;`,
        { type: QueryTypes.SELECT }
      );
      return res.json(rows);
    } catch (err) {
      console.error("Error generating report:", err);
      return res.status(500).json({ message: "Server error" });
    }
  },

  // Admin: get vacation followers report in CSV format
    getFollowReportCSV: async (req: Request, res: Response) => {
    try {
      // Use the same technique for the CSV version.
      const rows = await sequelize.query<{ destination: string; followersCount: number }>(
        `SELECT v.destination AS destination, COUNT(f.userId) AS followersCount
         FROM Vacations v 
         LEFT JOIN Followers f ON v.id = f.vacationId
         GROUP BY v.id
         ORDER BY v.destination;`,
        { type: QueryTypes.SELECT }
      );
      let csv = "Destination,FollowersCount\n";
      for (const row of rows) {
        csv += `${row.destination},${row.followersCount}\n`;
      }
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=vacations_report.csv");
      return res.send(csv);
    } catch (err) {
      console.error("Error generating CSV report:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
};
