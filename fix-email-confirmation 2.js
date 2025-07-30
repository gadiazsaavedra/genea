const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hsdjbqqijtxehepifbfk.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZGpicXFpanR4ZWhlcGlmYmZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzIxMTg0NCwiZXhwIjoyMDY4Nzg3ODQ0fQ.OIsGPw9G2JlvwpFmCNLsuNh_CivLj9XspOJwZVyAWuA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function confirmAllUsers() {
  console.log('🔧 Confirmando usuarios automáticamente...\n');

  try {
    // Obtener usuarios no confirmados
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.log(`❌ Error: ${error.message}`);
      return;
    }

    const unconfirmedUsers = users.users.filter(user => !user.email_confirmed_at);
    
    console.log(`📊 Usuarios no confirmados: ${unconfirmedUsers.length}`);

    for (const user of unconfirmedUsers) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { email_confirm: true }
      );

      if (updateError) {
        console.log(`❌ Error confirmando ${user.email}: ${updateError.message}`);
      } else {
        console.log(`✅ Usuario confirmado: ${user.email}`);
      }
    }

    console.log('\n🎉 Proceso completado. Ahora puedes hacer login normalmente.');
    
  } catch (err) {
    console.log(`❌ Error general: ${err.message}`);
  }
}

confirmAllUsers();