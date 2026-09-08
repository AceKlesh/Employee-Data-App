const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department.controller');
const { createDepartmentValidation } = require('../validators/department.validator');
const validate = require('../middleware/validate.middleware');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');

router.get('/', departmentController.getAllDepartments);

router.post(
  '/',
  verifyToken,
  requireRole('Admin', 'HR Manager'),
  createDepartmentValidation,
  validate,
  departmentController.createDepartment
);

router.put('/:id', verifyToken, requireRole('Admin', 'HR Manager'), departmentController.updateDepartment);
router.delete('/:id', verifyToken, requireRole('Admin'), departmentController.deleteDepartment);

module.exports = router;