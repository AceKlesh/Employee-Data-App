const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  employeeId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  attendanceDate: { type: DataTypes.DATEONLY, allowNull: false },
  checkInTime: { type: DataTypes.TIME, allowNull: true },
  checkOutTime: { type: DataTypes.TIME, allowNull: true },
  status: { type: DataTypes.ENUM('present', 'absent', 'late', 'half_day'), allowNull: false, defaultValue: 'present' },
}, {
  tableName: 'attendance',
  underscored: true,
  timestamps: true,
});

module.exports = Attendance;