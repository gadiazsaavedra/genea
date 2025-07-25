// Test para verificar detección de familias gratuitas
const FREE_FAMILIES = [
  'barbara', 'barbará', 'bárbara',
  'familia barbara', 'familia barbará', 'familia bárbara',
  'descendencia barbara', 'descendencia barbará',
  'linaje barbara', 'linaje barbará'
];

function testFamilyNames() {
  const testNames = [
    'Barbara',
    'Barbará', 
    'Bárbara',
    'Familia Barbara',
    'Familia Barbará',
    'Descendencia Barbara',
    'Linaje Barbará',
    'Barbara y descendientes',
    'Los Barbara',
    'Árbol Barbara',
    'Genealogía Barbará',
    'Casa Barbara',
    // Nombres que NO deberían ser gratis
    'Familia García',
    'Los Pérez',
    'Descendencia Martínez'
  ];

  console.log('🧪 Probando detección de familias gratuitas:\n');

  testNames.forEach(name => {
    const familyNameLower = name.toLowerCase();
    const isFreeFamily = FREE_FAMILIES.some(freeName => {
      return familyNameLower.includes(freeName.toLowerCase()) || 
             familyNameLower.startsWith(freeName.toLowerCase()) ||
             familyNameLower.endsWith(freeName.toLowerCase());
    });

    const status = isFreeFamily ? '✅ GRATIS' : '❌ PAGO';
    console.log(`${status} - "${name}"`);
  });

  console.log('\n📋 Resumen:');
  console.log('✅ Familias con acceso gratuito: Cualquier nombre que contenga "barbara", "barbará" o "bárbara"');
  console.log('❌ Otras familias: Requieren licencia pagada');
}

testFamilyNames();