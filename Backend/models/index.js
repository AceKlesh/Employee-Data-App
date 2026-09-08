const sequelize = require('../config/database');
const Role = require('./role.model');
const Department = require('./department.model');
const Employee = require('./employee.model');
const User = require('./user.model');
const Attendance = require('./attendance.model');
const Leave = require('./leave.model');

// Department <-> Employee (one-to-many)
Department.hasMany(Employee, { foreignKey: 'departmentId', onDelete: 'RESTRICT' });
Employee.belongsTo(Department, { foreignKey: 'departmentId' });

// Role <-> User (one-to-many)
Role.hasMany(User, { foreignKey: 'roleId', onDelete: 'RESTRICT' });
User.belongsTo(Role, { foreignKey: 'roleId' });

// Employee <-> User (one-to-one)
Employee.hasOne(User, { foreignKey: 'employeeId', onDelete: 'SET NULL' });
User.belongsTo(Employee, { foreignKey: 'employeeId' });

// Employee <-> Attendance (one-to-many)
Employee.hasMany(Attendance, { foreignKey: 'employeeId', onDelete: 'CASCADE' });
Attendance.belongsTo(Employee, { foreignKey: 'employeeId' });

// Employee <-> Leave (one-to-many)
Employee.hasMany(Leave, { foreignKey: 'employeeId', onDelete: 'CASCADE' });
Leave.belongsTo(Employee, { foreignKey: 'employeeId' });

// User <-> Leave (approver, one-to-many)
User.hasMany(Leave, { foreignKey: 'approvedBy', onDelete: 'SET NULL' });
Leave.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

module.exports = {
  sequelize,
  Role,
  Department,
  Employee,
  User,
  Attendance,
  Leave,
};