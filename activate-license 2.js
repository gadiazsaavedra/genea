// Script para activar licencias manualmente
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function activateLicense(familyName, duration = 365) {
  try {
    console.log(`Activando licencia para familia: ${familyName}`);
    
    // Buscar familia por nombre
    const { data: families, error: searchError } = await supabase
      .from('families')
      .select('*')
      .ilike('name', `%${familyName}%`);
    
    if (searchError) throw searchError;
    
    if (!families || families.length === 0) {
      console.log('❌ Familia no encontrada');
      return;
    }
    
    if (families.length > 1) {
      console.log('⚠️  Múltiples familias encontradas:');
      families.forEach((family, index) => {
        console.log(`${index + 1}. ${family.name} (ID: ${family.id})`);
      });
      console.log('Por favor, usa el ID específico de la familia');
      return;
    }
    
    const family = families[0];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + duration);
    
    // Activar licencia
    const { error: updateError } = await supabase
      .from('families')
      .update({
        license_status: 'active',
        license_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', family.id);
    
    if (updateError) throw updateError;
    
    // Actualizar solicitud de licencia si existe
    await supabase
      .from('license_requests')
      .update({
        status: 'approved',
        activated_at: new Date().toISOString()
      })
      .eq('family_id', family.id);
    
    console.log('✅ Licencia activada correctamente');
    console.log(`   Familia: ${family.name}`);
    console.log(`   ID: ${family.id}`);
    console.log(`   Expira: ${expiresAt.toLocaleDateString()}`);
    
  } catch (error) {
    console.error('❌ Error activando licencia:', error.message);
  }
}

async function listPendingRequests() {
  try {
    const { data: requests, error } = await supabase
      .from('license_requests')
      .select(`
        *,
        families (name)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    if (!requests || requests.length === 0) {
      console.log('📭 No hay solicitudes pendientes');
      return;
    }
    
    console.log('📋 Solicitudes de licencia pendientes:');
    console.log('=====================================');
    
    requests.forEach((request, index) => {
      console.log(`${index + 1}. ${request.family_name}`);
      console.log(`   Email: ${request.contact_email}`);
      console.log(`   Fecha: ${new Date(request.created_at).toLocaleDateString()}`);
      console.log(`   ID Familia: ${request.family_id}`);
      if (request.message) {
        console.log(`   Mensaje: ${request.message}`);
      }
      console.log('   ---');
    });
    
  } catch (error) {
    console.error('❌ Error listando solicitudes:', error.message);
  }
}

// Ejecutar según argumentos
const command = process.argv[2];
const familyName = process.argv[3];

if (command === 'list') {
  listPendingRequests();
} else if (command === 'activate' && familyName) {
  activateLicense(familyName);
} else {
  console.log('Uso:');
  console.log('  node activate-license.js list                    # Listar solicitudes pendientes');
  console.log('  node activate-license.js activate "Familia X"   # Activar licencia para familia');
}