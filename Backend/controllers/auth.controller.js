const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Employee, Role } = require('../models');

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { email, password, roleId, employeeId } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    if (employeeId) {
      const employee = await Employee.findByPk(employeeId);
      if (!employee) {
        return res.status(400).json({ message: 'Employee does not exist' });
      }
      const alreadyLinked = await User.findOne({ where: { employeeId } });
      if (alreadyLinked) {
        return res.status(409).json({ message: 'This employee already has an account' });
      }
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      roleId,
      employeeId: employeeId || null,
    });

    const { password: _omit, ...safeUser } = newUser.toJSON();
    res.status(201).json(safeUser);
  } catch (error) {
    res.status(400).json({ message: 'Error registering user', error: error.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email }, include: Role });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'This account has been deactivated' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, roleId: user.roleId, roleName: user.Role.name, employeeId: user.employeeId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.Role.name,
        employeeId: user.employeeId,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

// GET /api/auth/me
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      include: Role,
      attributes: { exclude: ['password'] },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      id: user.id,
      email: user.email,
      role: user.Role.name,
      employeeId: user.employeeId,
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
};

