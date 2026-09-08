const { body } = require('express-validator');

exports.registerValidation = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),
  body('roleId').isInt({ min: 1 }).withMessage('A valid role is required'),
  body('employeeId').optional().isInt({ min: 1 }).withMessage('Invalid employee ID'),
];