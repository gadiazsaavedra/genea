const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { supabaseClient } = require('../config/supabase.config');

router.use(verifyToken);

// Obtener timeline simplificado
router.get('/', async (req, res) => {
  try {
    const timelineEvents = [];
    
    // Obtener eventos familiares
    const { data: events, error: eventsError } = await supabaseClient
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });
    
    if (!eventsError && events) {
      events.forEach(event => {
        timelineEvents.push({
          title: event.title,
          description: event.description,
          date: event.event_date,
          location: event.location,
          person_name: 'Familia',
          type: 'event'
        });
      });
    }
    
    // Obtener personas (nacimientos)
    const { data: persons, error: personsError } = await supabaseClient
      .from('people')
      .select('*')
      .order('birth_date', { ascending: true });
    
    if (!personsError && persons) {
      persons.forEach(person => {
        if (person.birth_date) {
          timelineEvents.push({
            title: `Nacimiento de ${person.first_name}`,
            description: `${person.first_name} ${person.last_name || ''} nació`,
            date: person.birth_date,
            location: person.birth_place,
            person_name: `${person.first_name} ${person.last_name || ''}`.trim(),
            type: 'birth'
          });
        }
      });
    }
    
    // Ordenar por fecha
    timelineEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    res.json({
      success: true,
      data: timelineEvents
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener timeline',
      error: error.message
    });
  }
});

module.exports = router;