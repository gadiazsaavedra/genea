const Person = require('../models/person.model');
const Family = require('../models/family.model');

const statsController = {
  // Obtener estadísticas de una familia
  getFamilyStats: async (req, res) => {
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
      
      // Estadísticas generales
      const totalPersons = persons.length;
      const maleCount = persons.filter(p => p.gender === 'male').length;
      const femaleCount = persons.filter(p => p.gender === 'female').length;
      const otherGenderCount = totalPersons - maleCount - femaleCount;
      
      // Estadísticas de edad
      const currentYear = new Date().getFullYear();
      const ages = persons
        .filter(p => p.birthDate && !p.deathDate) // Solo personas vivas con fecha de nacimiento
        .map(p => {
          const birthYear = new Date(p.birthDate).getFullYear();
          return currentYear - birthYear;
        });
      
      const averageAge = ages.length > 0 
        ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length) 
        : 0;
      
      const oldestPerson = persons
        .filter(p => p.birthDate)
        .sort((a, b) => new Date(a.birthDate) - new Date(b.birthDate))[0] || null;
      
      const youngestPerson = persons
        .filter(p => p.birthDate)
        .sort((a, b) => new Date(b.birthDate) - new Date(a.birthDate))[0] || null;
      
      // Estadísticas de longevidad
      const deceasedPersons = persons.filter(p => p.deathDate && p.birthDate);
      const lifespans = deceasedPersons.map(p => {
        const birthYear = new Date(p.birthDate).getFullYear();
        const deathYear = new Date(p.deathDate).getFullYear();
        return deathYear - birthYear;
      });
      
      const averageLifespan = lifespans.length > 0 
        ? Math.round(lifespans.reduce((sum, age) => sum + age, 0) / lifespans.length) 
        : 0;
      
      // Estadísticas de nombres
      const firstNames = persons.map(p => p.firstName);
      const lastNames = persons.map(p => p.lastName);
      
      const firstNameFrequency = {};
      firstNames.forEach(name => {
        firstNameFrequency[name] = (firstNameFrequency[name] || 0) + 1;
      });
      
      const lastNameFrequency = {};
      lastNames.forEach(name => {
        lastNameFrequency[name] = (lastNameFrequency[name] || 0) + 1;
      });
      
      const mostCommonFirstName = Object.entries(firstNameFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
      
      const mostCommonLastName = Object.entries(lastNameFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
      
      // Estadísticas de lugares
      const birthPlaces = persons
        .filter(p => p.birthPlace)
        .map(p => p.birthPlace);
      
      const birthPlaceFrequency = {};
      birthPlaces.forEach(place => {
        birthPlaceFrequency[place] = (birthPlaceFrequency[place] || 0) + 1;
      });
      
      const mostCommonBirthPlaces = Object.entries(birthPlaceFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([place, count]) => ({ place, count }));
      
      // Estadísticas de generaciones
      const generations = new Set();
      persons.forEach(p => {
        if (p.generation !== undefined) {
          generations.add(p.generation);
        }
      });
      
      const generationCount = generations.size;
      
      // Estadísticas de relaciones
      const marriageCount = persons.reduce((count, person) => {
        return count + (person.spouses ? person.spouses.length : 0);
      }, 0) / 2; // Dividir por 2 porque cada matrimonio se cuenta dos veces
      
      // Devolver estadísticas
      res.status(200).json({
        general: {
          totalPersons,
          maleCount,
          femaleCount,
          otherGenderCount,
          generationCount,
          marriageCount
        },
        age: {
          averageAge,
          oldestPerson: oldestPerson ? {
            id: oldestPerson._id,
            name: `${oldestPerson.firstName} ${oldestPerson.lastName}`,
            birthDate: oldestPerson.birthDate
          } : null,
          youngestPerson: youngestPerson ? {
            id: youngestPerson._id,
            name: `${youngestPerson.firstName} ${youngestPerson.lastName}`,
            birthDate: youngestPerson.birthDate
          } : null,
          averageLifespan
        },
        names: {
          mostCommonFirstName,
          mostCommonLastName
        },
        places: {
          mostCommonBirthPlaces
        }
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ message: 'Error al obtener estadísticas', error: error.message });
    }
  }
};

module.exports = statsController;