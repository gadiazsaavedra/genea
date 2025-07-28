const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { supabaseClient } = require('../config/supabase.config');

router.use(verifyToken);

// Guardar layout del árbol
router.post('/', async (req, res) => {
  try {
    const { familyId, positions, connections } = req.body;
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

    // Guardar o actualizar layout
    const { data: existingLayout, error: checkError } = await supabaseClient
      .from('tree_layouts')
      .select('id')
      .eq('family_id', familyId)
      .single();

    let result;
    if (existingLayout) {
      // Actualizar existente
      const { data, error } = await supabaseClient
        .from('tree_layouts')
        .update({
          positions: JSON.stringify(positions),
          connections: JSON.stringify(connections || []),
          updated_at: new Date().toISOString(),
          updated_by: userId
        })
        .eq('id', existingLayout.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Crear nuevo
      const { data, error } = await supabaseClient
        .from('tree_layouts')
        .insert({
          family_id: familyId,
          positions: JSON.stringify(positions),
          connections: JSON.stringify(connections || []),
          created_by: userId
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    res.json({
      success: true,
      data: result,
      message: 'Layout guardado exitosamente'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al guardar layout',
      error: error.message
    });
  }
});

// Obtener layout del árbol
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

    // Obtener layout
    const { data: layout, error } = await supabaseClient
      .from('tree_layouts')
      .select('*')
      .eq('family_id', familyId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    if (layout) {
      layout.positions = JSON.parse(layout.positions || '{}');
      layout.connections = JSON.parse(layout.connections || '[]');
    }

    res.json({
      success: true,
      data: layout || null
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener layout',
      error: error.message
    });
  }
});

module.exports = router;