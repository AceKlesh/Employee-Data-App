const { Employee, Department } = require('../models');

// GET /api/employees
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.findAll({
      include: { model: Department, attributes: ['id', 'name'] },
    });
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employees', error: error.message });
  }
};

// GET /api/employees/:id
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: { model: Department, attributes: ['id', 'name'] },
    });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching employee', error: error.message });
  }
};

// POST /api/employees
exports.createEmployee = async (req, res) => {
  try {
    const {
      firstName, lastName, email, phone, dateOfBirth, gender,
      address, jobTitle, departmentId, dateHired, salary,
    } = req.body;

    const profilePicture = req.file ? `/uploads/profile-pictures/${req.file.filename}` : null;

    const department = await Department.findByPk(departmentId);
    if (!department) {
      return res.status(400).json({ message: 'Department does not exist' });
    }

    const newEmployee = await Employee.create({
      firstName, lastName, email, phone, dateOfBirth, gender,
      address, jobTitle, departmentId, dateHired, salary, profilePicture,
    });

    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(400).json({ message: 'Error creating employee', error: error.message });
  }
};
// PUT /api/employees/:id
exports.updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    const updatable = ['firstName','lastName','email','phone','dateOfBirth','gender','address','jobTitle','departmentId','dateHired','salary','status'];
    updatable.forEach((field) => {
      if (req.body[field] !== undefined) employee[field] = req.body[field];
    });

    await employee.save();
    res.status(200).json(employee);
  } catch (error) {
    res.status(400).json({ message: 'Error updating employee', error: error.message });
  }
};

// DELETE /api/employees/:id
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    await employee.destroy();
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error deleting employee', error: error.message });
  }
};