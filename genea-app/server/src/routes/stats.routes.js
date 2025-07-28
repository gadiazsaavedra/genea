const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware.verifyToken);

// Obtener estadísticas generales
router.get('/', statsController.getGeneralStats);

// Obtener estadísticas de una familia
router.get('/:familyId', statsController.getFamilyStats);

module.exports = router;