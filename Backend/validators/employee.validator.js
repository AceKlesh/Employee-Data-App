const { body } = require('express-validator');

exports.createEmployeeValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required').isLength({ max: 50 }),
  body('lastName').trim().notEmpty().withMessage('Last name is required').isLength({ max: 50 }),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('jobTitle').trim().notEmpty().withMessage('Job title is required'),
  body('departmentId').isInt({ min: 1 }).withMessage('A valid department is required'),
  body('dateHired').isDate().withMessage('A valid hire date is required'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender value'),
  body('salary').optional().isDecimal().withMessage('Salary must be a valid number'),
];