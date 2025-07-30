const { supabaseClient } = require('./genea-app/server/src/config/supabase.config');

async function debugPersons() {
  try {
    console.log('=== DEBUG PERSONS ===');
    
    // 1. Verificar todas las personas
    const { data: allPeople, error: peopleError } = await supabaseClient
      .from('people')
      .select('*');
    
    console.log('1. Total personas en BD:', allPeople?.length || 0);
    if (peopleError) console.log('Error personas:', peopleError);
    
    // 2. Verificar family_members
    const { data: members, error: membersError } = await supabaseClient
      .from('family_members')
      .select('*');
    
    console.log('2. Family members:', members?.length || 0);
    if (membersError) console.log('Error members:', membersError);
    
    // 3. Probar consulta específica
    const userId = '2d527731-75c6-4bb7-985d-970d027f46c2';
    const familyId = 'f01051a3-128e-499a-a715-8c8c22e11e01';
    
    const { data: peopleInFamily, error: familyError } = await supabaseClient
      .from('people')
      .select('*, (death_date IS NULL) as is_alive')
      .eq('family_id', familyId);
    
    console.log('3. Personas en familia específica:', peopleInFamily?.length || 0);
    if (familyError) console.log('Error familia:', familyError);
    
    if (peopleInFamily && peopleInFamily.length > 0) {
      console.log('Primera persona:', peopleInFamily[0]);
    }
    
  } catch (error) {
    console.error('Error general:', error);
  }
}

debugPersons();