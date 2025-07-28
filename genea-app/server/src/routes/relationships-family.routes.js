const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { supabaseClient } = require('../config/supabase.config');

router.use(verifyToken);

// Obtener todas las relaciones de una familia específica
router.get('/family/:familyId', async (req, res) => {
  try {
    const { familyId } = req.params;
    const userId = req.user.uid;

    // Verificar acceso a la familia
    const { data: membership, error: memberError } = await supabaseClient
      .from('family_members')
      .select('id')
      .eq('family_id', familyId)
      .eq('user_id', userId)
      .single();

    if (memberError || !membership) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta familia'
      });
    }

    // Obtener todas las personas de la familia
    const { data: people, error: peopleError } = await supabaseClient
      .from('people')
      .select('id')
      .eq('family_id', familyId);

    if (peopleError) throw peopleError;

    if (!people || people.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }

    const personIds = people.map(p => p.id);

    // Obtener todas las relaciones donde ambas personas pertenecen a la familia
    const { data: relationships, error: relError } = await supabaseClient
      .from('relationships')
      .select('*')
      .in('person1_id', personIds)
      .in('person2_id', personIds);

    if (relError) throw relError;

    res.json({
      success: true,
      data: relationships || []
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener relaciones de la familia',
      error: error.message
    });
  }
});

module.exports = router;