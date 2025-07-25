const { LICENSE_CONTACT, FREE_FAMILIES } = require('../middleware/license.middleware');

// Obtener información de licencia
exports.getLicenseInfo = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        contact: LICENSE_CONTACT,
        freeFamilies: FREE_FAMILIES,
        pricing: {
          trial: {
            duration: '7 días',
            price: 'Gratis',
            features: ['Hasta 50 personas', 'Funciones básicas']
          },
          standard: {
            duration: '1 año',
            price: 'Contactar para precio',
            features: ['Personas ilimitadas', 'Todas las funciones', 'Soporte técnico']
          },
          free: {
            duration: 'Permanente',
            price: 'Gratis',
            features: ['Solo familia Barbará', 'Todas las funciones'],
            note: 'Acceso exclusivo para la familia Barbará y descendencia'
          }
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener información de licencia'
    });
  }
};

// Solicitar licencia
exports.requestLicense = async (req, res) => {
  try {
    const { familyName, contactEmail, message } = req.body;
    
    // Aquí podrías enviar un email o guardar la solicitud
    console.log('Solicitud de licencia:', {
      familyName,
      contactEmail,
      message,
      requestedAt: new Date().toISOString()
    });
    
    res.status(200).json({
      success: true,
      message: 'Solicitud de licencia enviada correctamente',
      contact: LICENSE_CONTACT
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al procesar solicitud de licencia'
    });
  }
};