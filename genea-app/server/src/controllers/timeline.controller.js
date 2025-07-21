const Person = require('../models/person.model');
const Family = require('../models/family.model');

const timelineController = {
  // Obtener línea temporal de una familia
  getFamilyTimeline: async (req, res) => {
    try {
      const { familyId } = req.params;
      
      // Verificar que el usuario tiene acceso a esta familia
      const family = await Family.findById(familyId);
      if (!family) {
        return res.status(404).json({ message: 'Familia no encontrada' });
      }
      
      const userId = req.user.uid;
      if (!family.members.includes(userId) && !family.admins.includes(userId) && !family.editors.includes(userId)) {
        return res.status(403).json({ message: 'No tienes acceso a esta familia' });
      }
      
      // Obtener todas las personas de la familia
      const persons = await Person.find({ familyId });
      
      // Crear eventos para la línea temporal
      const timelineEvents = [];
      
      // Eventos de nacimiento
      persons.forEach(person => {
        if (person.birthDate) {
          timelineEvents.push({
            date: new Date(person.birthDate),
            type: 'birth',
            personId: person._id,
            personName: `${person.firstName} ${person.lastName}`,
            description: `Nacimiento de ${person.firstName} ${person.lastName}`,
            place: person.birthPlace || 'Lugar desconocido'
          });
        }
      });
      
      // Eventos de matrimonio
      persons.forEach(person => {
        if (person.spouses && person.spouses.length > 0 && person.marriageDate) {
          person.spouses.forEach((spouseId, index) => {
            const spouse = persons.find(p => p._id.toString() === spouseId.toString());
            
            if (spouse) {
              // Evitar duplicados (solo añadir si la persona actual tiene ID menor que su cónyuge)
              if (person._id.toString() < spouseId.toString()) {
                timelineEvents.push({
                  date: new Date(person.marriageDate),
                  type: 'marriage',
                  personId: person._id,
                  personName: `${person.firstName} ${person.lastName}`,
                  spouseId: spouse._id,
                  spouseName: `${spouse.firstName} ${spouse.lastName}`,
                  description: `Matrimonio de ${person.firstName} ${person.lastName} y ${spouse.firstName} ${spouse.lastName}`,
                  place: person.marriagePlace || 'Lugar desconocido'
                });
              }
            }
          });
        }
      });
      
      // Eventos de fallecimiento
      persons.forEach(person => {
        if (person.deathDate) {
          timelineEvents.push({
            date: new Date(person.deathDate),
            type: 'death',
            personId: person._id,
            personName: `${person.firstName} ${person.lastName}`,
            description: `Fallecimiento de ${person.firstName} ${person.lastName}`,
            place: person.deathPlace || 'Lugar desconocido',
            age: person.birthDate ? Math.floor((new Date(person.deathDate) - new Date(person.birthDate)) / (1000 * 60 * 60 * 24 * 365.25)) : null
          });
        }
      });
      
      // Ordenar eventos por fecha
      timelineEvents.sort((a, b) => a.date - b.date);
      
      // Agrupar eventos por año
      const eventsByYear = {};
      timelineEvents.forEach(event => {
        const year = event.date.getFullYear();
        if (!eventsByYear[year]) {
          eventsByYear[year] = [];
        }
        eventsByYear[year].push(event);
      });
      
      // Convertir a formato de respuesta
      const timeline = Object.entries(eventsByYear).map(([year, events]) => ({
        year: parseInt(year),
        events
      })).sort((a, b) => a.year - b.year);
      
      res.status(200).json(timeline);
    } catch (error) {
      console.error('Error al obtener línea temporal:', error);
      res.status(500).json({ message: 'Error al obtener línea temporal', error: error.message });
    }
  },
  
  // Obtener línea temporal de una persona
  getPersonTimeline: async (req, res) => {
    try {
      const { personId } = req.params;
      
      // Obtener la persona
      const person = await Person.findById(personId);
      if (!person) {
        return res.status(404).json({ message: 'Persona no encontrada' });
      }
      
      // Verificar que el usuario tiene acceso a la familia de esta persona
      const family = await Family.findById(person.familyId);
      if (!family) {
        return res.status(404).json({ message: 'Familia no encontrada' });
      }
      
      const userId = req.user.uid;
      if (!family.members.includes(userId) && !family.admins.includes(userId) && !family.editors.includes(userId)) {
        return res.status(403).json({ message: 'No tienes acceso a esta familia' });
      }
      
      // Crear eventos para la línea temporal
      const timelineEvents = [];
      
      // Evento de nacimiento
      if (person.birthDate) {
        timelineEvents.push({
          date: new Date(person.birthDate),
          type: 'birth',
          description: `Nacimiento de ${person.firstName} ${person.lastName}`,
          place: person.birthPlace || 'Lugar desconocido'
        });
      }
      
      // Eventos de matrimonio
      if (person.spouses && person.spouses.length > 0 && person.marriageDate) {
        // Obtener cónyuges
        const spouses = await Person.find({ _id: { $in: person.spouses } });
        
        spouses.forEach((spouse, index) => {
          timelineEvents.push({
            date: new Date(person.marriageDate),
            type: 'marriage',
            spouseId: spouse._id,
            spouseName: `${spouse.firstName} ${spouse.lastName}`,
            description: `Matrimonio con ${spouse.firstName} ${spouse.lastName}`,
            place: person.marriagePlace || 'Lugar desconocido'
          });
        });
      }
      
      // Eventos de nacimiento de hijos
      if (person.children && person.children.length > 0) {
        // Obtener hijos
        const children = await Person.find({ _id: { $in: person.children } });
        
        children.forEach(child => {
          if (child.birthDate) {
            timelineEvents.push({
              date: new Date(child.birthDate),
              type: 'childBirth',
              childId: child._id,
              childName: `${child.firstName} ${child.lastName}`,
              description: `Nacimiento de su hijo/a ${child.firstName} ${child.lastName}`,
              place: child.birthPlace || 'Lugar desconocido'
            });
          }
        });
      }
      
      // Eventos de fallecimiento de padres
      if (person.parents && person.parents.length > 0) {
        // Obtener padres
        const parents = await Person.find({ _id: { $in: person.parents } });
        
        parents.forEach(parent => {
          if (parent.deathDate) {
            timelineEvents.push({
              date: new Date(parent.deathDate),
              type: 'parentDeath',
              parentId: parent._id,
              parentName: `${parent.firstName} ${parent.lastName}`,
              description: `Fallecimiento de su ${parent.gender === 'male' ? 'padre' : 'madre'} ${parent.firstName} ${parent.lastName}`,
              place: parent.deathPlace || 'Lugar desconocido'
            });
          }
        });
      }
      
      // Evento de fallecimiento
      if (person.deathDate) {
        timelineEvents.push({
          date: new Date(person.deathDate),
          type: 'death',
          description: `Fallecimiento de ${person.firstName} ${person.lastName}`,
          place: person.deathPlace || 'Lugar desconocido',
          age: person.birthDate ? Math.floor((new Date(person.deathDate) - new Date(person.birthDate)) / (1000 * 60 * 60 * 24 * 365.25)) : null
        });
      }
      
      // Ordenar eventos por fecha
      timelineEvents.sort((a, b) => a.date - b.date);
      
      res.status(200).json({
        personId: person._id,
        personName: `${person.firstName} ${person.lastName}`,
        events: timelineEvents
      });
    } catch (error) {
      console.error('Error al obtener línea temporal de persona:', error);
      res.status(500).json({ message: 'Error al obtener línea temporal', error: error.message });
    }
  }
};

module.exports = timelineController;