
import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Vacation from '../models/Vacation';
import Follower from '../models/Follower';
import fs from 'fs';
import path from 'path';

// Get all vacations with optional filtering
export const getAllVacations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;
    
    // Filter options
    const followed = req.query.followed === 'true';
    const upcoming = req.query.upcoming === 'true';
    const active = req.query.active === 'true';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let whereClause: any = {};
    
    // Apply date filters if requested
    if (upcoming) {
      whereClause.startDate = { [Op.gt]: today };
    } else if (active) {
      whereClause = {
        startDate: { [Op.lte]: today },
        endDate: { [Op.gte]: today }
      };
    }
    
    // Query all vacations with follower count
    const vacations = await Vacation.findAndCountAll({
      where: whereClause,
      order: [['startDate', 'ASC']],
      limit,
      offset,
      attributes: {
        include: [
          [
            // Count followers for each vacation
            Vacation.sequelize!.literal(
              '(SELECT COUNT(*) FROM followers WHERE followers.vacationId = Vacation.vacationId)'
            ),
            'followersCount'
          ],
          [
            // Check if current user follows this vacation
            Vacation.sequelize!.literal(
              `(SELECT COUNT(*) FROM followers WHERE followers.vacationId = Vacation.vacationId AND followers.userId = \${
                userId ? userId : 0
              })`
            ),
            'isFollowing'
          ]
        ]
      },
      raw: true
    });
    
    // If we need to filter by followed vacations, do it in memory
    let result = vacations.rows;
    if (followed && userId) {
      result = result.filter((vacation: any) => vacation.isFollowing > 0);
    }
    
    // Calculate total pages
    const totalPages = Math.ceil(vacations.count / limit);
    
    res.json({
      vacations: result,
      pagination: {
        page,
        limit,
        totalItems: vacations.count,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error getting vacations:', error);
    res.status(500).json({ message: 'Server error when fetching vacations' });
  }
};

// Get a single vacation by ID
export const getVacationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    
    const vacation = await Vacation.findByPk(id, {
      attributes: {
        include: [
          [
            // Count followers
            Vacation.sequelize!.literal(
              '(SELECT COUNT(*) FROM followers WHERE followers.vacationId = Vacation.vacationId)'
            ),
            'followersCount'
          ],
          [
            // Check if current user follows this vacation
            Vacation.sequelize!.literal(
              `(SELECT COUNT(*) FROM followers WHERE followers.vacationId = Vacation.vacationId AND followers.userId = \${
                userId ? userId : 0
              })`
            ),
            'isFollowing'
          ]
        ]
      },
      raw: true
    });
    
    if (!vacation) {
      return res.status(404).json({ message: 'Vacation not found' });
    }
    
    res.json(vacation);
  } catch (error) {
    console.error('Error getting vacation:', error);
    res.status(500).json({ message: 'Server error when fetching vacation' });
  }
};

// Create a new vacation (admin only)
export const createVacation = async (req: Request, res: Response) => {
  try {
    const { destination, description, startDate, endDate, price } = req.body;
    
    // Check for uploaded image
    if (!req.file) {
      return res.status(400).json({ message: 'Image is required' });
    }
    
    const imageFileName = req.file.filename;
    
    // Create new vacation
    const vacation = await Vacation.create({
      destination,
      description,
      startDate,
      endDate,
      price,
      imageFileName
    });
    
    res.status(201).json(vacation);
  } catch (error: any) {
    console.error('Error creating vacation:', error);
    
    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors.map((e: any) => ({ field: e.path, message: e.message }))
      });
    }
    
    res.status(500).json({ message: 'Server error when creating vacation' });
  }
};

// Update an existing vacation (admin only)
export const updateVacation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { destination, description, startDate, endDate, price } = req.body;
    
    // Find the vacation
    const vacation = await Vacation.findByPk(id);
    if (!vacation) {
      return res.status(404).json({ message: 'Vacation not found' });
    }
    
    // Update vacation data
    vacation.destination = destination;
    vacation.description = description;
    vacation.startDate = startDate;
    vacation.endDate = endDate;
    vacation.price = price;
    
    // If there's a new image uploaded
    if (req.file) {
      // Delete the old image file if it exists
      const oldImagePath = path.join(__dirname, '../../uploads', vacation.imageFileName);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      
      // Update with new image filename
      vacation.imageFileName = req.file.filename;
    }
    
    // Save changes
    await vacation.save();
    
    res.json(vacation);
  } catch (error: any) {
    console.error('Error updating vacation:', error);
    
    // Handle validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors.map((e: any) => ({ field: e.path, message: e.message }))
      });
    }
    
    res.status(500).json({ message: 'Server error when updating vacation' });
  }
};

// Delete a vacation (admin only)
export const deleteVacation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Find the vacation
    const vacation = await Vacation.findByPk(id);
    if (!vacation) {
      return res.status(404).json({ message: 'Vacation not found' });
    }
    
    // Delete the image file
    const imagePath = path.join(__dirname, '../../uploads', vacation.imageFileName);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    
    // Delete the vacation (this will also delete related followers due to CASCADE)
    await vacation.destroy();
    
    res.json({ message: 'Vacation deleted successfully' });
  } catch (error) {
    console.error('Error deleting vacation:', error);
    res.status(500).json({ message: 'Server error when deleting vacation' });
  }
};
