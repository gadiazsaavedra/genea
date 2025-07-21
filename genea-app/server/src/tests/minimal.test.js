// Prueba mínima sin dependencias de MongoDB
describe('Prueba mínima', () => {
  test('debería pasar', () => {
    expect(1 + 1).toBe(2);
  });
  
  test('debería manejar strings', () => {
    expect('hello ' + 'world').toBe('hello world');
  });
  
  test('debería manejar arrays', () => {
    expect([1, 2, 3].length).toBe(3);
  });
});