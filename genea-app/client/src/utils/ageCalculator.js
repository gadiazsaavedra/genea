// Utilidad para calcular edades al momento de tener hijos
export const calculateParentAgeAtBirth = (parentBirthDate, childBirthDate) => {
  if (!parentBirthDate || !childBirthDate) return null;
  
  const parentDate = new Date(parentBirthDate);
  const childDate = new Date(childBirthDate);
  
  if (isNaN(parentDate.getTime()) || isNaN(childDate.getTime())) return null;
  if (childDate < parentDate) return null; // Hijo no puede nacer antes que el padre
  
  const ageInMilliseconds = childDate - parentDate;
  const ageInYears = Math.floor(ageInMilliseconds / (365.25 * 24 * 60 * 60 * 1000));
  
  return ageInYears;
};

export const getParentAgeInfo = (people, relationships) => {
  const parentAgeInfo = [];
  
  relationships.forEach(rel => {
    if (rel.relationship_type === 'parent') {
      const parent = people.find(p => p.id === rel.person1_id);
      const child = people.find(p => p.id === rel.person2_id);
      
      if (parent && child) {
        const age = calculateParentAgeAtBirth(parent.birth_date, child.birth_date);
        
        if (age !== null) {
          parentAgeInfo.push({
            parentId: parent.id,
            parentName: `${parent.first_name} ${parent.last_name || ''}`.trim(),
            childId: child.id,
            childName: `${child.first_name} ${child.last_name || ''}`.trim(),
            parentGender: parent.gender,
            ageAtBirth: age,
            parentBirthYear: parent.birth_date ? new Date(parent.birth_date).getFullYear() : null,
            childBirthYear: child.birth_date ? new Date(child.birth_date).getFullYear() : null
          });
        }
      }
    }
  });
  
  return parentAgeInfo.sort((a, b) => a.ageAtBirth - b.ageAtBirth);
};