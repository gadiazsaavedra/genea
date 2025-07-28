const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { supabaseClient } = require('../config/supabase.config');
const { RELATIONSHIP_TYPES, RECIPROCAL_RELATIONSHIPS } = require('../utils/relationshipTypes');

router.use(verifyToken);

// Obtener tipos de relaciones disponibles
router.get('/types', (req, res) => {
  res.json({
    success: true,
    data: {
      types: RELATIONSHIP_TYPES,
      reciprocal: RECIPROCAL_RELATIONSHIPS
    }
  });
});

// Crear relación familiar
router.post('/', async (req, res) => {
  try {
    const { person1_id, person2_id, relationship_type, notes } = req.body;
    const userId = req.user.uid;

    if (!person1_id || !person2_id || !relationship_type) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos'
      });
    }

    // Verificar que el tipo de relación es válido
    if (!RELATIONSHIP_TYPES[relationship_type]) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de relación no válido'
      });
    }

    // Verificar que las personas existen y pertenecen a familias accesibles
    const { data: people, error: peopleError } = await supabaseClient
      .from('people')
      .select('id, family_id')
      .in('id', [person1_id, person2_id]);

    if (peopleError || !people || people.length !== 2) {
      return res.status(404).json({
        success: false,
        message: 'Una o ambas personas no encontradas'
      });
    }

    // Verificar acceso a las familias
    const familyIds = [...new Set(people.map(p => p.family_id))];
    const { data: memberships, error: memberError } = await supabaseClient
      .from('family_members')
      .select('family_id')
      .eq('user_id', userId)
      .in('family_id', familyIds);

    if (memberError || !memberships || memberships.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a estas familias'
      });
    }

    // Verificar si la relación ya existe
    const { data: existing, error: existingError } = await supabaseClient
      .from('relationships')
      .select('id')
      .or(`and(person1_id.eq.${person1_id},person2_id.eq.${person2_id}),and(person1_id.eq.${person2_id},person2_id.eq.${person1_id})`)
      .eq('relationship_type', relationship_type);

    if (existingError) throw existingError;

    if (existing && existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Esta relación ya existe'
      });
    }

    // Crear la relación principal
    const { data: relationship, error: relError } = await supabaseClient
      .from('relationships')
      .insert({
        person1_id,
        person2_id,
        relationship_type,
        notes,
        created_by: userId
      })
      .select()
      .single();

    if (relError) throw relError;

    // Crear la relación recíproca si existe
    const reciprocalType = RECIPROCAL_RELATIONSHIPS[relationship_type];
    if (reciprocalType && reciprocalType !== relationship_type) {
      await supabaseClient
        .from('relationships')
        .insert({
          person1_id: person2_id,
          person2_id: person1_id,
          relationship_type: reciprocalType,
          notes,
          created_by: userId
        });
    }

    res.status(201).json({
      success: true,
      data: relationship,
      message: 'Relación creada exitosamente'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear relación',
      error: error.message
    });
  }
});

// Obtener relaciones de una persona
router.get('/person/:personId', async (req, res) => {
  try {
    const { personId } = req.params;
    const userId = req.user.uid;

    // Verificar acceso a la persona
    const { data: person, error: personError } = await supabaseClient
      .from('people')
      .select('family_id')
      .eq('id', personId)
      .single();

    if (personError || !person) {
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada'
      });
    }

    // Verificar acceso a la familia
    const { data: membership, error: memberError } = await supabaseClient
      .from('family_members')
      .select('id')
      .eq('family_id', person.family_id)
      .eq('user_id', userId)
      .single();

    if (memberError || !membership) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta familia'
      });
    }

    // Obtener todas las relaciones de la persona
    const { data: relationships, error: relError } = await supabaseClient
      .from('relationships')
      .select(`
        *,
        person1:people!relationships_person1_id_fkey(id, first_name, last_name),
        person2:people!relationships_person2_id_fkey(id, first_name, last_name)
      `)
      .or(`person1_id.eq.${personId},person2_id.eq.${personId}`);

    if (relError) throw relError;

    // Organizar relaciones por categoría
    const organizedRelations = {};
    
    relationships.forEach(rel => {
      const isMainPerson = rel.person1_id === personId;
      const relatedPerson = isMainPerson ? rel.person2 : rel.person1;
      const relationType = rel.relationship_type;
      
      if (!organizedRelations[relationType]) {
        organizedRelations[relationType] = [];
      }
      
      organizedRelations[relationType].push({
        id: rel.id,
        person: relatedPerson,
        notes: rel.notes,
        created_at: rel.created_at
      });
    });

    res.json({
      success: true,
      data: {
        personId,
        relationships: organizedRelations,
        relationshipTypes: RELATIONSHIP_TYPES
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener relaciones',
      error: error.message
    });
  }
});

// Eliminar relación
router.delete('/:relationshipId', async (req, res) => {
  try {
    const { relationshipId } = req.params;
    const userId = req.user.uid;

    // Obtener la relación
    const { data: relationship, error: relError } = await supabaseClient
      .from('relationships')
      .select('*')
      .eq('id', relationshipId)
      .single();

    if (relError || !relationship) {
      return res.status(404).json({
        success: false,
        message: 'Relación no encontrada'
      });
    }

    // Verificar acceso (solo quien creó la relación puede eliminarla)
    if (relationship.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para eliminar esta relación'
      });
    }

    // Eliminar la relación
    const { error: deleteError } = await supabaseClient
      .from('relationships')
      .delete()
      .eq('id', relationshipId);

    if (deleteError) throw deleteError;

    // Eliminar la relación recíproca si existe
    const reciprocalType = RECIPROCAL_RELATIONSHIPS[relationship.relationship_type];
    if (reciprocalType && reciprocalType !== relationship.relationship_type) {
      await supabaseClient
        .from('relationships')
        .delete()
        .eq('person1_id', relationship.person2_id)
        .eq('person2_id', relationship.person1_id)
        .eq('relationship_type', reciprocalType);
    }

    res.json({
      success: true,
      message: 'Relación eliminada exitosamente'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar relación',
      error: error.message
    });
  }
});

module.exports = router;