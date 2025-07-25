const { supabaseClient } = require('../config/supabase.config');

// Familias con licencia gratuita
const FREE_FAMILIES = ['barbara', 'barbará'];

// Información de contacto para licencias
const LICENSE_CONTACT = {
  email: 'gadiazsaavedra@gmail.com',
  phone: '+54 11 4973 7619',
  developer: 'Gustavo Diaz Saavedra'
};

const checkLicense = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    
    // Obtener familias del usuario
    const { data: userFamilies, error } = await supabaseClient
      .from('family_members')
      .select(`
        family_id,
        families (
          id,
          name,
          license_status,
          license_expires_at
        )
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    // Si no tiene familias, puede crear una
    if (!userFamilies || userFamilies.length === 0) {
      return next();
    }
    
    // Verificar licencias de las familias
    let hasValidLicense = false;
    
    for (const membership of userFamilies) {
      const family = membership.families;
      const familyName = family.name.toLowerCase();
      
      // Verificar si es familia Barbará (gratis)
      if (FREE_FAMILIES.some(freeName => familyName.includes(freeName))) {
        hasValidLicense = true;
        break;
      }
      
      // Verificar licencia pagada
      if (family.license_status === 'active') {
        const expiresAt = new Date(family.license_expires_at);
        if (expiresAt > new Date()) {
          hasValidLicense = true;
          break;
        }
      }
    }
    
    if (!hasValidLicense) {
      return res.status(402).json({
        success: false,
        message: 'Licencia requerida para usar Genea',
        licenseRequired: true,
        contact: LICENSE_CONTACT,
        freeFamily: 'La familia Barbará tiene acceso gratuito permanente'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error verificando licencia:', error);
    res.status(500).json({
      success: false,
      message: 'Error verificando licencia'
    });
  }
};

module.exports = { checkLicense, LICENSE_CONTACT, FREE_FAMILIES };