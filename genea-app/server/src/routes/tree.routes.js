const express = require('express');
const router = express.Router();
const Person = require('../models/person.model');
const { verifyToken } = require('../middleware/auth.middleware');

// Proteger todas las rutas con autenticación
router.use(verifyToken);

// Obtener árbol genealógico a partir de una persona
router.get('/:personId', async (req, res) => {
  try {
    const { personId } = req.params;
    const { generations = 3, includeSpouses = true } = req.query;
    
    // Verificar si la persona existe
    const rootPerson = await Person.findById(personId);
    if (!rootPerson) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada'
      });
    }
    
    // Función recursiva para construir el árbol
    const buildTree = async (personId, currentGen, maxGen) => {
      if (currentGen > maxGen) return null;
      
      const person = await Person.findById(personId)
        .populate('parents')
        .populate('children')
        .populate('siblings')
        .populate({
          path: 'spouses.person',
          model: 'Person'
        });
      
      if (!person) return null;
      
      // Construir el nodo de la persona
      const personNode = {
        _id: person._id,
        fullName: person.fullName,
        birthDate: person.birthDate,
        deathDate: person.deathDate,
        profilePhoto: person.profilePhoto,
        isAlive: person.isAlive
      };
      
      // Agregar cónyuges si se solicitan
      if (includeSpouses && person.spouses && person.spouses.length > 0) {
        personNode.spouses = person.spouses.map(spouse => ({
          person: {
            _id: spouse.person._id,
            fullName: spouse.person.fullName,
            birthDate: spouse.person.birthDate,
            deathDate: spouse.person.deathDate,
            profilePhoto: spouse.person.profilePhoto,
            isAlive: spouse.person.isAlive
          },
          marriageDate: spouse.marriageDate,
          divorceDate: spouse.divorceDate,
          isCurrentSpouse: spouse.isCurrentSpouse
        }));
      }
      
      // Agregar hijos recursivamente
      if (person.children && person.children.length > 0) {
        const childrenPromises = person.children.map(child => 
          buildTree(child._id, currentGen + 1, maxGen)
        );
        
        const children = await Promise.all(childrenPromises);
        personNode.children = children.filter(child => child !== null);
      }
      
      return personNode;
    };
    
    // Construir el árbol a partir de la persona raíz
    const tree = await buildTree(personId, 1, parseInt(generations));
    
    res.status(200).json({
      success: true,
      data: tree
    });
  } catch (error) {
    console.error('Error al obtener el árbol genealógico:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el árbol genealógico',
      error: error.message
    });
  }
});

module.exports = router;