// Tipos de relaciones familiares completas
const RELATIONSHIP_TYPES = {
  // Relaciones directas
  'parent': 'Padre/Madre',
  'child': 'Hijo/Hija',
  'spouse': 'Esposo/Esposa',
  
  // Relaciones generacionales
  'grandparent': 'Abuelo/Abuela',
  'grandchild': 'Nieto/Nieta',
  'great_grandparent': 'Bisabuelo/Bisabuela',
  'great_grandchild': 'Bisnieto/Bisnieta',
  
  // Relaciones horizontales
  'sibling': 'Hermano/Hermana',
  'half_sibling': 'Medio hermano/hermana',
  
  // Relaciones colaterales
  'uncle_aunt': 'Tío/Tía',
  'nephew_niece': 'Sobrino/Sobrina',
  
  // Primos
  'cousin_first': 'Primo hermano',
  'cousin_second': 'Primo en segundo grado',
  'cousin_third': 'Primo tercero',
  
  // Relaciones políticas (por matrimonio)
  'father_in_law': 'Suegro',
  'mother_in_law': 'Suegra',
  'son_in_law': 'Yerno',
  'daughter_in_law': 'Nuera',
  'brother_in_law': 'Cuñado',
  'sister_in_law': 'Cuñada',
  'co_brother_in_law': 'Concuñado',
  'co_sister_in_law': 'Concuñada',
  'co_father_in_law': 'Consuegro',
  'co_mother_in_law': 'Consuegra',
  
  // Relaciones por segundas nupcias
  'stepfather': 'Padrastro',
  'stepmother': 'Madrastra',
  'stepson': 'Hijastro',
  'stepdaughter': 'Hijastra',
  
  // Relaciones espirituales
  'godfather': 'Padrino',
  'godmother': 'Madrina',
  'godson': 'Ahijado',
  'goddaughter': 'Ahijada'
};

// Relaciones recíprocas
const RECIPROCAL_RELATIONSHIPS = {
  'parent': 'child',
  'child': 'parent',
  'grandparent': 'grandchild',
  'grandchild': 'grandparent',
  'great_grandparent': 'great_grandchild',
  'great_grandchild': 'great_grandparent',
  'uncle_aunt': 'nephew_niece',
  'nephew_niece': 'uncle_aunt',
  'sibling': 'sibling',
  'half_sibling': 'half_sibling',
  'cousin_first': 'cousin_first',
  'cousin_second': 'cousin_second',
  'cousin_third': 'cousin_third',
  'spouse': 'spouse',
  'father_in_law': 'son_in_law',
  'mother_in_law': 'daughter_in_law',
  'son_in_law': 'father_in_law',
  'daughter_in_law': 'mother_in_law',
  'brother_in_law': 'sister_in_law',
  'sister_in_law': 'brother_in_law',
  'stepfather': 'stepson',
  'stepmother': 'stepdaughter',
  'stepson': 'stepfather',
  'stepdaughter': 'stepmother',
  'godfather': 'godson',
  'godmother': 'goddaughter',
  'godson': 'godfather',
  'goddaughter': 'godmother'
};

// Categorías de relaciones
const RELATIONSHIP_CATEGORIES = {
  'direct': ['parent', 'child', 'spouse'],
  'generational': ['grandparent', 'grandchild', 'great_grandparent', 'great_grandchild'],
  'horizontal': ['sibling', 'half_sibling'],
  'collateral': ['uncle_aunt', 'nephew_niece'],
  'cousins': ['cousin_first', 'cousin_second', 'cousin_third'],
  'in_laws': ['father_in_law', 'mother_in_law', 'son_in_law', 'daughter_in_law', 'brother_in_law', 'sister_in_law', 'co_brother_in_law', 'co_sister_in_law', 'co_father_in_law', 'co_mother_in_law'],
  'step': ['stepfather', 'stepmother', 'stepson', 'stepdaughter'],
  'spiritual': ['godfather', 'godmother', 'godson', 'goddaughter']
};

module.exports = {
  RELATIONSHIP_TYPES,
  RECIPROCAL_RELATIONSHIPS,
  RELATIONSHIP_CATEGORIES
};