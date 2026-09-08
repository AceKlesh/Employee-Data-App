const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Leave = sequelize.define('Leave', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  employeeId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  leaveType: { type: DataTypes.ENUM('sick', 'casual', 'annual', 'unpaid'), allowNull: false },
  startDate: { type: DataTypes.DATEONLY, allowNull: false },
  endDate: { type: DataTypes.DATEONLY, allowNull: false },
  reason: { type: DataTypes.STRING(500), allowNull: true },
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), allowNull: false, defaultValue: 'pending' },
  approvedBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
}, {
  tableName: 'leaves',
  underscored: true,
  timestamps: true,
});

module.exports = Leave;