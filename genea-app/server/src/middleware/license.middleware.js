const { supabaseClient } = require('../config/supabase.config');
const { checkBarbaraDescendant } = require('../utils/barbara-descendant-checker');
const { checkDiazSaavedraDescendant } = require('../utils/diaz-saavedra-checker');

// Familias con licencia gratuita
const FREE_FAMILIES = [
  // Familia Barbará (original)
  'barbara', 'barbará', 'bárbara',
  'familia barbara', 'familia barbará', 'familia bárbara',
  'descendencia barbara', 'descendencia barbará',
  'linaje barbara', 'linaje barbará',
  
  // Familia Díaz Saavedra (paterna del desarrollador)
  'diaz saavedra', 'díaz saavedra', 'diaz-saavedra', 'díaz-saavedra',
  'diaz', 'díaz', 'saavedra',
  'familia diaz', 'familia díaz', 'familia saavedra',
  'familia diaz saavedra', 'familia díaz saavedra',
  'descendencia diaz', 'descendencia díaz', 'descendencia saavedra',
  'linaje diaz', 'linaje díaz', 'linaje saavedra'
];

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
      const isFreeFamily = FREE_FAMILIES.some(freeName => {
        return familyName.includes(freeName.toLowerCase()) || 
               familyName.startsWith(freeName.toLowerCase()) ||
               familyName.endsWith(freeName.toLowerCase());
      });
      
      if (isFreeFamily) {
        hasValidLicense = true;
        break;
      }
      
      // Verificar si es descendiente de Barbará
      const isBarbaraDescendant = await checkBarbaraDescendant(family.id);
      if (isBarbaraDescendant) {
        hasValidLicense = true;
        break;
      }
      
      // Verificar si es descendiente de Díaz Saavedra
      const isDiazSaavedraDescendant = await checkDiazSaavedraDescendant(family.id);
      if (isDiazSaavedraDescendant) {
        hasValidLicense = true;
        break;
      }
      
      // Verificar período de prueba (30 días)
      const familyCreatedAt = new Date(family.created_at);
      const trialExpiresAt = new Date(familyCreatedAt.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 días
      const now = new Date();
      
      if (now <= trialExpiresAt && !family.license_status) {
        hasValidLicense = true;
        req.licenseInfo = {
          type: 'trial',
          expiresAt: trialExpiresAt,
          daysLeft: Math.ceil((trialExpiresAt - now) / (24 * 60 * 60 * 1000))
        };
        break;
      }
      
      // Verificar licencia pagada
      if (family.license_status === 'active') {
        const expiresAt = new Date(family.license_expires_at);
        if (expiresAt > new Date()) {
          hasValidLicense = true;
          req.licenseInfo = {
            type: 'paid',
            expiresAt: expiresAt
          };
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
        pricing: {
          amount: '$30 USD',
          duration: '1 año',
          paymentMethod: 'Transferencia Mercado Pago'
        },
        instructions: [
          '1. Contactar por email: gadiazsaavedra@gmail.com',
          '2. Contactar por WhatsApp: +54 11 4973-7619',
          '3. Transferir $30 USD a Mercado Pago',
          '4. Enviar comprobante con nombre de familia',
          '5. Licencia activada en 24-48 horas'
        ],
        freeFamilies: [
          'La familia Barbará tiene acceso gratuito permanente',
          'Las familias Díaz, Saavedra y Díaz Saavedra tienen acceso gratuito permanente'
        ]
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