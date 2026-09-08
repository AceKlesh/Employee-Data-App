const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const { createEmployeeValidation } = require('../validators/employee.validator');
const validate = require('../middleware/validate.middleware');
const upload = require('../middleware/upload.middleware');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.get('/', employeeController.getAllEmployees);
router.get('/:id', employeeController.getEmployeeById);

router.post(
  '/',
  verifyToken,
  requireRole('Admin', 'HR Manager'),
  upload.single('profilePicture'),
  createEmployeeValidation,
  validate,
  employeeController.createEmployee
);

router.put('/:id', verifyToken, requireRole('Admin', 'HR Manager'), employeeController.updateEmployee);
router.delete('/:id', verifyToken, requireRole('Admin'), employeeController.deleteEmployee);

module.exports = router;