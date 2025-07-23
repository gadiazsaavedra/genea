// Script para probar la conexión a Supabase desde el backend
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Verificar variables de entorno
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Variables de entorno de Supabase no configuradas');
  console.error('Asegúrate de configurar SUPABASE_URL, SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

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