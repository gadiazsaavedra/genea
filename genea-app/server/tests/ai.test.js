const aiService = require('../src/services/ai.service');

describe('AI Service', () => {
  const mockFamilyData = [
    {
      id: '1',
      first_name: 'Juan',
      last_name: 'García',
      birth_date: '1950-05-15',
      birth_place: 'Buenos Aires'
    },
    {
      id: '2',
      first_name: 'María',
      last_name: 'García',
      birth_date: '1955-08-22',
      birth_place: 'Buenos Aires'
    },
    {
      id: '3',
      first_name: 'Carlos',
      last_name: 'García',
      birth_date: '1980-03-10',
      birth_place: 'Buenos Aires'
    }
  ];

  test('should suggest relationships based on surnames', async () => {
    const suggestions = await aiService.suggestRelationships(mockFamilyData);
    
    expect(suggestions).toBeDefined();
    expect(Array.isArray(suggestions)).toBe(true);
    
    // Should find relationships between people with same surname
    const garciaRelations = suggestions.filter(s => 
      s.person1.last_name === 'García' && s.person2.last_name === 'García'
    );
    expect(garciaRelations.length).toBeGreaterThan(0);
  });

  test('should analyze age differences correctly', () => {
    const person1 = { birth_date: '1950-01-01' };
    const person2 = { birth_date: '1980-01-01' };
    
    const analysis = aiService.analyzeAges(person1, person2);
    
    expect(analysis.ageDiff).toBe(30);
    expect(analysis.score).toBeGreaterThan(0);
  });

  test('should detect potential duplicates', async () => {
    const duplicateData = [
      {
        id: '1',
        first_name: 'Juan',
        last_name: 'García',
        birth_date: '1950-05-15'
      },
      {
        id: '2',
        first_name: 'Juan',
        last_name: 'García',
        birth_date: '1950-05-15'
      }
    ];

    const duplicates = await aiService.detectDuplicates(duplicateData);
    
    expect(duplicates).toBeDefined();
    expect(duplicates.length).toBeGreaterThan(0);
    expect(duplicates[0].similarity).toBeGreaterThan(0.8);
  });

  test('should calculate similarity correctly', () => {
    const person1 = {
      first_name: 'Juan',
      last_name: 'García',
      birth_date: '1950-05-15'
    };
    
    const person2 = {
      first_name: 'Juan',
      last_name: 'García',
      birth_date: '1950-05-15'
    };

    const similarity = aiService.calculateSimilarity(person1, person2);
    expect(similarity).toBeGreaterThan(0.8);
  });

  test('should identify nearby locations', () => {
    const result1 = aiService.areNearbyLocations('buenos aires', 'la plata');
    const result2 = aiService.areNearbyLocations('córdoba', 'villa carlos paz');
    const result3 = aiService.areNearbyLocations('buenos aires', 'mendoza');
    
    expect(result1).toBe(true);
    expect(result2).toBe(true);
    expect(result3).toBe(false);
  });
});