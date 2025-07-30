const express = require('express');
const router = express.Router();
const relationshipController = require('../controllers/relationship.controller');
// const { authenticateToken } = require('../middleware/auth.middleware');

// TEMPORAL: Sin autenticación para debug
// router.use(authenticateToken);

// Rutas de relaciones
router.post('/', relationshipController.createRelationship);
router.get('/', relationshipController.getRelationshipsByFamily);

module.exports = router;