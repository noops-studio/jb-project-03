// src/controllers/vacationController.ts
import { Request, Response } from 'express';
import { Vacation, Follower, User } from '../models';
import { Op, literal, fn, col } from 'sequelize';
import { validationResult } from 'express-validator';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Get all vacations with user-specific follow status
export const getAllVacations = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    // Filter parameters
    const followedOnly = req.query.followedOnly === 'true';
    const activeOnly = req.query.activeOnly === 'true';
    const futureOnly = req.query.futureOnly === 'true';

    // Base where condition
    let whereClause: any = {};

    // Date filters
    const currentDate = new Date();
    if (activeOnly) {
      whereClause = {
        ...whereClause,
        startDate: { [Op.lte]: currentDate },
        endDate: { [Op.gte]: currentDate },
      };
    } else if (futureOnly) {
      whereClause = {
        ...whereClause,
        startDate: { [Op.gt]: currentDate },
      };
    }

    // Get all vacations with follow status
    const vacationsWithCount = await Vacation.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'followers',
          attributes: ['id'],
          through: { attributes: [] },
        },
      ],
      limit,
      offset,
      order: [['startDate', 'ASC']],
      distinct: true,
      subQuery: false,
    });

    // Process vacations to include follow status and follower count
    const vacations = await Promise.all(
      vacationsWithCount.rows.map(async (vacation) => {
        // Check if user follows this vacation
        const follower = await Follower.findOne({
          where: {
            userId,
            vacationId: vacation.id,
          },
        });

        // Count followers for this vacation
        const followerCount = await Follower.count({
          where: {
            vacationId: vacation.id,
          },
        });

        return {
          ...vacation.toJSON(),
          isFollowed: !!follower,
          followerCount,
          followers: undefined, // Remove the followers array
        };
      })
    );

    // Filter for followed vacations if specified
    const filteredVacations = followedOnly
      ? vacations.filter((vacation) => vacation.isFollowed)
      : vacations;

    res.json({
      vacations: filteredVacations,
      totalPages: Math.ceil(vacationsWithCount.count / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error('Get vacations error:', error);
    res.status(500).json({ message: 'Server error following vacation' });
  }
};

// Unfollow a vacation
export const unfollowVacation = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { vacationId } = req.params;

    // Check if vacation exists
    const vacation = await Vacation.findByPk(vacationId);
    if (!vacation) {
      return res.status(404).json({ message: 'Vacation not found' });
    }

    // Check if following
    const existingFollow = await Follower.findOne({
      where: {
        userId,
        vacationId,
      },
    });

    if (!existingFollow) {
      return res.status(400).json({ message: 'Not following this vacation' });
    }

    // Remove follow relationship
    await existingFollow.destroy();

    res.json({ message: 'Vacation unfollowed successfully' });
  }
  catch (error) {
    console.error('Unfollow vacation error:', error);
    res.status(500).json({ message: 'Server error unfollowing vacation' });
  }
};

// Get vacation statistics (admin only)
export const getVacationStats = async (req: Request, res: Response) => {
  try {
    // Get vacations with follower count
    const vacationStats = await Vacation.findAll({
      attributes: [
        'id',
        'destination',
        [fn('COUNT', col('followers.userId')), 'followerCount']
      ],
      include: [
        {
          model: User,
          as: 'followers',
          attributes: [],
          through: { attributes: [] }
        }
      ],
      group: ['Vacation.id'],
      order: [[literal('followerCount'), 'DESC']]
    });

    res.json(vacationStats);
  } catch (error) {
    console.error('Get vacation stats error:', error);
    res.status(500).json({ message: 'Server error getting vacation statistics' });
  }
};

// Generate CSV report of vacation followers (admin only)
export const generateFollowersCSV = async (req: Request, res: Response) => {
  try {
    // Get vacation stats
    const vacationStats = await Vacation.findAll({
      attributes: [
        'destination',
        [fn('COUNT', col('followers.userId')), 'followerCount']
      ],
      include: [
        {
          model: User,
          as: 'followers',
          attributes: [],
          through: { attributes: [] }
        }
      ],
      group: ['Vacation.destination'],
      order: [['destination', 'ASC']]
    });

    // Format as CSV
    let csvContent = 'Destination,Followers\n';
    vacationStats.forEach((stat: any) => {
      csvContent += `${stat.destination},${stat.get('followerCount')}\n`;
    });

    // Set response headers for downloading CSV
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=vacation_followers.csv');
    
    // Send CSV content
    res.send(csvContent);
  } catch (error) {
    console.error('Generate CSV error:', error);
    res.status(500).json({ message: 'Server error generating CSV report' });
  }
};({ message: 'Server error fetching vacations' });
  }
};

