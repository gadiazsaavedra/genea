const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase.config');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('ERROR: JWT_SECRET no está definido en las variables de entorno');
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const authService = {
  // Registrar un nuevo usuario
  async register(email, password, displayName) {
    try {
      // Registrar usuario en Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        user_metadata: { displayName }
      });

      if (authError) throw new Error(authError.message);

      // Generar token JWT personalizado
      const token = jwt.sign(
        { 
          uid: authData.user.id,
          email: authData.user.email,
          displayName: authData.user.user_metadata.displayName
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return {
        token,
        user: {
          uid: authData.user.id,
          email: authData.user.email,
          displayName: authData.user.user_metadata.displayName,
          photoURL: authData.user.user_metadata.photoURL || null,
          emailVerified: authData.user.email_confirmed_at ? true : false
        }
      };
    } catch (error) {
      throw error;
    }
  },

  // Iniciar sesión
  async login(email, password) {
    try {
      // Iniciar sesión con Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw new Error(authError.message);

      // Generar token JWT personalizado
      const token = jwt.sign(
        { 
          uid: authData.user.id,
          email: authData.user.email,
          displayName: authData.user.user_metadata.displayName || email.split('@')[0]
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return {
        token,
        user: {
          uid: authData.user.id,
          email: authData.user.email,
          displayName: authData.user.user_metadata.displayName || email.split('@')[0],
          photoURL: authData.user.user_metadata.photoURL || null,
          emailVerified: authData.user.email_confirmed_at ? true : false
        }
      };
    } catch (error) {
      throw error;
    }
  },

  // Verificar token
  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Token inválido');
    }
  },

  // Actualizar perfil de usuario
  async updateProfile(userId, data) {
    try {
      // Obtener usuario actual
      const { data: userData, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
      
      if (getUserError) throw new Error(getUserError.message);
      if (!userData) throw new Error('Usuario no encontrado');

      // Preparar datos para actualizar
      const userMetadata = {
        ...userData.user.user_metadata,
        displayName: data.displayName || userData.user.user_metadata.displayName,
        photoURL: data.photoURL || userData.user.user_metadata.photoURL
      };

      // Actualizar usuario
      const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { user_metadata: userMetadata }
      );

      if (updateError) throw new Error(updateError.message);

      return {
        uid: updatedUser.user.id,
        email: updatedUser.user.email,
        displayName: updatedUser.user.user_metadata.displayName,
        photoURL: updatedUser.user.user_metadata.photoURL,
        emailVerified: updatedUser.user.email_confirmed_at ? true : false
      };
    } catch (error) {
      throw error;
    }
  },

  // Cambiar contraseña
  async updatePassword(userId, currentPassword, newPassword) {
    try {
      // Primero verificamos las credenciales actuales
      const { data: userData, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId);
      
      if (getUserError) throw new Error(getUserError.message);
      
      // Verificar contraseña actual (esto requiere iniciar sesión)
      const { error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email: userData.user.email,
        password: currentPassword
      });

      if (signInError) throw new Error('Contraseña actual incorrecta');

      // Actualizar contraseña
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      );

      if (updateError) throw new Error(updateError.message);

      return true;
    } catch (error) {
      throw error;
    }
  },

  // Enviar correo de restablecimiento de contraseña
  async resetPassword(email) {
    try {
      const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email);
      if (error) throw new Error(error.message);
      return true;
    } catch (error) {
      throw error;
    }
  },

  // Verificar correo electrónico
  async verifyEmail(userId) {
    try {
      // En Supabase, esto se maneja automáticamente
      // Pero podemos forzar la verificación para un usuario específico
      const { error } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { email_confirm: true }
      );
      
      if (error) throw new Error(error.message);
      return true;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = authService;