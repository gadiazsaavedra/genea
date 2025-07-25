const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hsdjbqqijtxehepifbfk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZGpicXFpanR4ZWhlcGlmYmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTE4NDQsImV4cCI6MjA2ODc4Nzg0NH0.q0KQo2E1KOG_0AL4D69PDD2gkVmx39V-_njV0anP2q0';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
  console.log('🔐 Probando autenticación con Supabase...\n');

  // Test 1: Crear usuario de prueba
  console.log('1. Creando usuario de prueba...');
  const testEmail = 'test@genea.com';
  const testPassword = '123456';

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        displayName: 'Usuario de Prueba'
      }
    }
  });

  if (signUpError) {
    if (signUpError.message.includes('already registered')) {
      console.log('   ✅ Usuario ya existe');
    } else {
      console.log(`   ❌ Error al crear usuario: ${signUpError.message}`);
    }
  } else {
    console.log('   ✅ Usuario creado exitosamente');
    console.log(`   📧 Email: ${testEmail}`);
    console.log(`   🔑 Password: ${testPassword}`);
  }

  // Test 2: Intentar login
  console.log('\n2. Probando login...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });

  if (signInError) {
    console.log(`   ❌ Error de login: ${signInError.message}`);
    
    if (signInError.message.includes('Email not confirmed')) {
      console.log('   💡 Solución: Ve a tu email y confirma la cuenta');
    }
  } else {
    console.log('   ✅ Login exitoso');
    console.log(`   👤 Usuario: ${signInData.user.email}`);
  }

  // Test 3: Verificar configuración de Supabase
  console.log('\n3. Verificando configuración...');
  console.log(`   🌐 URL: ${supabaseUrl}`);
  console.log(`   🔑 Key: ${supabaseAnonKey.substring(0, 20)}...`);

  console.log('\n📋 Credenciales de prueba:');
  console.log(`   Email: ${testEmail}`);
  console.log(`   Password: ${testPassword}`);
  console.log('\n💡 Usa estas credenciales para probar el login en la app');
}

testAuth().catch(console.error);