const User = require('../models/user.model');
const authService = require('../services/auth.service');

// Middleware para verificar la autenticación del usuario
exports.verifyToken = async (req, res, next) => {
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

    // Verificar el token JWT
    let decodedToken;
    try {
      decodedToken = authService.verifyToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado, token inválido'
      });
    }

    // Buscar al usuario en la base de datos
    let user = await User.findOne({ uid: decodedToken.uid });

    // Si el usuario no existe, crearlo
    if (!user) {
      user = new User({
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || decodedToken.email.split('@')[0],
        photoURL: decodedToken.picture || ''
      });
      await user.save();
    }

    // Actualizar la última vez que inició sesión
    user.lastLogin = Date.now();
    await user.save();

    // Agregar el usuario al objeto de solicitud
    req.user = user;
    
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