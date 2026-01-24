// Request Validation Middleware
import { body, param, query, validationResult } from 'express-validator';

export const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  };
};

// Common validation rules
export const videoValidation = [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title must be 1-200 characters'),
  body('description').optional().isLength({ max: 5000 }).withMessage('Description too long'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
];

export const userValidation = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters')
];

export const idValidation = [
  param('id').isUUID().withMessage('Invalid ID format')
];

export default { validate, videoValidation, userValidation, idValidation };
