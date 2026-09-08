const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leave.controller');
const { createLeaveValidation, updateLeaveStatusValidation } = require('../validators/leave.validator');
const validate = require('../middleware/validate.middleware');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.get('/', verifyToken, leaveController.getAllLeaves);
router.get('/employee/:employeeId', verifyToken, leaveController.getLeavesByEmployee);
router.post('/', verifyToken, createLeaveValidation, validate, leaveController.requestLeave);
router.patch('/:id/status', verifyToken, requireRole('Admin', 'HR Manager', 'Department Manager'), updateLeaveStatusValidation, validate, leaveController.updateLeaveStatus);

module.exports = router;