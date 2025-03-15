import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { AppError } from '../utils/error.utils';

export const validate = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const details: Record<string, string> = {};
      
      error.details.forEach(detail => {
        const path = detail.path.join('.');
        details[path] = detail.message;
      });

      return next(new AppError('Validation failed', 400, 'VALIDATION_ERROR', details));
    }
    
    next();
  };
};
