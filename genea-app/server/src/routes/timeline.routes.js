const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { supabaseClient } = require('../config/supabase.config');

router.use(verifyToken);

// Obtener timeline simplificado
router.get('/', async (req, res) => {
  try {
    const timelineEvents = [];
    
    // Obtener eventos familiares - solo eventos reales
    const { data: events, error: eventsError } = await supabaseClient
      .from('events')
      .select('*')
      .not('event_date', 'is', null)
      .order('event_date', { ascending: true });
    
    if (!eventsError && events && events.length > 0) {
      events.forEach(event => {
        timelineEvents.push({
          title: event.title,
          description: event.description || 'Evento familiar',
          date: event.event_date,
          location: event.location,
          person_name: 'Familia',
          type: 'event'
        });
      });
    }
    
    // Obtener personas (nacimientos) - solo si existen datos reales
    const { data: persons, error: personsError } = await supabaseClient
      .from('people')
      .select('*')
      .not('birth_date', 'is', null)
      .order('birth_date', { ascending: true });
    
    if (!personsError && persons && persons.length > 0) {
      persons.forEach(person => {
        timelineEvents.push({
          title: `Nacimiento de ${person.first_name}`,
          description: `${person.first_name} ${person.last_name || ''} nació`,
          date: person.birth_date,
          location: person.birth_place,
          person_name: `${person.first_name} ${person.last_name || ''}`.trim(),
          type: 'birth'
        });
      });
    }
    
    // Ordenar por fecha y filtrar eventos válidos
    const validEvents = timelineEvents.filter(event => event.date && event.date !== 'null');
    validEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    res.json({
      success: true,
      data: validEvents
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