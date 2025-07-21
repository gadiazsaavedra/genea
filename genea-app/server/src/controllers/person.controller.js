const Person = require('../models/person.model');

// Obtener todas las personas
exports.getAllPersons = async (req, res) => {
  try {
    const { familyId, query, limit = 20, skip = 0 } = req.query;
    
    let filter = {};
    
    // Filtrar por familia si se proporciona un ID de familia
    if (familyId) {
      // Aquí se asume que hay una relación entre personas y familias
      // que se manejaría en una implementación más completa
    }
    
    // Búsqueda por nombre
    if (query) {
      filter.fullName = { $regex: query, $options: 'i' };
    }
    
    const persons = await Person.find(filter)
      .sort({ fullName: 1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
      
    const total = await Person.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: persons.length,
      total,
      data: persons
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las personas',
      error: error.message
    });
  }
};

// Obtener una persona por ID
exports.getPersonById = async (req, res) => {
  try {
    const person = await Person.findById(req.params.id)
      .populate('parents')
      .populate('children')
      .populate('siblings')
      .populate('spouses.person');
      
    if (!person) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada'
      });
    }
    
    res.status(200).json({
      success: true,
      data: person
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la persona',
      error: error.message
    });
  }
};

// Crear una nueva persona
exports.createPerson = async (req, res) => {
  try {
    const newPerson = new Person({
      ...req.body,
      createdBy: req.user._id // Asumiendo que el usuario está autenticado
    });
    
    const savedPerson = await newPerson.save();
    
    res.status(201).json({
      success: true,
      data: savedPerson
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al crear la persona',
      error: error.message
    });
  }
};

// Actualizar una persona
exports.updatePerson = async (req, res) => {
  try {
    const updatedPerson = await Person.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    if (!updatedPerson) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada'
      });
    }
    
    res.status(200).json({
      success: true,
      data: updatedPerson
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error al actualizar la persona',
      error: error.message
    });
  }
};

// Eliminar una persona
exports.deletePerson = async (req, res) => {
  try {
    const person = await Person.findById(req.params.id);
    
    if (!person) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada'
      });
    }
    
    // Eliminar referencias a esta persona en otras personas
    await Person.updateMany(
      { parents: person._id },
      { $pull: { parents: person._id } }
    );
    
    await Person.updateMany(
      { children: person._id },
      { $pull: { children: person._id } }
    );
    
    await Person.updateMany(
      { siblings: person._id },
      { $pull: { siblings: person._id } }
    );
    
    await Person.updateMany(
      { 'spouses.person': person._id },
      { $pull: { spouses: { person: person._id } } }
    );
    
    await person.remove();
    
    res.status(200).json({
      success: true,
      message: 'Persona eliminada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la persona',
      error: error.message
    });
  }
};

