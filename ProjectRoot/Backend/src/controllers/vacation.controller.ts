/// <reference path="../types/express/index.d.ts" />

import { Request, Response } from "express";
import { Vacation } from "../models/vacation.model";
import { Follower } from "../models/follower.model";
import { upload } from "../utils/uploader";
import fs from "fs";
import path from "path";
import { sequelize } from "../config/db";
import { QueryTypes } from "sequelize";

export const VacationController = {
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
      // Basic validation
      if (!destination || !description || !startDate || !endDate || !price) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      if (end < start) {
        return res.status(400).json({ message: "End date cannot be before start date" });
      }
      const now = new Date();
      // Do not allow creating vacations entirely in the past
      if (end < now) {
        return res.status(400).json({ message: "Vacation dates cannot be entirely in the past" });
      }
      const priceNum = parseFloat(price);
      if (priceNum < 0 || priceNum > 10000) {
        return res.status(400).json({ message: "Price must be between 0 and 10000" });
      }
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
      // Validate fields (allow partial updates except we expect all fields in form except image)
      if (!destination || !description || !startDate || !endDate || !price) {
        return res.status(400).json({ message: "All fields (except image) are required" });
      }
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      if (end < start) {
        return res.status(400).json({ message: "End date cannot be before start date" });
      }
      const priceNum = parseFloat(price);
      if (priceNum < 0 || priceNum > 10000) {
        return res.status(400).json({ message: "Price must be between 0 and 10000" });
      }
      // If a new image file is uploaded, handle it
      let imageFileName = vacation.get("imageFileName") as string;
      if (req.file) {
        // Remove old image file from server if exists
        const oldFile = imageFileName;
        if (oldFile && fs.existsSync(path.join("uploads", oldFile))) {
          fs.unlinkSync(path.join("uploads", oldFile));
        }
        imageFileName = req.file.filename;
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
      // Delete the image file from disk, if exists
      const imageFileName = vacation.get("imageFileName") as string;
      if (imageFileName && fs.existsSync(path.join("uploads", imageFileName))) {
        fs.unlinkSync(path.join("uploads", imageFileName));
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
