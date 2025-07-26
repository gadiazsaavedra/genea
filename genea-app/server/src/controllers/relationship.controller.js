const { supabaseClient } = require('../config/supabase.config');

// Crear una relación - SIMPLIFICADO
exports.createRelationship = async (req, res) => {
  try {
    const { person1_id, person2_id, relationship_type } = req.body;
    
    console.log('Creating relationship:', { person1_id, person2_id, relationship_type });
    
    if (!person1_id || !person2_id || !relationship_type) {
      console.log('Missing required data');
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos: person1_id, person2_id, relationship_type'
      });
    }
    
    const { data, error } = await supabaseClient
      .from('relationships')
      .insert({
        person1_id,
        person2_id,
        relationship_type
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating relationship:', error);
      return res.status(400).json({
        success: false,
        message: 'Error en base de datos',
        error: error.message
      });
    }
    
    res.status(201).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno',
      error: error.message
    });
  }
};

// Obtener relaciones por familia
exports.getRelationshipsByFamily = async (req, res) => {
  try {
    const { familyId } = req.query;
    
    if (!familyId) {
      return res.status(400).json({
        success: false,
        message: 'ID de familia requerido'
      });
    }
    
    // Obtener IDs de personas de esta familia primero
    const { data: familyPeople, error: peopleError } = await supabaseClient
      .from('people')
      .select('id')
      .eq('family_id', familyId);
    
    if (peopleError) {
      console.error('Error getting family people:', peopleError);
      return res.status(400).json({
        success: false,
        message: 'Error obteniendo personas de la familia',
        error: peopleError.message
      });
    }
    
    const personIds = (familyPeople || []).map(p => p.id);
    
    if (personIds.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    // Obtener relaciones donde ambas personas pertenecen a la familia
    const { data, error } = await supabaseClient
      .from('relationships')
      .select('*')
      .in('person1_id', personIds)
      .in('person2_id', personIds);
    
    if (error) {
      console.error('Error getting relationships:', error);
      return res.status(400).json({
        success: false,
        message: 'Error en base de datos',
        error: error.message
      });
    }
    
    const familyRelationships = data || [];
    
    res.json({
      success: true,
      data: familyRelationships
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno',
      error: error.message
    });
  }
};