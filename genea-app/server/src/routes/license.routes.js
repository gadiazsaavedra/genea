const express = require('express');
const router = express.Router();
const licenseController = require('../controllers/license.controller');

// Rutas públicas
router.get('/info', licenseController.getLicenseInfo);
router.post('/request', licenseController.requestLicense);

module.exports = router;