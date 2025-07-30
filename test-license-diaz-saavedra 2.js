// Script para probar el sistema de licencias con familias Díaz Saavedra

// Casos de prueba
const testCases = [
  {
    familyName: 'Familia Díaz',
    shouldHaveLicense: true
  },
  {
    familyName: 'Familia Saavedra', 
    shouldHaveLicense: true
  },
  {
    familyName: 'Familia Díaz Saavedra',
    shouldHaveLicense: true
  },
  {
    familyName: 'Los Diaz',
    shouldHaveLicense: true
  },
  {
    familyName: 'Descendientes Saavedra',
    shouldHaveLicense: true
  },
  {
    familyName: 'Familia García',
    shouldHaveLicense: false
  }
];

async function testLicenseSystem() {
  console.log('=== PRUEBA DEL SISTEMA DE LICENCIAS DÍAZ SAAVEDRA ===\n');
  
  // Probar nombres de familia
  console.log('1. Probando nombres de familia:\n');
  
  const FREE_FAMILIES = [
    // Familia Barbará (original)
    'barbara', 'barbará', 'bárbara',
    'familia barbara', 'familia barbará', 'familia bárbara',
    'descendencia barbara', 'descendencia barbará',
    'linaje barbara', 'linaje barbará',
    
    // Familia Díaz Saavedra (paterna del desarrollador)
    'diaz saavedra', 'díaz saavedra', 'diaz-saavedra', 'díaz-saavedra',
    'diaz', 'díaz', 'saavedra',
    'familia diaz', 'familia díaz', 'familia saavedra',
    'familia diaz saavedra', 'familia díaz saavedra',
    'descendencia diaz', 'descendencia díaz', 'descendencia saavedra',
    'linaje diaz', 'linaje díaz', 'linaje saavedra'
  ];
  
  testCases.forEach(testCase => {
    const familyName = testCase.familyName.toLowerCase();
    const hasFreeLicense = FREE_FAMILIES.some(freeName => {
      return familyName.includes(freeName.toLowerCase()) || 
             familyName.startsWith(freeName.toLowerCase()) ||
             familyName.endsWith(freeName.toLowerCase());
    });
    
    const status = hasFreeLicense ? '✅ GRATIS' : '❌ PAGO';
    const expected = testCase.shouldHaveLicense ? '✅ GRATIS' : '❌ PAGO';
    const result = status === expected ? '✅' : '❌';
    
    console.log(`${result} ${testCase.familyName}: ${status} (esperado: ${expected})`);
  });
  
  console.log('\n2. Familias con acceso gratuito:\n');
  console.log('✅ Familia Barbará y variaciones');
  console.log('✅ Familia Díaz y variaciones');
  console.log('✅ Familia Saavedra y variaciones');
  console.log('✅ Familia Díaz Saavedra y variaciones');
  
  console.log('\n3. Patrones reconocidos:\n');
  console.log('- diaz, díaz');
  console.log('- saavedra');
  console.log('- diaz saavedra, díaz saavedra');
  console.log('- diaz-saavedra, díaz-saavedra');
  console.log('- familia + cualquiera de los anteriores');
  console.log('- descendencia + cualquiera de los anteriores');
  console.log('- linaje + cualquiera de los anteriores');
  
  console.log('\n=== PRUEBA COMPLETADA ===');
}

// Ejecutar pruebas
testLicenseSystem();