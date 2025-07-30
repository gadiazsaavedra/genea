const { supabaseClient } = require('../config/supabase.config');

// Función para verificar si una familia tiene descendientes de Barbará
async function checkBarbaraDescendant(familyId) {
  try {
    // Obtener todas las personas de la familia
    const { data: people, error: peopleError } = await supabaseClient
      .from('people')
      .select('id, first_name, last_name, maiden_name')
      .eq('family_id', familyId);
    
    if (peopleError || !people) return false;
    
    // Buscar personas con apellido Barbará o variaciones
    const barbaraNames = ['barbara', 'barbará', 'bárbara'];
    
    const hasBarbaraAncestor = people.some(person => {
      const lastName = (person.last_name || '').toLowerCase();
      const maidenName = (person.maiden_name || '').toLowerCase();
      const firstName = (person.first_name || '').toLowerCase();
      
      return barbaraNames.some(barbaraName => 
        lastName.includes(barbaraName) || 
        maidenName.includes(barbaraName) ||
        firstName.includes(barbaraName)
      );
    });
    
    if (hasBarbaraAncestor) return true;
    
    // Buscar conexiones genealógicas con familias Barbará
    const { data: barbaraFamilies, error: familiesError } = await supabaseClient
      .from('families')
      .select('id')
      .or('name.ilike.%barbara%,name.ilike.%barbará%,name.ilike.%bárbara%');
    
    if (familiesError || !barbaraFamilies) return false;
    
    // Verificar si hay relaciones entre personas de esta familia y familias Barbará
    for (const barbaraFamily of barbaraFamilies) {
      const { data: barbaraPeople, error: barbaraPeopleError } = await supabaseClient
        .from('people')
        .select('id')
        .eq('family_id', barbaraFamily.id);
      
      if (barbaraPeopleError || !barbaraPeople) continue;
      
      const barbaraPersonIds = barbaraPeople.map(p => p.id);
      const currentFamilyPersonIds = people.map(p => p.id);
      
      // Buscar relaciones entre las dos familias
      const { data: relationships, error: relError } = await supabaseClient
        .from('relationships')
        .select('*')
        .or(`and(person1_id.in.(${barbaraPersonIds.join(',')}),person2_id.in.(${currentFamilyPersonIds.join(',')})),and(person1_id.in.(${currentFamilyPersonIds.join(',')}),person2_id.in.(${barbaraPersonIds.join(',')}))`);
      
      if (!relError && relationships && relationships.length > 0) {
        return true; // Hay conexión genealógica
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking Barbara descendant:', error);
    return false;
  }
}

module.exports = { checkBarbaraDescendant };