const { supabaseAdmin } = require('../config/supabase.config');
const authService = require('../services/auth.service');

const authMiddleware = async (req, res, next) => {
  try {
    // Verificar si hay un token de autenticación
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado, token no proporcionado'
      });
    }

    const token = authHeader.split(' ')[1];

    console.log('Received token:', token);
    
    // Verificar el token con Supabase directamente
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    console.log('=== AUTH MIDDLEWARE ===');
    console.log('Token received:', token.substring(0, 50) + '...');
    console.log('User data:', userData?.user?.id);
    console.log('User error:', userError);
    
    if (userError || !userData.user) {
      console.error('Auth error details:', userError);
      return res.status(401).json({
        success: false,
        message: 'No autorizado, token inválido',
        error: userError?.message
      });
    }
    
    console.log('Auth successful for user:', userData.user.id);

    // Agregar el usuario al objeto de solicitud
    req.user = {
      uid: userData.user.id,
      email: userData.user.email,
      displayName: userData.user.user_metadata?.displayName || userData.user.email.split('@')[0],
      photoURL: userData.user.user_metadata?.photoURL || null,
      emailVerified: userData.user.email_confirmed_at ? true : false
    };
    
    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    res.status(401).json({
      success: false,
      message: 'No autorizado',
      error: error.message
    });
  }
};

module.exports = { 
  verifyToken: authMiddleware,
  authenticateToken: authMiddleware 
};