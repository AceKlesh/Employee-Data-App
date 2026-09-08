const express = require('express');
const sequelize = require('../config/database');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [roles] = await sequelize.query('SELECT id, name, description FROM roles ORDER BY id');
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching roles', error: error.message });
  }
});

module.exports = router;
