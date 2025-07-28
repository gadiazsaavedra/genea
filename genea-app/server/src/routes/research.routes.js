const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { supabaseClient } = require('../config/supabase.config');

router.use(verifyToken);

// Búsqueda simplificada en datos existentes
router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Query de búsqueda requerido'
      });
    }
    
    const searchTerm = query.trim().toLowerCase();
    const results = [];
    
    // Buscar en personas
    const { data: people, error: peopleError } = await supabaseClient
      .from('people')
      .select('*');
    
    if (!peopleError && people) {
      people.forEach(person => {
        const fullName = `${person.first_name} ${person.last_name || ''}`.toLowerCase();
        const birthPlace = (person.birth_place || '').toLowerCase();
        const deathPlace = (person.death_place || '').toLowerCase();
        
        if (fullName.includes(searchTerm) || 
            birthPlace.includes(searchTerm) || 
            deathPlace.includes(searchTerm)) {
          
          results.push({
            title: `👤 ${person.first_name} ${person.last_name || ''}`,
            description: `Persona en el árbol familiar. ${person.birth_date ? `Nacido: ${new Date(person.birth_date).toLocaleDateString()}` : ''}`,
            date: person.birth_date || 'Fecha desconocida',
            location: person.birth_place || person.death_place || 'Lugar desconocido',
            source: 'Base de datos familiar',
            confidence: fullName.includes(searchTerm) ? 95 : 75,
            type: 'person'
          });
        }
      });
    }
    
    // Buscar en eventos
    const { data: events, error: eventsError } = await supabaseClient
      .from('events')
      .select('*');
    
    if (!eventsError && events) {
      events.forEach(event => {
        const title = (event.title || '').toLowerCase();
        const description = (event.description || '').toLowerCase();
        const location = (event.location || '').toLowerCase();
        
        if (title.includes(searchTerm) || 
            description.includes(searchTerm) || 
            location.includes(searchTerm)) {
          
          results.push({
            title: `🎉 ${event.title}`,
            description: event.description || 'Evento familiar',
            date: event.event_date || 'Fecha desconocida',
            location: event.location || 'Lugar desconocido',
            source: 'Eventos familiares',
            confidence: title.includes(searchTerm) ? 90 : 70,
            type: 'event'
          });
        }
      });
    }
    
    // Ordenar por confianza
    results.sort((a, b) => b.confidence - a.confidence);
    
    res.json({
      success: true,
      data: results
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error en la búsqueda',
      error: error.message
    });
  }
});

module.exports = router;