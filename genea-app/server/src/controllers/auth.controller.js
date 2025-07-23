const authService = require('../services/auth.service');
const { supabaseAdmin } = require('../config/supabase.config');

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
      // Obtener información adicional del usuario desde Supabase
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(req.user.uid);
      
      if (userError) throw new Error(userError.message);
      
      // Obtener membresías familiares del usuario
      const { data: familyMemberships, error: membershipsError } = await supabaseAdmin
        .from('family_members')
        .select(`
          id,
          family_id,
          role,
          joined_at,
          families:family_id (
            id,
            name,
            description
          )
        `)
        .eq('user_id', req.user.uid);
      
      if (membershipsError) throw new Error(membershipsError.message);
      
      // Formatear la respuesta
      const userProfile = {
        ...req.user,
        families: familyMemberships ? familyMemberships.map(membership => ({
          id: membership.family_id,
          name: membership.families.name,
          description: membership.families.description,
          role: membership.role,
          joinedAt: membership.joined_at
        })) : []
      };
      
      res.status(200).json({
        success: true,
        data: {
          user: userProfile
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
  },
  
  // Restablecer contraseña
  resetPassword: async (req, res) => {
    try {
      const { email } = req.body;
      
      // Validar datos
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'El correo electrónico es requerido'
        });
      }
      
      await authService.resetPassword(email);
      
      res.status(200).json({
        success: true,
        message: 'Se ha enviado un correo para restablecer la contraseña'
      });
    } catch (error) {
      console.error('Error al restablecer contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error al restablecer contraseña',
        error: error.message
      });
    }
  }
};

module.exports = authController;