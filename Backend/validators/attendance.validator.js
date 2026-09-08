const { body } = require('express-validator');

exports.createAttendanceValidation = [
  body('employeeId').isInt({ min: 1 }).withMessage('Valid employee ID required'),
  body('attendanceDate').isDate().withMessage('Valid date required'),
  body('status').optional().isIn(['present', 'absent', 'late', 'half_day']),
  body('checkInTime').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Invalid time format (HH:MM)'),
  body('checkOutTime').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Invalid time format (HH:MM)'),
];