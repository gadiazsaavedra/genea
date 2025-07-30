const express = require('express');
const router = express.Router();
const researchController = require('../controllers/research.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkLicense } = require('../middleware/license.middleware');

// Todas las rutas requieren autenticación y licencia
router.use(authenticateToken);
router.use(checkLicense);

// Buscar en registros públicos
router.post('/search', researchController.searchPublicRecords);

// Obtener historial de búsquedas
router.get('/history', researchController.getResearchHistory);

// Obtener sugerencias de búsqueda
router.get('/suggestions/:familyId', researchController.getSuggestions);

module.exports = router;