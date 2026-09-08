const { Department } = require('../models');

// GET /api/departments
exports.getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.findAll();
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments', error: error.message });
  }
};

// POST /api/departments
exports.createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    const newDepartment = await Department.create({ name, description });
    res.status(201).json(newDepartment);
  } catch (error) {
    res.status(400).json({ message: 'Error creating department', error: error.message });
  }
};
// PUT /api/departments/:id
exports.updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) return res.status(404).json({ message: 'Department not found' });

    const { name, description } = req.body;
    if (name !== undefined) department.name = name;
    if (description !== undefined) department.description = description;

    await department.save();
    res.status(200).json(department);
  } catch (error) {
    res.status(400).json({ message: 'Error updating department', error: error.message });
  }
};

// DELETE /api/departments/:id
exports.deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) return res.status(404).json({ message: 'Department not found' });

    await department.destroy();
    res.status(200).json({ message: 'Department deleted successfully' });
  } catch (error) {
    // Catches the ON DELETE RESTRICT constraint if employees still reference this department
    res.status(409).json({ message: 'Cannot delete a department with employees assigned to it' });
  }
};