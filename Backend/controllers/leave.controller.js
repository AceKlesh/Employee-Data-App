const { Leave, Employee, User } = require('../models');

// GET /api/leaves
exports.getAllLeaves = async (req, res) => {
  try {
    const isManager = ['Admin', 'HR Manager', 'Department Manager'].includes(req.user.roleName);
    const whereClause = isManager ? {} : { employeeId: req.user.employeeId };

    const leaves = await Leave.findAll({
      where: whereClause,
      include: [
        { model: Employee, attributes: ['id', 'firstName', 'lastName'] },
        { model: User, as: 'approver', attributes: ['id', 'email'] },
      ],
    });
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaves', error: error.message });
  }
};

// GET /api/leaves/employee/:employeeId
exports.getLeavesByEmployee = async (req, res) => {
  try {
    const leaves = await Leave.findAll({
      where: { employeeId: req.params.employeeId },
      order: [['startDate', 'DESC']],
    });
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leaves', error: error.message });
  }
};

// POST /api/leaves
exports.requestLeave = async (req, res) => {
  try {
    const { employeeId, leaveType, startDate, endDate, reason } = req.body;

    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(400).json({ message: 'Employee does not exist' });
    }

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ message: 'End date cannot be before start date' });
    }

    const leave = await Leave.create({
      employeeId, leaveType, startDate, endDate, reason, status: 'pending',
    });

    res.status(201).json(leave);
  } catch (error) {
    res.status(400).json({ message: 'Error requesting leave', error: error.message });
  }
};

// PATCH /api/leaves/:id/status
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const leave = await Leave.findByPk(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }
    if (leave.status !== 'pending') {
      return res.status(409).json({ message: 'This leave request has already been processed' });
    }

    leave.status = status;
    leave.approvedBy = req.user.userId;
    await leave.save();

    res.status(200).json(leave);
  } catch (error) {
    res.status(400).json({ message: 'Error updating leave status', error: error.message });
  }
};