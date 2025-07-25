const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Crear pago (requiere autenticación)
router.post('/create', authenticateToken, paymentController.createPayment);

// Webhook de Mercado Pago (sin autenticación)
router.post('/webhook', paymentController.paymentWebhook);

// Verificar estado del pago
router.get('/status/:preferenceId', authenticateToken, paymentController.checkPaymentStatus);

module.exports = router;