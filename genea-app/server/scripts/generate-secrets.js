/**
 * Script para generar claves secretas seguras
 * Ejecutar con: node scripts/generate-secrets.js
 */

const crypto = require('crypto');

// Generar una clave JWT segura
const generateJwtSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

console.log('\n=== Generador de Claves Secretas para Genea ===\n');
console.log('JWT_SECRET para usar en producción:');
console.log(generateJwtSecret());
console.log('\nCopia esta clave y configúrala en el panel de Render.com como variable de entorno JWT_SECRET');
console.log('\nNUNCA incluyas esta clave en archivos de configuración que se suban al repositorio.\n');