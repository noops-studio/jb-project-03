
import { Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { Vacation } from '../models/vacation.model';
import { Follower } from '../models/follower.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../utils/error.utils';

export class VacationController {
  listVacations = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { page = '1', limit = '10', followed, upcoming, active } = req.query;
      
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const offset = (pageNum - 1) * limitNum;
      
      // Build the where condition
      const whereCondition: any = {};
      
      // Filter by upcoming vacations
      if (upcoming === 'true') {
        whereCondition.startDate = {
          [Op.gt]: new Date()
        };
      }
      
      // Filter by active vacations
      if (active === 'true') {
        const now = new Date();
        whereCondition[Op.and] = [
          { startDate: { [Op.lte]: now } },
          { endDate: { [Op.gte]: now } }
        ];
      }

      // Get user ID
      const userId = req.user!.id;
      
      // Get all vacations with follow count and user's follow status
      const { count, rows } = await Vacation.findAndCountAll({
        where: whereCondition,
        limit: limitNum,
        offset,
        order: [['startDate', 'ASC']],
        distinct: true,
        include: [
          {
            model: Follower,
            attributes: ['userId'],
            required: followed === 'true'
          }
        ]
      });

      // Get followed vacation IDs for the current user
      const followedVacations = await Follower.findAll({
        where: { userId },
        attributes: ['vacationId']
      });
      
      const followedIds = new Set(followedVacations.map(f => f.vacationId));

      // Format the response
      const vacationsWithFollowStatus = rows.map(vacation => {
        const vacationJson = vacation.toJSON();
        
        // Add follow count
        vacationJson.followCount = vacation.followers ? vacation.followers.length : 0;
        
        // Add follow status for current user
        vacationJson.isFollowing = followedIds.has(vacation.id);
        
        return vacationJson;
      });

      res.status(200).json({
        data: vacationsWithFollowStatus,
        pagination: {
          total: count,
          pages: Math.ceil(count / limitNum),
          currentPage: pageNum,
          hasNext: pageNum * limitNum < count,
          hasPrev: pageNum > 1
        }
      });
    } catch (error) {
      next(error);
    }
  };

  followVacation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const vacationId = req.params.id;
      
      // Validate UUID format
      if (!isUUID(vacationId)) {
        throw new AppError('Invalid vacation ID format', 400);
      }
      
      const userId = req.user!.id;

      // Check if vacation exists
      const vacation = await Vacation.findByPk(vacationId);
      
      if (!vacation) {
        throw new AppError('Vacation not found', 404, 'VACATION_NOT_FOUND');
      }

      // Check if already following
      const existingFollow = await Follower.findOne({
        where: { userId, vacationId }
      });
      
      if (existingFollow) {
        throw new AppError('Already following this vacation', 400, 'ALREADY_FOLLOWING');
      }

      // Create follower record
      await Follower.create({ userId, vacationId });

      res.status(200).json({ message: 'Vacation followed successfully' });
    } catch (error) {
      next(error);
    }
  };

  unfollowVacation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const vacationId = req.params.id;
      
      // Validate UUID format
      if (!isUUID(vacationId)) {
        throw new AppError('Invalid vacation ID format', 400);
      }
      
      const userId = req.user!.id;

      // Check if vacation exists
      const vacation = await Vacation.findByPk(vacationId);
      
      if (!vacation) {
        throw new AppError('Vacation not found', 404, 'VACATION_NOT_FOUND');
      }

      // Check if following
      const follower = await Follower.findOne({
        where: { userId, vacationId }
      });
      
      if (!follower) {
        throw new AppError('Not following this vacation', 404, 'NOT_FOLLOWING');
      }

      // Delete follower record
      await follower.destroy();

      res.status(200).json({ message: 'Vacation unfollowed successfully' });
    } catch (error) {
      next(error);
    }
  };
}
