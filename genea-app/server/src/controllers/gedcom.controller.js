const { supabaseClient } = require('../config/supabase.config');

const gedcomController = {
  // Exportar árbol genealógico en formato GEDCOM
  exportGedcom: async (req, res) => {
    try {
      const { familyId } = req.params;
      const userId = req.user.uid;
      
      // Verificar que el usuario tiene acceso a esta familia
      const { data: memberCheck, error: memberError } = await supabaseClient
        .from('family_members')
        .select('id')
        .eq('family_id', familyId)
        .eq('user_id', userId);
      
      if (memberError || !memberCheck || memberCheck.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a esta familia'
        });
      }
      
      // Obtener información de la familia
      const { data: family, error: familyError } = await supabaseClient
        .from('families')
        .select('*')
        .eq('id', familyId)
        .single();
      
      if (familyError || !family) {
        return res.status(404).json({ 
          success: false,
          message: 'Familia no encontrada' 
        });
      }
      
      // Obtener todas las personas de la familia
      const { data: persons, error: personsError } = await supabaseClient
        .from('people')
        .select('*')
        .eq('family_id', familyId);
      
      if (personsError) throw new Error(personsError.message);
      
      // Obtener todas las relaciones
      const { data: relationships, error: relError } = await supabaseClient
        .from('relationships')
        .select('*')
        .in('person1_id', persons.map(p => p.id));
      
      if (relError) throw new Error(relError.message);
      
      // Generar el archivo GEDCOM
      let gedcom = [];
      
      // Cabecera GEDCOM
      gedcom.push('0 HEAD');
      gedcom.push('1 CHAR UTF-8');
      gedcom.push('1 GEDC');
      gedcom.push('2 VERS 5.5.1');
      gedcom.push('2 FORM LINEAGE-LINKED');
      gedcom.push(`1 SOUR Genea App`);
      gedcom.push(`2 VERS 1.0`);
      gedcom.push(`2 NAME Genea - Sistema de Gestión de Árbol Genealógico`);
      gedcom.push(`1 DATE ${new Date().toLocaleDateString('en-US')}`);
      gedcom.push('2 TIME ' + new Date().toLocaleTimeString('en-US'));
      gedcom.push(`1 FILE ${family.name.replace(/\s/g, '_')}.ged`);
      gedcom.push(`1 SUBM @SUBM@`);
      
      // Información del remitente
      gedcom.push('0 @SUBM@ SUBM');
      gedcom.push(`1 NAME ${req.user.displayName || 'Usuario de Genea'}`);
      
      // Personas
      persons.forEach(person => {
        gedcom.push(`0 @I${person.id}@ INDI`);
        gedcom.push(`1 NAME ${person.first_name} /${person.last_name || ''}/`);
        
        if (person.gender) {
          gedcom.push(`1 SEX ${person.gender === 'male' ? 'M' : person.gender === 'female' ? 'F' : 'U'}`);
        }
        
        if (person.birth_date) {
          gedcom.push('1 BIRT');
          gedcom.push(`2 DATE ${new Date(person.birth_date).toLocaleDateString('en-US')}`);
          
          if (person.birth_place) {
            gedcom.push(`2 PLAC ${person.birth_place}`);
          }
        }
        
        if (person.death_date) {
          gedcom.push('1 DEAT');
          gedcom.push(`2 DATE ${new Date(person.death_date).toLocaleDateString('en-US')}`);
          
          if (person.death_place) {
            gedcom.push(`2 PLAC ${person.death_place}`);
          }
        }
        
        // Notas
        if (person.biography) {
          gedcom.push(`1 NOTE ${person.biography.replace(/\n/g, '\n1 CONT ')}`);
        }
      });
      
      // Procesar relaciones para crear familias GEDCOM
      const familyRelations = new Map();
      
      // Identificar relaciones padre-hijo
      const parentChildRelations = relationships.filter(rel => 
        rel.relationship_type === 'parent' || rel.relationship_type === 'child'
      );
      
      // Identificar relaciones de cónyuges
      const spouseRelations = relationships.filter(rel => rel.relationship_type === 'spouse');
      
      // Crear un mapa de familias basado en relaciones de cónyuges
      spouseRelations.forEach(rel => {
        const familyKey = [rel.person1_id, rel.person2_id].sort().join('_');
        
        if (!familyRelations.has(familyKey)) {
          familyRelations.set(familyKey, {
            husband: null,
            wife: null,
            children: [],
            marriageDate: rel.marriage_date,
            marriagePlace: rel.marriage_place
          });
        }
        
        // Asignar esposo y esposa según el género
        const person1 = persons.find(p => p.id === rel.person1_id);
        const person2 = persons.find(p => p.id === rel.person2_id);
        
        if (person1 && person2) {
          if (person1.gender === 'male') {
            familyRelations.get(familyKey).husband = person1.id;
            familyRelations.get(familyKey).wife = person2.id;
          } else {
            familyRelations.get(familyKey).husband = person2.id;
            familyRelations.get(familyKey).wife = person1.id;
          }
        }
      });
      
      // Asignar hijos a las familias
      parentChildRelations.forEach(rel => {
        const parentId = rel.relationship_type === 'parent' ? rel.person1_id : rel.person2_id;
        const childId = rel.relationship_type === 'parent' ? rel.person2_id : rel.person1_id;
        
        // Buscar la familia a la que pertenece este padre
        for (const [key, family] of familyRelations.entries()) {
          if (family.husband === parentId || family.wife === parentId) {
            if (!family.children.includes(childId)) {
              family.children.push(childId);
            }
            break;
          }
        }
      });
      
      // Generar registros GEDCOM para familias
      let familyCounter = 1;
      for (const [key, family] of familyRelations.entries()) {
        gedcom.push(`0 @F${familyCounter}@ FAM`);
        
        if (family.husband) {
          gedcom.push(`1 HUSB @I${family.husband}@`);
          
          // Añadir referencia a la familia en el individuo
          const husbIndex = gedcom.findIndex(line => line === `0 @I${family.husband}@ INDI`);
          if (husbIndex !== -1) {
            gedcom.splice(husbIndex + 1, 0, `1 FAMS @F${familyCounter}@`);
          }
        }
        
        if (family.wife) {
          gedcom.push(`1 WIFE @I${family.wife}@`);
          
          // Añadir referencia a la familia en el individuo
          const wifeIndex = gedcom.findIndex(line => line === `0 @I${family.wife}@ INDI`);
          if (wifeIndex !== -1) {
            gedcom.splice(wifeIndex + 1, 0, `1 FAMS @F${familyCounter}@`);
          }
        }
        
        // Añadir hijos
        family.children.forEach(childId => {
          gedcom.push(`1 CHIL @I${childId}@`);
          
          // Añadir referencia a la familia en el hijo
          const childIndex = gedcom.findIndex(line => line === `0 @I${childId}@ INDI`);
          if (childIndex !== -1) {
            gedcom.splice(childIndex + 1, 0, `1 FAMC @F${familyCounter}@`);
          }
        });
        
        // Añadir fecha de matrimonio si existe
        if (family.marriageDate) {
          gedcom.push('1 MARR');
          gedcom.push(`2 DATE ${new Date(family.marriageDate).toLocaleDateString('en-US')}`);
          
          if (family.marriagePlace) {
            gedcom.push(`2 PLAC ${family.marriagePlace}`);
          }
        }
        
        familyCounter++;
      }
      
      // Finalizar archivo GEDCOM
      gedcom.push('0 TRLR');
      
      // Enviar el archivo GEDCOM como respuesta
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${family.name.replace(/\s/g, '_')}.ged"`);
      res.send(gedcom.join('\n'));
    } catch (error) {
      console.error('Error al exportar GEDCOM:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al exportar GEDCOM', 
        error: error.message 
      });
    }
  }
};

module.exports = gedcomController;