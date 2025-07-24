// Script para probar la configuración de email
require('dotenv').config();
const nodemailer = require('nodemailer');

// Configuración del transportador
const transporter = nodemailer.createTransporter({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Función para probar el email
async function testEmail() {
  try {
    console.log('Probando configuración de email...');
    console.log('Email usuario:', process.env.EMAIL_USER);
    console.log('Servicio:', process.env.EMAIL_SERVICE);
    
    // Verificar la configuración
    await transporter.verify();
    console.log('✅ Configuración de email válida');
    
    // Enviar email de prueba
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Enviar a ti mismo
      subject: 'Prueba de configuración - Genea App',
      html: `
        <h1>¡Configuración de email exitosa!</h1>
        <p>Este es un email de prueba para verificar que la configuración de Gmail funciona correctamente.</p>
        <p>Fecha: ${new Date().toLocaleString()}</p>
        <p>Aplicación: Genea - Sistema de Gestión de Árbol Genealógico</p>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de prueba enviado correctamente');
    console.log('Message ID:', info.messageId);
    
  } catch (error) {
    console.error('❌ Error en configuración de email:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\n🔧 Posibles soluciones:');
      console.error('1. Verifica que la contraseña de aplicación sea correcta');
      console.error('2. Asegúrate de que la verificación en 2 pasos esté habilitada');
      console.error('3. Genera una nueva contraseña de aplicación');
    }
  }
}

// Ejecutar prueba
testEmail();