// Agregar una relación familiar
exports.addRelation = async (req, res) => {
  try {
    const { personId, relatedPersonId, relationType } = req.body;
    
    const person = await Person.findById(personId);
    const relatedPerson = await Person.findById(relatedPersonId);
    
    if (!person || !relatedPerson) {
      return res.status(404).json({
        success: false,
        message: 'Una o ambas personas no fueron encontradas'
      });
    }
    
    // Manejar diferentes tipos de relaciones
    switch (relationType) {
      case 'parent':
        if (!person.parents.includes(relatedPersonId)) {
          person.parents.push(relatedPersonId);
        }
        if (!relatedPerson.children.includes(personId)) {
          relatedPerson.children.push(personId);
        }
        break;
      case 'child':
        if (!person.children.includes(relatedPersonId)) {
          person.children.push(relatedPersonId);
        }
        if (!relatedPerson.parents.includes(personId)) {
          relatedPerson.parents.push(personId);
        }
        break;
      case 'sibling':
        if (!person.siblings.includes(relatedPersonId)) {
          person.siblings.push(relatedPersonId);
        }
        if (!relatedPerson.siblings.includes(personId)) {
          relatedPerson.siblings.push(personId);
        }
        break;
      case 'spouse':
        const { marriageDate, divorceDate, isCurrentSpouse } = req.body;
        
        // Verificar si ya existe la relación
        const existingSpouseIndex = person.spouses.findIndex(
          s => s.person.toString() === relatedPersonId
        );
        
        if (existingSpouseIndex === -1) {
          person.spouses.push({
            person: relatedPersonId,
            marriageDate,
            divorceDate,
            isCurrentSpouse: isCurrentSpouse !== undefined ? isCurrentSpouse : true
          });
        } else {
          // Actualizar la relación existente
          person.spouses[existingSpouseIndex] = {
            person: relatedPersonId,
            marriageDate: marriageDate || person.spouses[existingSpouseIndex].marriageDate,
            divorceDate: divorceDate || person.spouses[existingSpouseIndex].divorceDate,
            isCurrentSpouse: isCurrentSpouse !== undefined ? isCurrentSpouse : person.spouses[existingSpouseIndex].isCurrentSpouse
          };
        }
        
        const existingRelatedSpouseIndex = relatedPerson.spouses.findIndex(
          s => s.person.toString() === personId
        );
        
        if (existingRelatedSpouseIndex === -1) {
          relatedPerson.spouses.push({
            person: personId,
            marriageDate,
            divorceDate,
            isCurrentSpouse: isCurrentSpouse !== undefined ? isCurrentSpouse : true
          });
        } else {
          // Actualizar la relación existente
          relatedPerson.spouses[existingRelatedSpouseIndex] = {
            person: personId,
            marriageDate: marriageDate || relatedPerson.spouses[existingRelatedSpouseIndex].marriageDate,
            divorceDate: divorceDate || relatedPerson.spouses[existingRelatedSpouseIndex].divorceDate,
            isCurrentSpouse: isCurrentSpouse !== undefined ? isCurrentSpouse : relatedPerson.spouses[existingRelatedSpouseIndex].isCurrentSpouse
          };
        }
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Tipo de relación no válido'
        });
    }
    
    await person.save();
    await relatedPerson.save();
    
    res.status(200).json({
      success: true,
      message: 'Relación agregada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al agregar la relación',
      error: error.message
    });
  }
};

// Eliminar una relación familiar
exports.removeRelation = async (req, res) => {
  try {
    const { personId, relatedPersonId, relationType } = req.body;
    
    const person = await Person.findById(personId);
    const relatedPerson = await Person.findById(relatedPersonId);
    
    if (!person || !relatedPerson) {
      return res.status(404).json({
        success: false,
        message: 'Una o ambas personas no fueron encontradas'
      });
    }
    
    // Manejar diferentes tipos de relaciones
    switch (relationType) {
      case 'parent':
        person.parents = person.parents.filter(p => p.toString() !== relatedPersonId);
        relatedPerson.children = relatedPerson.children.filter(c => c.toString() !== personId);
        break;
      case 'child':
        person.children = person.children.filter(c => c.toString() !== relatedPersonId);
        relatedPerson.parents = relatedPerson.parents.filter(p => p.toString() !== personId);
        break;
      case 'sibling':
        person.siblings = person.siblings.filter(s => s.toString() !== relatedPersonId);
        relatedPerson.siblings = relatedPerson.siblings.filter(s => s.toString() !== personId);
        break;
      case 'spouse':
        person.spouses = person.spouses.filter(s => s.person.toString() !== relatedPersonId);
        relatedPerson.spouses = relatedPerson.spouses.filter(s => s.person.toString() !== personId);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Tipo de relación no válido'
        });
    }
    
    await person.save();
    await relatedPerson.save();
    
    res.status(200).json({
      success: true,
      message: 'Relación eliminada correctamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la relación',
      error: error.message
    });
  }
};

// Obtener el árbol genealógico de una persona
exports.getPersonTree = async (req, res) => {
  try {
    const { id } = req.params;
    const { generations = 3, includeSpouses = true } = req.query;
    
    // Verificar si la persona existe
    const rootPerson = await Person.findById(id);
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
      if (includeSpouses === 'true' && person.spouses && person.spouses.length > 0) {
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
    const tree = await buildTree(id, 1, parseInt(generations));
    
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
};