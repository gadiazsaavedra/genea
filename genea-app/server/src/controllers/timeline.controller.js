const { supabaseClient } = require('../config/supabase.config');

const timelineController = {
  // Obtener línea temporal de una familia
  getFamilyTimeline: async (req, res) => {
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
      
      // Crear eventos para la línea temporal
      const timelineEvents = [];
      
      // Eventos de nacimiento
      persons.forEach(person => {
        if (person.birth_date) {
          timelineEvents.push({
            date: new Date(person.birth_date),
            type: 'birth',
            personId: person.id,
            personName: `${person.first_name} ${person.last_name || ''}`.trim(),
            description: `Nacimiento de ${person.first_name} ${person.last_name || ''}`.trim(),
            place: person.birth_place || 'Lugar desconocido'
          });
        }
      });
      
      // Obtener relaciones para matrimonios
      const { data: marriages, error: marriagesError } = await supabaseClient
        .from('relationships')
        .select('*')
        .eq('relationship_type', 'spouse')
        .in('person1_id', persons.map(p => p.id));
      
      if (marriagesError) throw new Error(marriagesError.message);
      
      // Eventos de matrimonio
      const processedMarriages = new Set();
      
      marriages.forEach(marriage => {
        // Evitar duplicados
        const marriageKey = [marriage.person1_id, marriage.person2_id].sort().join('-');
        if (processedMarriages.has(marriageKey)) return;
        processedMarriages.add(marriageKey);
        
        const person1 = persons.find(p => p.id === marriage.person1_id);
        const person2 = persons.find(p => p.id === marriage.person2_id);
        
        if (person1 && person2 && marriage.marriage_date) {
          timelineEvents.push({
            date: new Date(marriage.marriage_date),
            type: 'marriage',
            personId: person1.id,
            personName: `${person1.first_name} ${person1.last_name || ''}`.trim(),
            spouseId: person2.id,
            spouseName: `${person2.first_name} ${person2.last_name || ''}`.trim(),
            description: `Matrimonio de ${person1.first_name} ${person1.last_name || ''} y ${person2.first_name} ${person2.last_name || ''}`.trim(),
            place: marriage.marriage_place || 'Lugar desconocido'
          });
        }
      });
      
      // Eventos de fallecimiento
      persons.forEach(person => {
        if (person.death_date) {
          const birthDate = person.birth_date ? new Date(person.birth_date) : null;
          const deathDate = new Date(person.death_date);
          
          timelineEvents.push({
            date: deathDate,
            type: 'death',
            personId: person.id,
            personName: `${person.first_name} ${person.last_name || ''}`.trim(),
            description: `Fallecimiento de ${person.first_name} ${person.last_name || ''}`.trim(),
            place: person.death_place || 'Lugar desconocido',
            age: birthDate ? Math.floor((deathDate - birthDate) / (1000 * 60 * 60 * 24 * 365.25)) : null
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
      
      res.status(200).json({
        success: true,
        data: timeline
      });
    } catch (error) {
      console.error('Error al obtener línea temporal:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al obtener línea temporal', 
        error: error.message 
      });
    }
  },
  
  // Obtener línea temporal de una persona
  getPersonTimeline: async (req, res) => {
    try {
      const { personId } = req.params;
      const userId = req.user.uid;
      
      // Obtener la persona y verificar acceso
      const { data: person, error: personError } = await supabaseClient
        .from('people')
        .select('*, families:family_id(*)')
        .eq('id', personId)
        .single();
      
      if (personError || !person) {
        return res.status(404).json({ 
          success: false,
          message: 'Persona no encontrada' 
        });
      }
      
      // Verificar que el usuario tiene acceso a la familia
      const { data: memberCheck, error: memberError } = await supabaseClient
        .from('family_members')
        .select('id')
        .eq('family_id', person.family_id)
        .eq('user_id', userId);
      
      if (memberError || !memberCheck || memberCheck.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta persona'
        });
      }
      
      // Crear eventos para la línea temporal
      const timelineEvents = [];
      
      // Evento de nacimiento
      if (person.birth_date) {
        timelineEvents.push({
          date: new Date(person.birth_date),
          type: 'birth',
          description: `Nacimiento de ${person.first_name} ${person.last_name || ''}`.trim(),
          place: person.birth_place || 'Lugar desconocido'
        });
      }
      
      // Obtener relaciones
      const { data: relationships, error: relError } = await supabaseClient
        .from('relationships')
        .select('*, people1:person1_id(*), people2:person2_id(*)')
        .or(`person1_id.eq.${personId},person2_id.eq.${personId}`);
      
      if (relError) throw new Error(relError.message);
      
      // Eventos de matrimonio
      const spouseRelationships = relationships.filter(rel => rel.relationship_type === 'spouse');
      
      spouseRelationships.forEach(rel => {
        const spouse = rel.person1_id === personId ? rel.people2 : rel.people1;
        
        if (spouse && rel.marriage_date) {
          timelineEvents.push({
            date: new Date(rel.marriage_date),
            type: 'marriage',
            spouseId: spouse.id,
            spouseName: `${spouse.first_name} ${spouse.last_name || ''}`.trim(),
            description: `Matrimonio con ${spouse.first_name} ${spouse.last_name || ''}`.trim(),
            place: rel.marriage_place || 'Lugar desconocido'
          });
        }
      });
      
      // Eventos de nacimiento de hijos
      const childRelationships = relationships.filter(rel => 
        (rel.relationship_type === 'parent' && rel.person1_id === personId) || 
        (rel.relationship_type === 'child' && rel.person2_id === personId)
      );
      
      childRelationships.forEach(rel => {
        const child = rel.relationship_type === 'parent' ? rel.people2 : rel.people1;
        
        if (child && child.birth_date) {
          timelineEvents.push({
            date: new Date(child.birth_date),
            type: 'childBirth',
            childId: child.id,
            childName: `${child.first_name} ${child.last_name || ''}`.trim(),
            description: `Nacimiento de su hijo/a ${child.first_name} ${child.last_name || ''}`.trim(),
            place: child.birth_place || 'Lugar desconocido'
          });
        }
      });
      
      // Eventos de fallecimiento de padres
      const parentRelationships = relationships.filter(rel => 
        (rel.relationship_type === 'parent' && rel.person2_id === personId) || 
        (rel.relationship_type === 'child' && rel.person1_id === personId)
      );
      
      parentRelationships.forEach(rel => {
        const parent = rel.relationship_type === 'parent' ? rel.people1 : rel.people2;
        
        if (parent && parent.death_date) {
          timelineEvents.push({
            date: new Date(parent.death_date),
            type: 'parentDeath',
            parentId: parent.id,
            parentName: `${parent.first_name} ${parent.last_name || ''}`.trim(),
            description: `Fallecimiento de su ${parent.gender === 'male' ? 'padre' : 'madre'} ${parent.first_name} ${parent.last_name || ''}`.trim(),
            place: parent.death_place || 'Lugar desconocido'
          });
        }
      });
      
      // Evento de fallecimiento
      if (person.death_date) {
        const birthDate = person.birth_date ? new Date(person.birth_date) : null;
        const deathDate = new Date(person.death_date);
        
        timelineEvents.push({
          date: deathDate,
          type: 'death',
          description: `Fallecimiento de ${person.first_name} ${person.last_name || ''}`.trim(),
          place: person.death_place || 'Lugar desconocido',
          age: birthDate ? Math.floor((deathDate - birthDate) / (1000 * 60 * 60 * 24 * 365.25)) : null
        });
      }
      
      // Ordenar eventos por fecha
      timelineEvents.sort((a, b) => a.date - b.date);
      
      res.status(200).json({
        success: true,
        data: {
          personId: person.id,
          personName: `${person.first_name} ${person.last_name || ''}`.trim(),
          events: timelineEvents
        }
      });
    } catch (error) {
      console.error('Error al obtener línea temporal de persona:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al obtener línea temporal', 
        error: error.message 
      });
    }
  }
};

module.exports = timelineController;