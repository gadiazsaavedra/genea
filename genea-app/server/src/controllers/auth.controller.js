const authService = require('../services/auth.service');

const authController = {
  // Registrar un nuevo usuario
  register: async (req, res) => {
    try {
      const { email, password, displayName } = req.body;
      
      // Validar datos
      if (!email || !password || !displayName) {
        return res.status(400).json({
          success: false,
          message: 'Faltan datos requeridos'
        });
      }
      
      // Registrar usuario
      const result = await authService.register(email, password, displayName);
      
      res.status(201).json({
        success: true,
        message: 'Usuario registrado correctamente',
        data: {
          token: result.token,
          user: result.user
        }
      });
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al registrar usuario',
        error: error.message
      });
    }
  },
  
  // Iniciar sesión
  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Validar datos
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Faltan datos requeridos'
        });
      }
      
      // Iniciar sesión
      const result = await authService.login(email, password);
      
      res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          token: result.token,
          user: result.user
        }
      });
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
        error: error.message
      });
    }
  },
  
  // Obtener perfil del usuario
  getProfile: async (req, res) => {
    try {
      res.status(200).json({
        success: true,
        data: {
          user: req.user
        }
      });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener perfil',
        error: error.message
      });
    }
  },
  
  // Actualizar perfil del usuario
  updateProfile: async (req, res) => {
    try {
      const { displayName, photoURL } = req.body;
      
      const updatedUser = await authService.updateProfile(req.user.uid, {
        displayName,
        photoURL
      });
      
      res.status(200).json({
        success: true,
        message: 'Perfil actualizado correctamente',
        data: {
          user: updatedUser
        }
      });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar perfil',
        error: error.message
      });
    }
  },
  
  // Cambiar contraseña
  changePassword: async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      // Validar datos
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Faltan datos requeridos'
        });
      }
      
      await authService.updatePassword(req.user.uid, currentPassword, newPassword);
      
      res.status(200).json({
        success: true,
        message: 'Contraseña actualizada correctamente'
      });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      res.status(400).json({
        success: false,
        message: 'Error al cambiar contraseña',
        error: error.message
      });
    }
  }
};

module.exports = authController;