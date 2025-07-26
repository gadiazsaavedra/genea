const { supabaseClient } = require('../config/supabase.config');

// Crear una relación
exports.createRelationship = async (req, res) => {
  try {
    const { person1_id, person2_id, relationship_type } = req.body;
    
    console.log('Creating relationship:', { person1_id, person2_id, relationship_type });
    
    if (!person1_id || !person2_id || !relationship_type) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos'
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
    
    // Obtener todas las relaciones de personas de esta familia
    const { data, error } = await supabaseClient
      .from('relationships')
      .select(`
        *,
        person1:people!relationships_person1_id_fkey(id, first_name, last_name, family_id),
        person2:people!relationships_person2_id_fkey(id, first_name, last_name, family_id)
      `)
      .or(`person1.family_id.eq.${familyId},person2.family_id.eq.${familyId}`);
    
    if (error) {
      console.error('Error getting relationships:', error);
      return res.status(400).json({
        success: false,
        message: 'Error en base de datos',
        error: error.message
      });
    }
    
    // Filtrar solo relaciones donde ambas personas pertenecen a la familia
    const familyRelationships = (data || []).filter(rel => 
      rel.person1?.family_id === familyId && rel.person2?.family_id === familyId
    );
    
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