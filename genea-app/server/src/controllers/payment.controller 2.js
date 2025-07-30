const { MercadoPagoConfig, Preference } = require('mercadopago');
const { supabaseClient } = require('../config/supabase.config');

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  options: { timeout: 5000 }
});

const preference = new Preference(client);

// Crear preferencia de pago
exports.createPayment = async (req, res) => {
  try {
    const { familyId, familyName, userEmail } = req.body;
    const userId = req.user.uid;

    // Verificar que la familia existe
    const { data: family, error: familyError } = await supabaseClient
      .from('families')
      .select('*')
      .eq('id', familyId)
      .single();

    if (familyError || !family) {
      return res.status(404).json({
        success: false,
        message: 'Familia no encontrada'
      });
    }

    // Crear preferencia de pago
    const paymentData = {
      items: [
        {
          id: `genea-license-${familyId}`,
          title: `Genea - Licencia Anual para ${familyName}`,
          description: 'Licencia anual para sistema de gestión de árbol genealógico',
          quantity: 1,
          unit_price: 30,
          currency_id: 'USD'
        }
      ],
      payer: {
        email: userEmail
      },
      back_urls: {
        success: `${process.env.FRONTEND_URL}/payment/success`,
        failure: `${process.env.FRONTEND_URL}/payment/failure`,
        pending: `${process.env.FRONTEND_URL}/payment/pending`
      },
      auto_return: 'approved',
      external_reference: `${familyId}-${userId}`,
      notification_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/webhook`,
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 horas
    };

    const result = await preference.create({ body: paymentData });

    // Guardar información del pago pendiente
    await supabaseClient
      .from('payment_requests')
      .insert({
        family_id: familyId,
        user_id: userId,
        preference_id: result.id,
        amount: 30,
        currency: 'USD',
        status: 'pending',
        external_reference: `${familyId}-${userId}`,
        created_at: new Date().toISOString()
      });

    res.status(200).json({
      success: true,
      data: {
        preferenceId: result.id,
        initPoint: result.init_point,
        sandboxInitPoint: result.sandbox_init_point
      }
    });

  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el pago'
    });
  }
};

// Webhook para notificaciones de Mercado Pago
exports.paymentWebhook = async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type === 'payment') {
      const paymentId = data.id;
      
      // Aquí procesarías la notificación del pago
      // Por ahora solo logueamos
      console.log('Payment notification received:', paymentId);
      
      // TODO: Verificar el estado del pago con la API de Mercado Pago
      // TODO: Actualizar el estado de la licencia en la base de datos
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false });
  }
};

// Verificar estado del pago
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { preferenceId } = req.params;
    
    // Buscar el pago en la base de datos
    const { data: paymentRequest, error } = await supabaseClient
      .from('payment_requests')
      .select('*')
      .eq('preference_id', preferenceId)
      .single();

    if (error || !paymentRequest) {
      return res.status(404).json({
        success: false,
        message: 'Pago no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: paymentRequest
    });

  } catch (error) {
    console.error('Error checking payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar el estado del pago'
    });
  }
};