import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { UserRole } from '../models/user.model';
import { AppError } from '../utils/error.utils';

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== UserRole.ADMIN) {
    return next(new AppError('Access denied. Admin role required.', 403));
  }
  next();
};
