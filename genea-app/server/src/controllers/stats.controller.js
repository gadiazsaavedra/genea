const { supabaseClient } = require('../config/supabase.config');

const statsController = {
  // Obtener estadísticas generales del usuario
  getGeneralStats: async (req, res) => {
    try {
      console.log('Getting general stats for user:', req.user.uid);
      
      // Obtener todas las personas
      const { data: persons, error: personsError } = await supabaseClient
        .from('people')
        .select('*');
      
      console.log('Query result:', { persons: persons?.length, error: personsError });
      
      if (personsError) {
        console.error('Supabase error:', personsError);
        throw new Error(personsError.message);
      }
      
      // Estadísticas básicas
      const totalPersons = persons ? persons.length : 0;
      const maleCount = persons ? persons.filter(p => p.gender === 'male').length : 0;
      const femaleCount = persons ? persons.filter(p => p.gender === 'female').length : 0;
      const aliveCount = persons ? persons.filter(p => p.is_alive !== false).length : 0;
      const foundersCount = persons ? persons.filter(p => p.is_founder === true).length : 0;
      
      const result = {
        totalPersons,
        maleCount,
        femaleCount,
        aliveCount,
        foundersCount
      };
      
      console.log('Sending stats:', result);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al obtener estadísticas', 
        error: error.message 
      });
    }
  },

  // Obtener estadísticas de una familia
  getFamilyStats: async (req, res) => {
    try {
      const { familyId } = req.params;
      const userId = req.user.uid;
      
      // Verificar que el usuario tiene acceso a esta familia
      const { data: memberCheck, error: memberError } = await supabaseClient
        .from('family_members')
        .select('id')
        .eq('family_id', familyId)
        .eq('user_id', userId);
      
      if (memberError || !memberCheck || memberCheck.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta familia'
        });
      }
      
      // Obtener todas las personas de la familia
      const { data: persons, error: personsError } = await supabaseClient
        .from('people')
        .select('*')
        .eq('family_id', familyId);
      
      if (personsError) throw new Error(personsError.message);
      
      // Estadísticas generales
      const totalPersons = persons.length;
      const maleCount = persons.filter(p => p.gender === 'male').length;
      const femaleCount = persons.filter(p => p.gender === 'female').length;
      const otherGenderCount = totalPersons - maleCount - femaleCount;
      
      // Estadísticas de edad
      const currentYear = new Date().getFullYear();
      const ages = persons
        .filter(p => p.birth_date && !p.death_date) // Solo personas vivas con fecha de nacimiento
        .map(p => {
          const birthYear = new Date(p.birth_date).getFullYear();
          return currentYear - birthYear;
        });
      
      const averageAge = ages.length > 0 
        ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length) 
        : 0;
      
      const oldestPerson = persons
        .filter(p => p.birth_date)
        .sort((a, b) => new Date(a.birth_date) - new Date(b.birth_date))[0] || null;
      
      const youngestPerson = persons
        .filter(p => p.birth_date)
        .sort((a, b) => new Date(b.birth_date) - new Date(a.birth_date))[0] || null;
      
      // Estadísticas de longevidad
      const deceasedPersons = persons.filter(p => p.death_date && p.birth_date);
      const lifespans = deceasedPersons.map(p => {
        const birthYear = new Date(p.birth_date).getFullYear();
        const deathYear = new Date(p.death_date).getFullYear();
        return deathYear - birthYear;
      });
      
      const averageLifespan = lifespans.length > 0 
        ? Math.round(lifespans.reduce((sum, age) => sum + age, 0) / lifespans.length) 
        : 0;
      
      // Estadísticas de nombres
      const firstNames = persons.map(p => p.first_name);
      const lastNames = persons.map(p => p.last_name).filter(Boolean);
      
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
        .filter(p => p.birth_place)
        .map(p => p.birth_place);
      
      const birthPlaceFrequency = {};
      birthPlaces.forEach(place => {
        birthPlaceFrequency[place] = (birthPlaceFrequency[place] || 0) + 1;
      });
      
      const mostCommonBirthPlaces = Object.entries(birthPlaceFrequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([place, count]) => ({ place, count }));
      
      // Obtener relaciones para estadísticas de matrimonios
      const { data: relationships, error: relError } = await supabaseClient
        .from('relationships')
        .select('*')
        .eq('relationship_type', 'spouse')
        .in('person1_id', persons.map(p => p.id));
      
      if (relError) throw new Error(relError.message);
      
      // Contar matrimonios únicos
      const marriages = new Set();
      relationships.forEach(rel => {
        const ids = [rel.person1_id, rel.person2_id].sort().join('-');
        marriages.add(ids);
      });
      
      const marriageCount = marriages.size;
      
      // Devolver estadísticas
      res.status(200).json({
        success: true,
        data: {
          general: {
            totalPersons,
            maleCount,
            femaleCount,
            otherGenderCount,
            marriageCount
          },
          age: {
            averageAge,
            oldestPerson: oldestPerson ? {
              id: oldestPerson.id,
              name: `${oldestPerson.first_name} ${oldestPerson.last_name || ''}`.trim(),
              birthDate: oldestPerson.birth_date
            } : null,
            youngestPerson: youngestPerson ? {
              id: youngestPerson.id,
              name: `${youngestPerson.first_name} ${youngestPerson.last_name || ''}`.trim(),
              birthDate: youngestPerson.birth_date
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
        }
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al obtener estadísticas', 
        error: error.message 
      });
    }
  }
};

module.exports = statsController;