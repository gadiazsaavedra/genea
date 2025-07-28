const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.middleware');
const { supabaseClient } = require('../config/supabase.config');

router.use(verifyToken);

// Obtener timeline - solo datos reales sin mock
router.get('/', async (req, res) => {
  try {
    // Devolver array vacío - sin datos mock
    res.json({
      success: true,
      data: []
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