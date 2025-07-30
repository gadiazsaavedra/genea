const { LICENSE_CONTACT, FREE_FAMILIES } = require('../middleware/license.middleware');
const { supabaseClient } = require('../config/supabase.config');

// Obtener información de licencia
const getLicenseInfo = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        contact: LICENSE_CONTACT,
        freeFamilies: FREE_FAMILIES,
        pricing: {
          trial: {
            duration: '30 días',
            price: 'Gratis',
            features: ['Personas ilimitadas', 'Todas las funciones', 'Soporte completo']
          },
          annual: {
            duration: '1 año',
            price: '$30 USD',
            features: ['Personas ilimitadas', 'Todas las funciones', 'Soporte técnico', 'Actualizaciones gratuitas'],
            paymentMethod: 'Transferencia a Mercado Pago',
            process: [
              '1. Contactar al desarrollador',
              '2. Transferir $30 USD a Mercado Pago',
              '3. Enviar comprobante de pago',
              '4. Activación manual de licencia'
            ]
          },
          free: {
            duration: 'Permanente',
            price: 'Gratis',
            families: ['Barbará', 'Díaz', 'Saavedra', 'Díaz Saavedra'],
            features: ['Personas ilimitadas', 'Todas las funciones', 'Soporte completo'],
            note: 'Acceso exclusivo para familias del desarrollador'
          }
        },
        paymentInfo: {
          mercadoPago: {
            alias: 'gustavo.diaz.saavedra',
            cvu: '0000003100010000000001',
            account: 'gadiazsaavedra@gmail.com'
          },
          instructions: [
            'Transferir $30 USD a la cuenta de Mercado Pago',
            'Enviar comprobante por email o WhatsApp',
            'Incluir nombre de la familia en el mensaje',
            'La licencia se activa en 24-48 horas'
          ]
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
const requestLicense = async (req, res) => {
  try {
    const { familyName, contactEmail, message, familyId } = req.body;
    const userId = req.user?.uid;
    
    // Guardar solicitud en base de datos
    const { data, error } = await supabaseClient
      .from('license_requests')
      .insert({
        family_id: familyId,
        user_id: userId,
        family_name: familyName,
        contact_email: contactEmail,
        message: message,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(200).json({
      success: true,
      message: 'Solicitud de licencia registrada correctamente',
      data: {
        requestId: data.id,
        contact: LICENSE_CONTACT,
        paymentInfo: {
          amount: '$30 USD',
          method: 'Transferencia Mercado Pago',
          account: 'gadiazsaavedra@gmail.com',
          instructions: [
            '1. Transferir $30 USD a Mercado Pago',
            '2. Enviar comprobante por email/WhatsApp',
            '3. Incluir nombre de familia: ' + familyName,
            '4. Licencia activada en 24-48 horas'
          ]
        }
      }
    });
  } catch (error) {
    console.error('Error processing license request:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar solicitud de licencia'
    });
  }
};

// Activar licencia manualmente (solo para admin)
const activateLicense = async (req, res) => {
  try {
    const { familyId, duration = 365 } = req.body; // 365 días por defecto
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + duration);
    
    // Actualizar familia con licencia activa
    const { error: familyError } = await supabaseClient
      .from('families')
      .update({
        license_status: 'active',
        license_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', familyId);
    
    if (familyError) throw familyError;
    
    // Actualizar solicitud de licencia
    await supabaseClient
      .from('license_requests')
      .update({
        status: 'approved',
        activated_at: new Date().toISOString()
      })
      .eq('family_id', familyId);
    
    res.status(200).json({
      success: true,
      message: 'Licencia activada correctamente',
      data: {
        familyId,
        expiresAt: expiresAt.toISOString()
      }
    });
  } catch (error) {
    console.error('Error activating license:', error);
    res.status(500).json({
      success: false,
      message: 'Error al activar licencia'
    });
  }
};

module.exports = {
  getLicenseInfo,
  requestLicense,
  activateLicense
};