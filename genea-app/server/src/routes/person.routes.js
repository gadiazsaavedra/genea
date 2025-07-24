const express = require('express');
const router = express.Router();
const personController = require('../controllers/person.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Rutas protegidas por autenticación
router.use(verifyToken);

// Rutas para personas
router.get('/', personController.getAllPersons);
router.get('/:id', personController.getPersonById);
router.post('/', personController.createPerson);
router.put('/:id', personController.updatePerson);
router.delete('/:id', personController.deletePerson);

// Rutas para relaciones familiares
router.post('/relation', personController.addRelation);
router.delete('/relation', personController.removeRelation);

// Ruta para obtener el árbol genealógico de una persona
router.get('/:id/tree', personController.getPersonTree);

module.exports = router;