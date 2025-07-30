const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { authenticateToken } = require('../middleware/auth.middleware');
const { checkLicense } = require('../middleware/license.middleware');

// Todas las rutas requieren autenticación y licencia
router.use(authenticateToken);
router.use(checkLicense);

// Obtener sugerencias de relaciones
router.get('/suggestions/relationships/:familyId', aiController.getRelationshipSuggestions);

// Detectar duplicados
router.get('/duplicates/:familyId', aiController.detectDuplicates);

// Aplicar sugerencia
router.post('/suggestions/apply', aiController.applySuggestion);

// Rechazar sugerencia
router.post('/suggestions/reject', aiController.rejectSuggestion);

module.exports = router;