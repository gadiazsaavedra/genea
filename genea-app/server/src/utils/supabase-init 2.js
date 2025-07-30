/**
 * Utilidad para inicializar Supabase
 */
const { supabaseAdmin } = require('../config/supabase.config');
const storageService = require('../services/storage.service');

const initializeSupabase = async () => {
  try {
    console.log('Inicializando Supabase...');
    
    // Verificar conexión a Supabase
    const { data, error } = await supabaseAdmin.auth.getSession();
    
    if (error) {
      console.error('Error al conectar con Supabase:', error.message);
      return false;
    }
    
    console.log('Conexión a Supabase establecida correctamente');
    
    // Inicializar bucket de almacenamiento
    try {
      await storageService.initBucket();
      console.log('Bucket de almacenamiento inicializado correctamente');
    } catch (storageError) {
      console.error('Error al inicializar bucket de almacenamiento:', storageError.message);
      // No fallamos completamente si hay un error en el almacenamiento
    }
    
    return true;
  } catch (error) {
    console.error('Error al inicializar Supabase:', error.message);
    return false;
  }
};

module.exports = initializeSupabase;