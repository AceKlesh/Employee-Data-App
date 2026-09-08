const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Employee = sequelize.define('Employee', {
  id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  firstName: { type: DataTypes.STRING(50), allowNull: false },
  lastName: { type: DataTypes.STRING(50), allowNull: false },
  email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  phone: { type: DataTypes.STRING(20), allowNull: true },
  dateOfBirth: { type: DataTypes.DATEONLY, allowNull: true },
  gender: { type: DataTypes.ENUM('male', 'female', 'other'), allowNull: true },
  address: { type: DataTypes.STRING(255), allowNull: true },
  jobTitle: { type: DataTypes.STRING(100), allowNull: false },
  departmentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  dateHired: { type: DataTypes.DATEONLY, allowNull: false },
  salary: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  profilePicture: { type: DataTypes.STRING(255), allowNull: true },
  status: { type: DataTypes.ENUM('active', 'on_leave', 'terminated'), allowNull: false, defaultValue: 'active' },
}, {
  tableName: 'employees',
  underscored: true,
  timestamps: true,
});

module.exports = Employee;