// Get a single vacation by ID
export const getVacationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const vacation = await Vacation.findByPk(id);
    if (!vacation) {
      return res.status(404).json({ message: 'Vacation not found' });
    }

    // Check if user follows this vacation
    const follower = await Follower.findOne({
      where: {
        userId,
        vacationId: vacation.id,
      },
    });

    // Count followers for this vacation
    const followerCount = await Follower.count({
      where: {
        vacationId: vacation.id,
      },
    });

    res.json({
      ...vacation.toJSON(),
      isFollowed: !!follower,
      followerCount,
    });
  } catch (error) {
    console.error('Get vacation error:', error);
    res.status(500).json({ message: 'Server error fetching vacation' });
  }
};

// Create a new vacation (admin only)
export const createVacation = async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { destination, description, startDate, endDate, price } = req.body;

    // Handle image upload
    if (!req.file) {
      return res.status(400).json({ message: 'Vacation image is required' });
    }

    // Generate unique filename
    const fileExtension = path.extname(req.file.originalname);
    const imageFileName = `${uuidv4()}${fileExtension}`;
    
    // Move uploaded file to final destination
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    
    // Check if directory exists, if not create it
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const targetPath = path.join(uploadDir, imageFileName);
    
    fs.writeFileSync(targetPath, req.file.buffer);

    // Create vacation in database
    const vacation = await Vacation.create({
      destination,
      description,
      startDate,
      endDate,
      price,
      imageFileName,
    });

    res.status(201).json(vacation);
  } catch (error) {
    console.error('Create vacation error:', error);
    res.status(500).json({ message: 'Server error creating vacation' });
  }
};

// Update a vacation (admin only)
export const updateVacation = async (req: Request, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { destination, description, startDate, endDate, price } = req.body;

    // Find vacation
    const vacation = await Vacation.findByPk(id);
    if (!vacation) {
      return res.status(404).json({ message: 'Vacation not found' });
    }

    // Update vacation data
    const updateData: any = {
      destination,
      description,
      startDate,
      endDate,
      price,
    };

    // Handle image update if file is uploaded
    if (req.file) {
      // Generate unique filename
      const fileExtension = path.extname(req.file.originalname);
      const imageFileName = `${uuidv4()}${fileExtension}`;
      
      // Move uploaded file to final destination
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const targetPath = path.join(uploadDir, imageFileName);
      
      fs.writeFileSync(targetPath, req.file.buffer);

      // Set image file name in update data
      updateData.imageFileName = imageFileName;

      // Delete old image if it exists
      const oldImagePath = path.join(uploadDir, vacation.imageFileName);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update vacation in database
    await vacation.update(updateData);

    res.json(vacation);
  } catch (error) {
    console.error('Update vacation error:', error);
    res.status(500).json({ message: 'Server error updating vacation' });
  }
};

// Delete a vacation (admin only)
export const deleteVacation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Find vacation
    const vacation = await Vacation.findByPk(id);
    if (!vacation) {
      return res.status(404).json({ message: 'Vacation not found' });
    }

    // Delete image file
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const imagePath = path.join(uploadDir, vacation.imageFileName);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Delete vacation from database
    await vacation.destroy();

    res.json({ message: 'Vacation deleted successfully' });
  } catch (error) {
    console.error('Delete vacation error:', error);
    res.status(500).json({ message: 'Server error deleting vacation' });
  }
};

// Follow a vacation
export const followVacation = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { vacationId } = req.params;

    // Check if vacation exists
    const vacation = await Vacation.findByPk(vacationId);
    if (!vacation) {
      return res.status(404).json({ message: 'Vacation not found' });
    }

    // Check if already following
    const existingFollow = await Follower.findOne({
      where: {
        userId,
        vacationId,
      },
    });

    if (existingFollow) {
      return res.status(400).json({ message: 'Already following this vacation' });
    }

    // Create follow relationship
    await Follower.create({
      userId,
      vacationId: parseInt(vacationId),
    });

    res.json({ message: 'Vacation followed successfully' });
  } catch (error) {
    console.error('Follow vacation error:', error);
    res.status(500).json