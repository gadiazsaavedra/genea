const { supabaseClient } = require('../config/supabase.config');
const aiService = require('../services/ai.service');

const aiController = {
  // Obtener sugerencias de relaciones
  getRelationshipSuggestions: async (req, res) => {
    try {
      const { familyId } = req.params;
      const userId = req.user.uid;

      // Verificar acceso a la familia
      const { data: membership, error: memberError } = await supabaseClient
        .from('family_members')
        .select('*')
        .eq('family_id', familyId)
        .eq('user_id', userId)
        .single();

      if (memberError || !membership) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta familia'
        });
      }

      // Obtener personas de la familia
      const { data: people, error: peopleError } = await supabaseClient
        .from('people')
        .select('*')
        .eq('family_id', familyId);

      if (peopleError) throw peopleError;

      // Generar sugerencias con IA
      const suggestions = await aiService.suggestRelationships(people);

      // Filtrar relaciones ya existentes
      const { data: existingRelations, error: relError } = await supabaseClient
        .from('relationships')
        .select('person1_id, person2_id');

      if (!relError) {
        const existingPairs = new Set();
        existingRelations.forEach(rel => {
          existingPairs.add(`${rel.person1_id}-${rel.person2_id}`);
          existingPairs.add(`${rel.person2_id}-${rel.person1_id}`);
        });

        const filteredSuggestions = suggestions.filter(suggestion => 
          !existingPairs.has(`${suggestion.person1.id}-${suggestion.person2.id}`)
        );

        res.status(200).json({
          success: true,
          data: filteredSuggestions.slice(0, 10) // Top 10 sugerencias
        });
      } else {
        res.status(200).json({
          success: true,
          data: suggestions.slice(0, 10)
        });
      }

    } catch (error) {
      console.error('Error getting relationship suggestions:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo sugerencias de relaciones'
      });
    }
  },

  // Detectar duplicados
  detectDuplicates: async (req, res) => {
    try {
      const { familyId } = req.params;
      const userId = req.user.uid;

      // Verificar acceso
      const { data: membership, error: memberError } = await supabaseClient
        .from('family_members')
        .select('*')
        .eq('family_id', familyId)
        .eq('user_id', userId)
        .single();

      if (memberError || !membership) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta familia'
        });
      }

      // Obtener personas
      const { data: people, error: peopleError } = await supabaseClient
        .from('people')
        .select('*')
        .eq('family_id', familyId);

      if (peopleError) throw peopleError;

      // Detectar duplicados
      const duplicates = await aiService.detectDuplicates(people);

      res.status(200).json({
        success: true,
        data: duplicates
      });

    } catch (error) {
      console.error('Error detecting duplicates:', error);
      res.status(500).json({
        success: false,
        message: 'Error detectando duplicados'
      });
    }
  },

  // Aplicar sugerencia de relación
  applySuggestion: async (req, res) => {
    try {
      const { person1Id, person2Id, relationshipType } = req.body;
      const userId = req.user.uid;

      // Crear la relación
      const { data: relationship, error: relError } = await supabaseClient
        .from('relationships')
        .insert({
          person1_id: person1Id,
          person2_id: person2Id,
          relationship_type: relationshipType,
          created_by: userId,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (relError) throw relError;

      res.status(201).json({
        success: true,
        data: relationship,
        message: 'Relación creada correctamente'
      });

    } catch (error) {
      console.error('Error applying suggestion:', error);
      res.status(500).json({
        success: false,
        message: 'Error aplicando sugerencia'
      });
    }
  },

  // Rechazar sugerencia
  rejectSuggestion: async (req, res) => {
    try {
      const { person1Id, person2Id, reason } = req.body;
      const userId = req.user.uid;

      // Guardar rechazo para mejorar futuras sugerencias
      await supabaseClient
        .from('rejected_suggestions')
        .insert({
          person1_id: person1Id,
          person2_id: person2Id,
          rejected_by: userId,
          reason: reason,
          created_at: new Date().toISOString()
        });

      res.status(200).json({
        success: true,
        message: 'Sugerencia rechazada'
      });

    } catch (error) {
      console.error('Error rejecting suggestion:', error);
      res.status(500).json({
        success: false,
        message: 'Error rechazando sugerencia'
      });
    }
  },

  // Consulta general de IA
  query: async (req, res) => {
    try {
      const { question } = req.body;
      const userId = req.user.uid;

      // Obtener todas las personas del usuario
      const { data: people, error: peopleError } = await supabaseClient
        .from('people')
        .select('*');

      if (peopleError) throw peopleError;

      // Buscar información específica
      const searchResults = await aiService.searchFamilyData(people, question);
      
      let response = '';
      
      if (searchResults.length > 0) {
        response = `Encontré ${searchResults.length} resultado(s) relacionado(s) con "${question}":\n\n`;
        
        searchResults.slice(0, 5).forEach((result, index) => {
          response += `${index + 1}. ${result.person.name}\n`;
          if (result.person.birth_date) response += `   Nacimiento: ${result.person.birth_date}\n`;
          if (result.person.death_date) response += `   Fallecimiento: ${result.person.death_date}\n`;
          if (result.person.cause_of_death) response += `   Causa de muerte: ${result.person.cause_of_death}\n`;
          if (result.person.notes) response += `   Notas: ${result.person.notes}\n`;
          response += `\n`;
        });
      } else {
        response = `No encontré información específica sobre "${question}" en los datos familiares.\n\n`;
        response += `Estadísticas generales:\n`;
        response += `- Total de personas: ${people.length}\n`;
        response += `- Personas vivas: ${people.filter(p => !p.death_date).length}\n`;
        response += `- Personas fallecidas: ${people.filter(p => p.death_date).length}\n`;
      }

      res.status(200).json({
        success: true,
        data: { response }
      });

    } catch (error) {
      console.error('Error processing AI query:', error);
      res.status(500).json({
        success: false,
        message: 'Error procesando consulta de IA'
      });
    }
  }
};

module.exports = aiController;