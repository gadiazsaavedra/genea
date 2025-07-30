// Script para probar la conexión a Supabase
const { createClient } = require('@supabase/supabase-js');

// Usar valores directamente para la prueba
const SUPABASE_URL = 'https://hsdjbqqijtxehepifbfk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZGpicXFpanR4ZWhlcGlmYmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTE4NDQsImV4cCI6MjA2ODc4Nzg0NH0.q0KQo2E1KOG_0AL4D69PDD2gkVmx39V-_njV0anP2q0';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZGpicXFpanR4ZWhlcGlmYmZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzIxMTg0NCwiZXhwIjoyMDY4Nzg3ODQ0fQ.OIsGPw9G2JlvwpFmCNLsuNh_CivLj9XspOJwZVyAWuA';

// Crear clientes de Supabase
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Función para probar la conexión
async function testConnection() {
  try {
    console.log('Probando conexión a Supabase...');
    
    // Probar cliente anónimo
    console.log('\n1. Probando cliente anónimo...');
    const { data: anonData, error: anonError } = await supabaseClient.auth.getSession();
    
    if (anonError) {
      console.error('❌ Error con cliente anónimo:', anonError.message);
    } else {
      console.log('✅ Cliente anónimo conectado correctamente');
    }
    
    // Probar cliente admin
    console.log('\n2. Probando cliente admin...');
    const { data: adminData, error: adminError } = await supabaseAdmin.auth.getSession();
    
    if (adminError) {
      console.error('❌ Error con cliente admin:', adminError.message);
    } else {
      console.log('✅ Cliente admin conectado correctamente');
    }
    
    // Probar acceso a tablas
    console.log('\n3. Probando acceso a tablas...');
    
    // Verificar tabla families
    const { data: families, error: familiesError } = await supabaseAdmin
      .from('families')
      .select('id')
      .limit(1);
    
    if (familiesError) {
      console.error('❌ Error al acceder a tabla families:', familiesError.message);
    } else {
      console.log('✅ Acceso a tabla families correcto');
    }
    
    // Verificar tabla people
    const { data: people, error: peopleError } = await supabaseAdmin
      .from('people')
      .select('id')
      .limit(1);
    
    if (peopleError) {
      console.error('❌ Error al acceder a tabla people:', peopleError.message);
    } else {
      console.log('✅ Acceso a tabla people correcto');
    }
    
    // Verificar tabla relationships
    const { data: relationships, error: relationshipsError } = await supabaseAdmin
      .from('relationships')
      .select('id')
      .limit(1);
    
    if (relationshipsError) {
      console.error('❌ Error al acceder a tabla relationships:', relationshipsError.message);
    } else {
      console.log('✅ Acceso a tabla relationships correcto');
    }
    
    // Verificar tabla family_members
    const { data: familyMembers, error: familyMembersError } = await supabaseAdmin
      .from('family_members')
      .select('id')
      .limit(1);
    
    if (familyMembersError) {
      console.error('❌ Error al acceder a tabla family_members:', familyMembersError.message);
    } else {
      console.log('✅ Acceso a tabla family_members correcto');
    }
    
    console.log('\n✅ Prueba de conexión completada');
  } catch (error) {
    console.error('\n❌ Error general:', error.message);
  }
}

// Ejecutar prueba
testConnection();