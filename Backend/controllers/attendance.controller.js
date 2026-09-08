const { Attendance, Employee } = require('../models');

// GET /api/attendance
exports.getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.findAll({
      include: { model: Employee, attributes: ['id', 'firstName', 'lastName'] },
    });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
};

// GET /api/attendance/employee/:employeeId
exports.getAttendanceByEmployee = async (req, res) => {
  try {
    const records = await Attendance.findAll({
      where: { employeeId: req.params.employeeId },
      order: [['attendanceDate', 'DESC']],
    });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching attendance', error: error.message });
  }
};

// POST /api/attendance
exports.markAttendance = async (req, res) => {
  try {
    const { employeeId, attendanceDate, checkInTime, checkOutTime, status } = req.body;

    const employee = await Employee.findByPk(employeeId);
    if (!employee) {
      return res.status(400).json({ message: 'Employee does not exist' });
    }

    const existing = await Attendance.findOne({ where: { employeeId, attendanceDate } });
    if (existing) {
      return res.status(409).json({ message: 'Attendance already marked for this date' });
    }

    const record = await Attendance.create({
      employeeId, attendanceDate, checkInTime, checkOutTime, status,
    });

    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ message: 'Error marking attendance', error: error.message });
  }
};