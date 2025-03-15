import Joi from 'joi';

const baseVacationSchema = {
  destination: Joi.string().required().messages({
    'string.empty': 'Destination is required',
    'any.required': 'Destination is required'
  }),
  description: Joi.string().required().messages({
    'string.empty': 'Description is required',
    'any.required': 'Description is required'
  }),
  startDate: Joi.date().iso().required().messages({
    'date.base': 'Start date must be a valid date',
    'any.required': 'Start date is required'
  }),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required().messages({
    'date.base': 'End date must be a valid date',
    'date.min': 'End date must be after start date',
    'any.required': 'End date is required'
  }),
  price: Joi.number().min(0).max(10000).required().messages({
    'number.base': 'Price must be a number',
    'number.min': 'Price must be between 0 and 10,000',
    'number.max': 'Price must be between 0 and 10,000',
    'any.required': 'Price is required'
  })
};

export const createVacationSchema = Joi.object({
  ...baseVacationSchema,
  // Image validation will be handled separately since it's a file
});

export const updateVacationSchema = Joi.object({
  ...baseVacationSchema
  // Image is optional for updates
});