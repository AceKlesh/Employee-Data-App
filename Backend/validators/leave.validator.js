const { body } = require('express-validator');

exports.createLeaveValidation = [
  body('employeeId').isInt({ min: 1 }).withMessage('Valid employee ID required'),
  body('leaveType').isIn(['sick', 'casual', 'annual', 'unpaid']).withMessage('Invalid leave type'),
  body('startDate').isDate().withMessage('Valid start date required'),
  body('endDate').isDate().withMessage('Valid end date required'),
  body('reason').optional().isLength({ max: 500 }),
];

exports.updateLeaveStatusValidation = [
  body('status').isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected'),
];