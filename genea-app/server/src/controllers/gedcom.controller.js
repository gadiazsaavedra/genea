const Person = require('../models/person.model');
const Family = require('../models/family.model');

const gedcomController = {
  // Exportar árbol genealógico en formato GEDCOM
  exportGedcom: async (req, res) => {
    try {
      const { familyId } = req.params;
      
      // Verificar que el usuario tiene acceso a esta familia
      const family = await Family.findById(familyId);
      if (!family) {
        return res.status(404).json({ message: 'Familia no encontrada' });
      }
      
      const userId = req.user.uid;
      if (!family.members.includes(userId) && !family.admins.includes(userId) && !family.editors.includes(userId)) {
        return res.status(403).json({ message: 'No tienes acceso a esta familia' });
      }
      
      // Obtener todas las personas de la familia
      const persons = await Person.find({ familyId });
      
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
      gedcom.push(`1 FILE ${family.name.replace(/\\s/g, '_')}.ged`);
      gedcom.push(`1 SUBM @SUBM@`);
      
      // Información del remitente
      gedcom.push('0 @SUBM@ SUBM');
      gedcom.push(`1 NAME ${req.user.displayName || 'Usuario de Genea'}`);
      
      // Personas
      persons.forEach(person => {
        gedcom.push(`0 @I${person._id}@ INDI`);
        gedcom.push(`1 NAME ${person.firstName} /${person.lastName}/`);
        
        if (person.gender) {
          gedcom.push(`1 SEX ${person.gender === 'male' ? 'M' : person.gender === 'female' ? 'F' : 'U'}`);
        }
        
        if (person.birthDate) {
          gedcom.push('1 BIRT');
          gedcom.push(`2 DATE ${new Date(person.birthDate).toLocaleDateString('en-US')}`);
          
          if (person.birthPlace) {
            gedcom.push(`2 PLAC ${person.birthPlace}`);
          }
        }
        
        if (person.deathDate) {
          gedcom.push('1 DEAT');
          gedcom.push(`2 DATE ${new Date(person.deathDate).toLocaleDateString('en-US')}`);
          
          if (person.deathPlace) {
            gedcom.push(`2 PLAC ${person.deathPlace}`);
          }
        }
        
        // Relaciones familiares
        if (person.parents && person.parents.length > 0) {
          person.parents.forEach(parentId => {
            gedcom.push(`1 FAMC @F${parentId}@`);
          });
        }
        
        if (person.spouses && person.spouses.length > 0) {
          person.spouses.forEach(spouseId => {
            gedcom.push(`1 FAMS @F${spouseId}@`);
          });
        }
        
        // Notas
        if (person.notes) {
          gedcom.push(`1 NOTE ${person.notes.replace(/\\n/g, '\\n1 CONT ')}`);
        }
      });
      
      // Familias
      const families = [];
      
      // Crear familias basadas en relaciones padre-hijo
      persons.forEach(person => {
        if (person.children && person.children.length > 0) {
          const spouseIds = person.spouses || [];
          
          spouseIds.forEach(spouseId => {
            const familyId = `${person._id}_${spouseId}`;
            
            if (!families.includes(familyId)) {
              families.push(familyId);
              
              gedcom.push(`0 @F${familyId}@ FAM`);
              
              if (person.gender === 'male') {
                gedcom.push(`1 HUSB @I${person._id}@`);
                gedcom.push(`1 WIFE @I${spouseId}@`);
              } else {
                gedcom.push(`1 HUSB @I${spouseId}@`);
                gedcom.push(`1 WIFE @I${person._id}@`);
              }
              
              // Añadir hijos
              person.children.forEach(childId => {
                gedcom.push(`1 CHIL @I${childId}@`);
              });
              
              // Añadir fecha de matrimonio si existe
              const spouse = persons.find(p => p._id.toString() === spouseId.toString());
              if (spouse && spouse.marriageDate) {
                gedcom.push('1 MARR');
                gedcom.push(`2 DATE ${new Date(spouse.marriageDate).toLocaleDateString('en-US')}`);
                
                if (spouse.marriagePlace) {
                  gedcom.push(`2 PLAC ${spouse.marriagePlace}`);
                }
              }
            }
          });
        }
      });
      
      // Finalizar archivo GEDCOM
      gedcom.push('0 TRLR');
      
      // Enviar el archivo GEDCOM como respuesta
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${family.name.replace(/\\s/g, '_')}.ged"`);
      res.send(gedcom.join('\\n'));
    } catch (error) {
      console.error('Error al exportar GEDCOM:', error);
      res.status(500).json({ message: 'Error al exportar GEDCOM', error: error.message });
    }
  }
};

module.exports = gedcomController;