const express = require('express');
const router = express.Router();
const gedcomController = require('../controllers/gedcom.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware.verifyToken);

// Exportar árbol genealógico en formato GEDCOM
router.get('/export/:familyId', gedcomController.exportGedcom);

module.exports = router;