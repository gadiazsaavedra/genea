// Utilidad para confirmación de eliminación segura
export const confirmDelete = (itemName, itemType = 'elemento') => {
  // Primera confirmación
  const step1 = window.confirm(`¿Estás seguro de que deseas eliminar ${itemType}: "${itemName}"?`);
  
  if (!step1) return false;
  
  // Segunda confirmación con nombre
  const userInput = window.prompt(
    `⚠️ CONFIRMACIÓN FINAL ⚠️\n\nPara eliminar "${itemName}" permanentemente, escribe exactamente:\nELIMINAR\n\n(Esta acción no se puede deshacer)`
  );
  
  return userInput === 'ELIMINAR';
};

export const confirmDeleteTyped = (itemName, itemType = 'elemento') => {
  const userInput = window.prompt(
    `🚨 ELIMINAR ${itemType.toUpperCase()} 🚨\n\n"${itemName}"\n\nPara confirmar, escribe el nombre exacto del ${itemType}:`
  );
  
  return userInput === itemName;
};