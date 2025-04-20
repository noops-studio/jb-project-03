import Joi from 'joi';

// Vacation validation schemas
export const vacationSchemas = {
  create: Joi.object({
    destination: Joi.string().required().min(2).max(100).messages({
      'string.empty': 'Destination is required',
      'string.min': 'Destination must be at least 2 characters',
      'string.max': 'Destination must be less than 100 characters'
    }),
    description: Joi.string().required().min(10).max(1000).messages({
      'string.empty': 'Description is required',
      'string.min': 'Description must be at least 10 characters',
      'string.max': 'Description must be less than 1000 characters'
    }),
    startDate: Joi.date().required().greater('now').messages({
      'date.base': 'Start date must be a valid date',
      'date.greater': 'Start date must be in the future'
    }),
    endDate: Joi.date().required().greater(Joi.ref('startDate')).messages({
      'date.base': 'End date must be a valid date',
      'date.greater': 'End date must be after start date'
    }),
    price: Joi.number().required().min(0).max(10000).messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative',
      'number.max': 'Price cannot exceed 10000'
    })
  }),
  
  update: Joi.object({
    destination: Joi.string().required().min(2).max(100).messages({
      'string.empty': 'Destination is required',
      'string.min': 'Destination must be at least 2 characters',
      'string.max': 'Destination must be less than 100 characters'
    }),
    description: Joi.string().required().min(10).max(1000).messages({
      'string.empty': 'Description is required',
      'string.min': 'Description must be at least 10 characters',
      'string.max': 'Description must be less than 1000 characters'
    }),
    startDate: Joi.date().required().messages({
      'date.base': 'Start date must be a valid date'
    }),
    endDate: Joi.date().required().greater(Joi.ref('startDate')).messages({
      'date.base': 'End date must be a valid date',
      'date.greater': 'End date must be after start date'
    }),
    price: Joi.number().required().min(0).max(10000).messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative',
      'number.max': 'Price cannot exceed 10000'
    })
  }),
  
  id: Joi.object({
    id: Joi.number().integer().required().messages({
      'number.base': 'ID must be a number',
      'number.integer': 'ID must be an integer'
    })
  }),
  
  follower: Joi.object({
    vacationId: Joi.number().integer().required().messages({
      'number.base': 'Vacation ID must be a number',
      'number.integer': 'Vacation ID must be an integer'
    })
  })
};

// Authentication validation schemas
export const authSchemas = {
  register: Joi.object({
    firstName: Joi.string().required().min(2).max(50).messages({
      'string.empty': 'First name is required',
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name must be less than 50 characters'
    }),
    lastName: Joi.string().required().min(2).max(50).messages({
      'string.empty': 'Last name is required',
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name must be less than 50 characters'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Email must be valid',
      'string.empty': 'Email is required'
    }),
    password: Joi.string().required().min(6).pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).*$/).messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    })
  }),
  
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email must be valid',
      'string.empty': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password is required'
    })
  })
};

// Export all schemas for easy import
export default { vacationSchemas, authSchemas };