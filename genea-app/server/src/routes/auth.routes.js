const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Rutas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rutas protegidas
router.get('/profile', authMiddleware.verifyToken, authController.getProfile);
router.put('/profile', authMiddleware.verifyToken, authController.updateProfile);
router.put('/change-password', authMiddleware.verifyToken, authController.changePassword);

module.exports = router;