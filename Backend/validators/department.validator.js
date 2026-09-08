const { body } = require('express-validator');

const createDepartmentValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Department name is required')
    .isLength({ max: 100 }).withMessage('Name must be under 100 characters'),
  body('description')
    .optional()
    .isLength({ max: 255 }).withMessage('Description must be under 255 characters'),
];

module.exports = { createDepartmentValidation };
