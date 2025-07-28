const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { supabaseClient } = require('../config/supabase.config');

router.use(verifyToken);

// Asistente IA simplificado
router.post('/query', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Pregunta requerida'
      });
    }
    
    const query = question.toLowerCase().trim();
    let response = '';
    
    // Obtener datos para análisis
    const { data: people } = await supabaseClient.from('people').select('*');
    const { data: events } = await supabaseClient.from('events').select('*');
    
    // Respuestas basadas en patrones
    if (query.includes('cuántas personas') || query.includes('cuántos miembros')) {
      response = `Tu árbol familiar tiene ${people?.length || 0} personas registradas.`;
      
    } else if (query.includes('apellido más común') || query.includes('apellidos frecuentes')) {
      const surnames = people?.map(p => p.last_name).filter(Boolean) || [];
      const counts = {};
      surnames.forEach(s => counts[s] = (counts[s] || 0) + 1);
      const mostCommon = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      response = mostCommon ? `El apellido más común es "${mostCommon[0]}" con ${mostCommon[1]} personas.` : 'No hay suficientes apellidos para analizar.';
      
    } else if (query.includes('eventos') || query.includes('cuántos eventos')) {
      response = `Hay ${events?.length || 0} eventos familiares registrados.`;
      
    } else if (query.includes('más viejo') || query.includes('mayor edad')) {
      const withBirthDate = people?.filter(p => p.birth_date) || [];
      if (withBirthDate.length > 0) {
        const oldest = withBirthDate.sort((a, b) => new Date(a.birth_date) - new Date(b.birth_date))[0];
        response = `La persona más antigua registrada es ${oldest.first_name} ${oldest.last_name || ''}, nacida el ${new Date(oldest.birth_date).toLocaleDateString()}.`;
      } else {
        response = 'No hay personas con fechas de nacimiento registradas.';
      }
      
    } else if (query.includes('lugar') && (query.includes('nacimiento') || query.includes('común'))) {
      const places = people?.map(p => p.birth_place).filter(Boolean) || [];
      const counts = {};
      places.forEach(p => counts[p] = (counts[p] || 0) + 1);
      const mostCommon = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      response = mostCommon ? `El lugar de nacimiento más común es "${mostCommon[0]}" con ${mostCommon[1]} personas.` : 'No hay suficientes lugares de nacimiento registrados.';
      
    } else if (query.includes('nombres más comunes') || query.includes('nombres frecuentes')) {
      const names = people?.map(p => p.first_name).filter(Boolean) || [];
      const counts = {};
      names.forEach(n => counts[n] = (counts[n] || 0) + 1);
      const mostCommon = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      response = mostCommon ? `El nombre más común es "${mostCommon[0]}" con ${mostCommon[1]} personas.` : 'No hay suficientes nombres para analizar.';
      
    } else if (query.includes('estadísticas') || query.includes('resumen')) {
      response = `📊 Resumen de tu árbol familiar:
• ${people?.length || 0} personas registradas
• ${events?.length || 0} eventos familiares
• ${people?.filter(p => p.birth_date).length || 0} personas con fecha de nacimiento
• ${people?.filter(p => p.birth_place).length || 0} personas con lugar de nacimiento`;
      
    } else {
      response = `🤔 No puedo responder esa pregunta específica. Puedo ayudarte con:
• ¿Cuántas personas hay en mi familia?
• ¿Cuál es el apellido más común?
• ¿Cuántos eventos hay registrados?
• ¿Quién es la persona más vieja?
• ¿Cuál es el lugar de nacimiento más común?
• Dame estadísticas de mi familia`;
    }
    
    res.json({
      success: true,
      data: { response }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error procesando consulta',
      error: error.message
    });
  }
});

module.exports = router;