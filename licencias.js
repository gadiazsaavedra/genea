#!/usr/bin/env node

// Script interactivo para gestionar licencias de Genea
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function showMenu() {
  console.log('\n🔑 GESTIÓN DE LICENCIAS GENEA');
  console.log('============================');
  console.log('1. Ver solicitudes pendientes');
  console.log('2. Activar licencia');
  console.log('3. Ver licencias activas');
  console.log('4. Salir');
  console.log('============================');
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
      console.log('\n📭 No hay solicitudes pendientes\n');
      return;
    }
    
    console.log('\n📋 SOLICITUDES PENDIENTES:');
    console.log('==========================');
    
    requests.forEach((request, index) => {
      console.log(`${index + 1}. "${request.family_name}"`);
      console.log(`   📧 ${request.contact_email}`);
      console.log(`   📅 ${new Date(request.created_at).toLocaleDateString()}`);
      if (request.message) {
        console.log(`   💬 ${request.message}`);
      }
      console.log('   ---');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function activateLicense() {
  rl.question('\n📝 Nombre exacto de la familia: ', async (familyName) => {
    if (!familyName.trim()) {
      console.log('❌ Debes ingresar un nombre de familia');
      return askAction();
    }
    
    try {
      console.log(`\n🔄 Activando licencia para: "${familyName}"`);
      
      const { data: families, error: searchError } = await supabase
        .from('families')
        .select('*')
        .ilike('name', `%${familyName}%`);
      
      if (searchError) throw searchError;
      
      if (!families || families.length === 0) {
        console.log('❌ Familia no encontrada');
        return askAction();
      }
      
      const family = families[0];
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 365);
      
      const { error: updateError } = await supabase
        .from('families')
        .update({
          license_status: 'active',
          license_expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', family.id);
      
      if (updateError) throw updateError;
      
      await supabase
        .from('license_requests')
        .update({
          status: 'approved',
          activated_at: new Date().toISOString()
        })
        .eq('family_id', family.id);
      
      console.log('\n✅ ¡LICENCIA ACTIVADA!');
      console.log(`   👨‍👩‍👧‍👦 Familia: ${family.name}`);
      console.log(`   📅 Expira: ${expiresAt.toLocaleDateString()}`);
      console.log(`   💰 Precio: $30 USD`);
      console.log('\n📧 Mensaje para enviar al cliente:');
      console.log('-----------------------------------');
      console.log(`¡Hola! Tu licencia de Genea ha sido activada.`);
      console.log(`✅ Familia: ${family.name}`);
      console.log(`✅ Duración: 1 año`);
      console.log(`✅ Expira: ${expiresAt.toLocaleDateString()}`);
      console.log(`Ya puedes usar todas las funciones sin restricciones.`);
      console.log(`¡Gracias por tu pago!`);
      
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
    
    askAction();
  });
}

async function listActiveLicenses() {
  try {
    const { data: families, error } = await supabase
      .from('families')
      .select('name, license_status, license_expires_at, created_at')
      .eq('license_status', 'active')
      .order('license_expires_at', { ascending: true });
    
    if (error) throw error;
    
    if (!families || families.length === 0) {
      console.log('\n📭 No hay licencias activas\n');
      return;
    }
    
    console.log('\n✅ LICENCIAS ACTIVAS:');
    console.log('=====================');
    
    families.forEach((family, index) => {
      const expiresAt = new Date(family.license_expires_at);
      const daysLeft = Math.ceil((expiresAt - new Date()) / (1000 * 60 * 60 * 24));
      
      console.log(`${index + 1}. ${family.name}`);
      console.log(`   📅 Expira: ${expiresAt.toLocaleDateString()}`);
      console.log(`   ⏰ Días restantes: ${daysLeft}`);
      console.log('   ---');
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function askAction() {
  showMenu();
  rl.question('\n👉 Selecciona una opción (1-4): ', async (choice) => {
    switch (choice) {
      case '1':
        await listPendingRequests();
        askAction();
        break;
      case '2':
        await activateLicense();
        break;
      case '3':
        await listActiveLicenses();
        askAction();
        break;
      case '4':
        console.log('\n👋 ¡Hasta luego!\n');
        rl.close();
        break;
      default:
        console.log('\n❌ Opción inválida');
        askAction();
        break;
    }
  });
}

// Iniciar
console.log('🚀 Iniciando gestor de licencias...');
askAction();