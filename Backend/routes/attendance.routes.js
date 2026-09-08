const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const { createAttendanceValidation } = require('../validators/attendance.validator');
const validate = require('../middleware/validate.middleware');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.get('/', verifyToken, attendanceController.getAllAttendance);
router.get('/employee/:employeeId', verifyToken, attendanceController.getAttendanceByEmployee);
router.post('/', verifyToken, requireRole('Admin', 'HR Manager', 'Department Manager'), createAttendanceValidation, validate, attendanceController.markAttendance);

module.exports = router;