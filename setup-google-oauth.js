#!/usr/bin/env node

console.log('🔧 Configuración de Google OAuth para Genea\n');

console.log('📋 PASO 1: Crear proyecto en Google Console');
console.log('1. Ve a: https://console.cloud.google.com/');
console.log('2. Crea nuevo proyecto llamado "Genea"');
console.log('3. Selecciona el proyecto\n');

console.log('📋 PASO 2: Habilitar APIs');
console.log('1. Ve a: APIs & Services → Library');
console.log('2. Busca "Google+ API" → Enable');
console.log('3. Busca "Google Identity" → Enable\n');

console.log('📋 PASO 3: Configurar OAuth consent screen');
console.log('1. Ve a: APIs & Services → OAuth consent screen');
console.log('2. User Type: External → Create');
console.log('3. Completa con estos datos:');
console.log('   - App name: Genea');
console.log('   - User support email: gadiazsaavedra@gmail.com');
console.log('   - App domain: geneal.netlify.app');
console.log('   - Developer contact: gadiazsaavedra@gmail.com');
console.log('4. Save and Continue (deja el resto por defecto)\n');

console.log('📋 PASO 4: Crear credenciales OAuth');
console.log('1. Ve a: APIs & Services → Credentials');
console.log('2. Create Credentials → OAuth 2.0 Client ID');
console.log('3. Application type: Web application');
console.log('4. Name: Genea Web Client');
console.log('5. Authorized JavaScript origins:');
console.log('   https://geneal.netlify.app');
console.log('   http://localhost:3000');
console.log('6. Authorized redirect URIs:');
console.log('   https://hsdjbqqijtxehepifbfk.supabase.co/auth/v1/callback');
console.log('7. Create → COPIA Client ID y Client Secret\n');

console.log('📋 PASO 5: Configurar en Supabase');
console.log('1. Ve a: https://supabase.com/dashboard/project/hsdjbqqijtxehepifbfk');
console.log('2. Authentication → Providers');
console.log('3. Google → Enable');
console.log('4. Pega Client ID y Client Secret');
console.log('5. Save\n');

console.log('✅ URLs importantes:');
console.log('Google Console: https://console.cloud.google.com/');
console.log('Supabase Auth: https://supabase.com/dashboard/project/hsdjbqqijtxehepifbfk/auth/providers');
console.log('Tu app: https://geneal.netlify.app/\n');

console.log('🎯 Redirect URI para copiar:');
console.log('https://hsdjbqqijtxehepifbfk.supabase.co/auth/v1/callback\n');

console.log('📧 Contacto: gadiazsaavedra@gmail.com');
console.log('📱 Teléfono: +54 11 4973 7619');

// Abrir URLs automáticamente
const { exec } = require('child_process');

console.log('\n🚀 Abriendo URLs necesarias...');

setTimeout(() => {
  exec('open https://console.cloud.google.com/', (error) => {
    if (error) console.log('Abre manualmente: https://console.cloud.google.com/');
  });
}, 1000);

setTimeout(() => {
  exec('open https://supabase.com/dashboard/project/hsdjbqqijtxehepifbfk/auth/providers', (error) => {
    if (error) console.log('Abre manualmente: https://supabase.com/dashboard/project/hsdjbqqijtxehepifbfk/auth/providers');
  });
}, 3000);