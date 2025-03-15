import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error.utils';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
        details: err.details
      }
    });
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: {
        message: 'Resource already exists',
        code: 'RESOURCE_EXISTS',
        details: {
          field: (err as any).errors[0].path,
          message: (err as any).errors[0].message
        }
      }
    });
  }

  // Default error response
  return res.status(500).json({
    error: {
      message: 'Internal Server Error',
      code: 'SERVER_ERROR'
    }
  });
};