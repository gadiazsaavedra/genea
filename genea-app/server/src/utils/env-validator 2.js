/**
 * Utilidad para validar variables de entorno críticas
 */

const validateEnv = () => {
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'JWT_SECRET'
  ];

  const productionOnlyVars = [
    'EMAIL_SERVICE',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
    'FRONTEND_URL'
  ];

  // Verificar variables requeridas en todos los entornos
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingVars.length > 0) {
    console.error('ERROR: Las siguientes variables de entorno son requeridas:');
    missingVars.forEach(envVar => console.error(`- ${envVar}`));
    return false;
  }

  // Verificar variables requeridas solo en producción
  if (process.env.NODE_ENV === 'production') {
    const missingProdVars = productionOnlyVars.filter(envVar => !process.env[envVar]);
    
    if (missingProdVars.length > 0) {
      console.error('ERROR: Las siguientes variables de entorno son requeridas en producción:');
      missingProdVars.forEach(envVar => console.error(`- ${envVar}`));
      return false;
    }
  }

  return true;
};

module.exports = validateEnv;