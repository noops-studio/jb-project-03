
import { Response, NextFunction } from 'express';
import { Sequelize } from 'sequelize-typescript';
import { createObjectCsvStringifier } from 'csv-writer';
import { Vacation } from '../models/vacation.model';
import { Follower } from '../models/follower.model';
import { AuthRequest } from '../middleware/auth.middleware';
import { S3Service } from '../services/s3.service';
import { AppError } from '../utils/error.utils';

export class AdminController {
  private s3Service: S3Service;

  constructor() {
    this.s3Service = new S3Service();
  }

  createVacation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Check if image was uploaded
      if (!req.file) {
        throw new AppError('Image is required', 400, 'VALIDATION_ERROR');
      }

      // Upload image to S3
      const imageFileName = await this.s3Service.uploadFile(req.file);

      // Validate other fields - already done by validation middleware
      const { destination, description, startDate, endDate, price } = req.body;

      // Create vacation
      const vacation = await Vacation.create({
        destination,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        price: parseFloat(price),
        imageFileName
      });

      res.status(201).json(vacation);
    } catch (error) {
      next(error);
    }
  };

  updateVacation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const vacationId = req.params.id;
      
      // Validate UUID format
      if (!isUUID(vacationId)) {
        throw new AppError('Invalid vacation ID format', 400);
      }

      // Check if vacation exists
      const vacation = await Vacation.findByPk(vacationId);
      
      if (!vacation) {
        throw new AppError('Vacation not found', 404, 'VACATION_NOT_FOUND');
      }

      // Prepare update data
      const { destination, description, startDate, endDate, price } = req.body;
      const updateData: any = {
        destination,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        price: parseFloat(price)
      };

      // Handle image update if provided
      if (req.file) {
        // Upload new image
        const newImageFileName = await this.s3Service.uploadFile(req.file);
        
        // Delete old image
        await this.s3Service.deleteFile(vacation.imageFileName);
        
        // Update filename
        updateData.imageFileName = newImageFileName;
      }

      // Update vacation
      await vacation.update(updateData);

      // Fetch updated vacation
      const updatedVacation = await Vacation.findByPk(vacationId);

      res.status(200).json(updatedVacation);
    } catch (error) {
      next(error);
    }
  };

  deleteVacation = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const vacationId = req.params.id;
      
      // Validate UUID format
      if (!isUUID(vacationId)) {
        throw new AppError('Invalid vacation ID format', 400);
      }

      // Check if vacation exists
      const vacation = await Vacation.findByPk(vacationId);
      
      if (!vacation) {
        throw new AppError('Vacation not found', 404, 'VACATION_NOT_FOUND');
      }

      // Delete vacation (image will be deleted by hook)
      await vacation.destroy();

      res.status(200).json({ message: 'Vacation deleted successfully' });
    } catch (error) {
      next(error);
    }
  };

  getVacationReports = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Get follower counts grouped by vacation
      const reports = await Vacation.findAll({
        attributes: [
          'id',
          'destination',
          [Sequelize.fn('COUNT', Sequelize.col('followers.id')), 'followerCount']
        ],
        include: [{
          model: Follower,
          attributes: []
        }],
        group: ['Vacation.id', 'Vacation.destination'],
        order: [[Sequelize.literal('followerCount'), 'DESC']]
      });

      // Format the response
      const formattedReports = reports.map(report => ({
        destination: report.destination,
        followerCount: parseInt((report as any).dataValues.followerCount, 10)
      }));

      res.status(200).json(formattedReports);
    } catch (error) {
      next(error);
    }
  };

  downloadCsvReport = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // Get the reports data
      const reports = await Vacation.findAll({
        attributes: [
          'destination',
          [Sequelize.fn('COUNT', Sequelize.col('followers.id')), 'followers']
        ],
        include: [{
          model: Follower,
          attributes: []
        }],
        group: ['Vacation.destination'],
        order: [[Sequelize.literal('followers'), 'DESC']]
      });

      // Format the data for CSV
      const records = reports.map(report => ({
        Destination: report.destination,
        Followers: (report as any).dataValues.followers
      }));

      // Create CSV
      const csvStringifier = createObjectCsvStringifier({
        header: [
          { id: 'Destination', title: 'Destination' },
          { id: 'Followers', title: 'Followers' }
        ]
      });

      const csvContent = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);

      // Set response headers
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=vacation-report.csv');

      // Send the CSV
      res.status(200).send(csvContent);
    } catch (error) {
      next(error);
    }
  };
}