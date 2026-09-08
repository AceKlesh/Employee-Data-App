const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { registerValidation } = require('../validators/auth.validator');
const validate = require('../middleware/validate.middleware');
const { verifyToken } = require('../middleware/auth.middleware');


router.post('/register', registerValidation, validate, authController.register);
router.post('/login', authController.login);
router.get('/me', verifyToken, authController.getCurrentUser);

module.exports = router;