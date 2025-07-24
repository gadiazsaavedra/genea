const express = require('express');
const router = express.Router();
const familyController = require('../controllers/family.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Rutas protegidas por autenticación
router.use(verifyToken);

// Rutas para familias
router.get('/', familyController.getAllFamilies);
router.get('/:id', familyController.getFamilyById);
router.post('/', familyController.createFamily);
router.put('/:id', familyController.updateFamily);
router.delete('/:id', familyController.deleteFamily);

// Ruta para agregar miembros a la familia
router.post('/member', familyController.addFamilyMember);

module.exports = router;