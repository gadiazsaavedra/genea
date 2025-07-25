const express = require('express');
const router = express.Router();
const licenseController = require('../controllers/license.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Rutas públicas
router.get('/info', licenseController.getLicenseInfo);

// Rutas que requieren autenticación
router.post('/request', authenticateToken, licenseController.requestLicense);
router.post('/activate', licenseController.activateLicense); // Solo para admin

module.exports = router;