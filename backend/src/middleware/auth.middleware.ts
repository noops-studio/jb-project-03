// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from 'config';
import { User } from '../models/user.model';
import { AppError } from '../utils/error.utils';

interface JwtConfig {
  secret: string;
}

interface JwtPayload {
  id: string; // Changed from number to string for UUID
  role: string;
}

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authentication token required', 401);
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw new AppError('Authentication token required', 401);
    }

    try {
      const jwtConfig = config.get<JwtConfig>('jwt');
      const decoded = jwt.verify(token, jwtConfig.secret) as JwtPayload;
      
      const user = await User.findByPk(decoded.id);
      
      if (!user) {
        throw new AppError('User not found', 401);
      }

      req.user = user;
      next();
    } catch (error) {
      throw new AppError('Invalid or expired token', 401);
    }
  } catch (error) {
    next(error);
  }
};