const registroCivilService = require('../src/services/registroCivil.service');

describe('Registro Civil Service', () => {
  test('should search by DNI', async () => {
    const result = await registroCivilService.buscarPorDNI('12345678');
    
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('dni');
    expect(result.data).toHaveProperty('nombre');
    expect(result.data).toHaveProperty('apellido');
    expect(result.source).toBe('registro_civil');
  });

  test('should search birth certificate', async () => {
    const result = await registroCivilService.buscarActaNacimiento(
      'Juan', 'García', '1950-05-15'
    );
    
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('numeroActa');
    expect(result.data).toHaveProperty('nombre');
    expect(result.data).toHaveProperty('apellido');
    expect(result.source).toBe('actas_nacimiento');
  });

  test('should search immigration records', async () => {
    const result = await registroCivilService.buscarInmigracion(
      'Giuseppe', 'Rossi', 'Italia'
    );
    
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('paisOrigen');
    expect(result.data).toHaveProperty('fechaLlegada');
    expect(result.data).toHaveProperty('puerto');
    expect(result.source).toBe('registros_inmigracion');
  });

  test('should search parish records', async () => {
    const result = await registroCivilService.buscarRegistrosParroquiales(
      'Juan', 'García', 'San José'
    );
    
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('parroquia');
    expect(result.data).toHaveProperty('fechaBautismo');
    expect(result.source).toBe('registros_parroquiales');
  });

  test('should perform complete search', async () => {
    const persona = {
      dni: '12345678',
      nombre: 'Juan',
      apellido: 'García',
      fechaNacimiento: '1950-05-15',
      paisOrigen: 'Italia'
    };

    const result = await registroCivilService.busquedaCompleta(persona);
    
    expect(result.success).toBe(true);
    expect(result.resultados).toHaveProperty('registroCivil');
    expect(result.resultados).toHaveProperty('actaNacimiento');
    expect(result.resultados).toHaveProperty('inmigracion');
    expect(result.resumen).toHaveProperty('fuentesConsultadas');
    expect(result.resumen).toHaveProperty('datosEncontrados');
  });

  test('should generate recommendations', () => {
    const mockResults = {
      registroCivil: { success: false },
      actaNacimiento: { success: true },
      inmigracion: { success: false },
      parroquiales: { success: true }
    };

    const recommendations = registroCivilService.generarRecomendaciones(mockResults);
    
    expect(Array.isArray(recommendations)).toBe(true);
    expect(recommendations).toContain('Consultar Registro Civil con DNI');
    expect(recommendations).toContain('Consultar archivos de inmigración en Archivo General de la Nación');
  });
});