const { supabaseClient } = require('../config/supabase.config');

// Función para verificar si una familia tiene descendientes de Díaz Saavedra
async function checkDiazSaavedraDescendant(familyId) {
  try {
    // Obtener todas las personas de la familia
    const { data: people, error: peopleError } = await supabaseClient
      .from('people')
      .select('id, first_name, last_name, maiden_name')
      .eq('family_id', familyId);
    
    if (peopleError || !people) return false;
    
    // Buscar personas con apellidos Díaz, Saavedra o variaciones
    const diazSaavedraNames = [
      'diaz', 'díaz', 'saavedra', 'diaz saavedra', 'díaz saavedra',
      'diaz-saavedra', 'díaz-saavedra'
    ];
    
    const hasDiazSaavedraAncestor = people.some(person => {
      const lastName = (person.last_name || '').toLowerCase();
      const maidenName = (person.maiden_name || '').toLowerCase();
      const fullName = `${person.first_name || ''} ${person.last_name || ''}`.toLowerCase();
      
      return diazSaavedraNames.some(name => 
        lastName.includes(name) || 
        maidenName.includes(name) ||
        fullName.includes(name) ||
        lastName === 'diaz' || lastName === 'díaz' ||
        lastName === 'saavedra' ||
        maidenName === 'diaz' || maidenName === 'díaz' ||
        maidenName === 'saavedra'
      );
    });
    
    if (hasDiazSaavedraAncestor) return true;
    
    // Buscar conexiones genealógicas con familias Díaz Saavedra
    const { data: diazFamilies, error: familiesError } = await supabaseClient
      .from('families')
      .select('id')
      .or('name.ilike.%diaz%,name.ilike.%díaz%,name.ilike.%saavedra%');
    
    if (familiesError || !diazFamilies) return false;
    
    // Verificar si hay relaciones entre personas de esta familia y familias Díaz/Saavedra
    for (const diazFamily of diazFamilies) {
      const { data: diazPeople, error: diazPeopleError } = await supabaseClient
        .from('people')
        .select('id')
        .eq('family_id', diazFamily.id);
      
      if (diazPeopleError || !diazPeople) continue;
      
      const diazPersonIds = diazPeople.map(p => p.id);
      const currentFamilyPersonIds = people.map(p => p.id);
      
      if (diazPersonIds.length === 0 || currentFamilyPersonIds.length === 0) continue;
      
      // Buscar relaciones entre las dos familias
      const { data: relationships, error: relError } = await supabaseClient
        .from('relationships')
        .select('*')
        .or(`and(person1_id.in.(${diazPersonIds.join(',')}),person2_id.in.(${currentFamilyPersonIds.join(',')})),and(person1_id.in.(${currentFamilyPersonIds.join(',')}),person2_id.in.(${diazPersonIds.join(',')}))`)
        .limit(1);
      
      if (!relError && relationships && relationships.length > 0) {
        return true; // Hay conexión genealógica
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking Díaz Saavedra descendant:', error);
    return false;
  }
}

module.exports = { checkDiazSaavedraDescendant };