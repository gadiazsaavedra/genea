const registroCivilService = require('../services/registroCivil.service');
const { supabaseClient } = require('../config/supabase.config');

const researchController = {
  // Buscar persona en registros públicos
  searchPublicRecords: async (req, res) => {
    try {
      const { dni, nombre, apellido, fechaNacimiento, paisOrigen, parroquia } = req.body;
      const userId = req.user.uid;

      const persona = {
        dni,
        nombre,
        apellido,
        fechaNacimiento,
        paisOrigen,
        parroquia
      };

      const resultado = await registroCivilService.busquedaCompleta(persona);

      // Guardar búsqueda en historial
      await supabaseClient
        .from('research_history')
        .insert({
          user_id: userId,
          search_params: persona,
          results: resultado,
          created_at: new Date().toISOString()
        });

      res.status(200).json({
        success: true,
        data: resultado
      });

    } catch (error) {
      console.error('Error en búsqueda de registros:', error);
      res.status(500).json({
        success: false,
        message: 'Error realizando búsqueda en registros públicos'
      });
    }
  },

  // Obtener historial de búsquedas
  getResearchHistory: async (req, res) => {
    try {
      const userId = req.user.uid;

      const { data: history, error } = await supabaseClient
        .from('research_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      res.status(200).json({
        success: true,
        data: history
      });

    } catch (error) {
      console.error('Error obteniendo historial:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo historial de búsquedas'
      });
    }
  },

  // Sugerir búsquedas basadas en datos existentes
  getSuggestions: async (req, res) => {
    try {
      const { familyId } = req.params;
      const userId = req.user.uid;

      // Obtener personas de la familia sin datos completos
      const { data: people, error } = await supabaseClient
        .from('people')
        .select('*')
        .eq('family_id', familyId);

      if (error) throw error;

      const suggestions = [];

      people.forEach(person => {
        const missing = [];
        
        if (!person.birth_date) missing.push('fecha de nacimiento');
        if (!person.birth_place) missing.push('lugar de nacimiento');
        if (!person.death_date && person.estimated_death) missing.push('fecha de defunción');
        if (!person.father_name) missing.push('nombre del padre');
        if (!person.mother_name) missing.push('nombre de la madre');

        if (missing.length > 0) {
          suggestions.push({
            person_id: person.id,
            person_name: `${person.first_name} ${person.last_name}`,
            missing_data: missing,
            search_priority: missing.length,
            suggested_sources: getSuggestedSources(person, missing)
          });
        }
      });

      // Ordenar por prioridad
      suggestions.sort((a, b) => b.search_priority - a.search_priority);

      res.status(200).json({
        success: true,
        data: suggestions.slice(0, 10) // Top 10 sugerencias
      });

    } catch (error) {
      console.error('Error generando sugerencias:', error);
      res.status(500).json({
        success: false,
        message: 'Error generando sugerencias de búsqueda'
      });
    }
  }
};

function getSuggestedSources(person, missingData) {
  const sources = [];

  if (missingData.includes('fecha de nacimiento') || missingData.includes('lugar de nacimiento')) {
    sources.push('Registro Civil');
    sources.push('Actas de Nacimiento');
  }

  if (missingData.includes('fecha de defunción')) {
    sources.push('Registro Civil');
    sources.push('Cementerios');
  }

  if (missingData.includes('nombre del padre') || missingData.includes('nombre de la madre')) {
    sources.push('Actas de Nacimiento');
    sources.push('Registros Parroquiales');
  }

  // Si la persona nació antes de 1950, sugerir archivos históricos
  if (person.birth_date && new Date(person.birth_date).getFullYear() < 1950) {
    sources.push('Archivo General de la Nación');
    sources.push('Registros de Inmigración');
  }

  return sources;
}

module.exports = researchController;