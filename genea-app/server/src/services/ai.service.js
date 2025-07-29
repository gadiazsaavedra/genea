class AIService {
  constructor() {
    this.relationshipPatterns = {
      apellidos: {
        mismo: 0.8,
        similar: 0.6,
        diferente: 0.1
      },
      fechas: {
        generacion: 25, // años promedio por generación
        tolerancia: 5   // años de tolerancia
      },
      lugares: {
        mismo: 0.9,
        cercano: 0.7,
        diferente: 0.2
      }
    };
  }

  // Buscar información específica en los datos familiares
  async searchFamilyData(familyData, query) {
    const results = [];
    // Normalizar búsqueda removiendo tildes
    const normalizeText = (text) => {
      return text.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    };
    
    const searchTerms = normalizeText(query).split(' ');
    
    familyData.forEach(person => {
      const personData = {
        name: `${person.first_name || ''} ${person.last_name || ''}`.trim(),
        birth_date: person.birth_date,
        death_date: person.death_date,
        birth_place: person.birth_place,
        death_place: person.death_place,
        occupation: person.occupation,
        notes: person.notes,
        cause_of_death: person.cause_of_death,
        health_info: person.health_info
      };
      
      // Buscar en todos los campos de texto (normalizado)
      const searchableText = normalizeText(
        Object.values(personData)
          .filter(value => typeof value === 'string' && value !== null)
          .join(' ')
      );
      
      console.log(`Searching in: ${personData.name} - Normalized: ${searchableText}`);
      
      // Verificar si algún término de búsqueda coincide
      const matches = searchTerms.filter(term => 
        searchableText.includes(term)
      );
      
      console.log(`Query terms: [${searchTerms.join(', ')}] - Matches: [${matches.join(', ')}] - Found: ${matches.length > 0}`);
      
      if (matches.length > 0) {
        results.push({
          person: personData,
          matches: matches,
          relevance: matches.length / searchTerms.length
        });
      }
    });
    
    return results.sort((a, b) => b.relevance - a.relevance);
  }

  // Sugerir relaciones familiares basadas en datos
  async suggestRelationships(familyData) {
    const suggestions = [];
    
    for (let i = 0; i < familyData.length; i++) {
      for (let j = i + 1; j < familyData.length; j++) {
        const person1 = familyData[i];
        const person2 = familyData[j];
        
        const relationship = this.analyzeRelationship(person1, person2);
        
        if (relationship.confidence > 0.6) {
          suggestions.push({
            person1: person1,
            person2: person2,
            suggested_relationship: relationship.type,
            confidence: relationship.confidence,
            reasons: relationship.reasons,
            evidence: relationship.evidence
          });
        }
      }
    }
    
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  analyzeRelationship(person1, person2) {
    const analysis = {
      type: 'unknown',
      confidence: 0,
      reasons: [],
      evidence: []
    };

    // Análisis de apellidos
    const surnameAnalysis = this.analyzeSurnames(person1, person2);
    analysis.confidence += surnameAnalysis.score;
    if (surnameAnalysis.evidence) {
      analysis.reasons.push(surnameAnalysis.reason);
      analysis.evidence.push(surnameAnalysis.evidence);
    }

    // Análisis de fechas de nacimiento
    const ageAnalysis = this.analyzeAges(person1, person2);
    analysis.confidence += ageAnalysis.score;
    if (ageAnalysis.evidence) {
      analysis.reasons.push(ageAnalysis.reason);
      analysis.evidence.push(ageAnalysis.evidence);
    }

    // Análisis de lugares
    const locationAnalysis = this.analyzeLocations(person1, person2);
    analysis.confidence += locationAnalysis.score;
    if (locationAnalysis.evidence) {
      analysis.reasons.push(locationAnalysis.reason);
      analysis.evidence.push(locationAnalysis.evidence);
    }

    // Determinar tipo de relación
    analysis.type = this.determineRelationshipType(person1, person2, ageAnalysis.ageDiff);
    
    return analysis;
  }

  analyzeSurnames(person1, person2) {
    const surname1 = person1.last_name?.toLowerCase() || '';
    const surname2 = person2.last_name?.toLowerCase() || '';
    
    if (surname1 === surname2 && surname1 !== '') {
      return {
        score: 0.4,
        reason: 'Mismo apellido',
        evidence: `Ambos tienen el apellido "${person1.last_name}"`
      };
    }
    
    // Verificar apellido de soltera
    const maiden1 = person1.maiden_name?.toLowerCase() || '';
    const maiden2 = person2.maiden_name?.toLowerCase() || '';
    
    if (maiden1 === surname2 || maiden2 === surname1) {
      return {
        score: 0.3,
        reason: 'Apellido de soltera coincide',
        evidence: 'Posible relación por línea materna'
      };
    }

    // Similitud fonética básica
    if (this.areSimilar(surname1, surname2)) {
      return {
        score: 0.2,
        reason: 'Apellidos similares',
        evidence: `"${person1.last_name}" y "${person2.last_name}" son fonéticamente similares`
      };
    }

    return { score: 0, reason: null, evidence: null };
  }

  analyzeAges(person1, person2) {
    if (!person1.birth_date || !person2.birth_date) {
      return { score: 0, reason: null, evidence: null, ageDiff: null };
    }

    const date1 = new Date(person1.birth_date);
    const date2 = new Date(person2.birth_date);
    const ageDiff = Math.abs(date1.getFullYear() - date2.getFullYear());

    if (ageDiff <= 5) {
      return {
        score: 0.3,
        reason: 'Edades similares',
        evidence: `Diferencia de ${ageDiff} años - posibles hermanos o primos`,
        ageDiff
      };
    }

    if (ageDiff >= 20 && ageDiff <= 35) {
      return {
        score: 0.4,
        reason: 'Diferencia generacional',
        evidence: `Diferencia de ${ageDiff} años - posible relación padre/hijo`,
        ageDiff
      };
    }

    if (ageDiff >= 45 && ageDiff <= 65) {
      return {
        score: 0.3,
        reason: 'Dos generaciones de diferencia',
        evidence: `Diferencia de ${ageDiff} años - posible relación abuelo/nieto`,
        ageDiff
      };
    }

    return { score: 0.1, reason: null, evidence: null, ageDiff };
  }

  analyzeLocations(person1, person2) {
    const place1 = person1.birth_place?.toLowerCase() || '';
    const place2 = person2.birth_place?.toLowerCase() || '';

    if (place1 === place2 && place1 !== '') {
      return {
        score: 0.3,
        reason: 'Mismo lugar de nacimiento',
        evidence: `Ambos nacieron en ${person1.birth_place}`
      };
    }

    // Verificar si son lugares cercanos (misma provincia/región)
    if (this.areNearbyLocations(place1, place2)) {
      return {
        score: 0.2,
        reason: 'Lugares cercanos',
        evidence: `Nacieron en lugares cercanos: ${person1.birth_place} y ${person2.birth_place}`
      };
    }

    return { score: 0, reason: null, evidence: null };
  }

  determineRelationshipType(person1, person2, ageDiff) {
    if (!ageDiff) return 'unknown';

    if (ageDiff <= 5) {
      return 'sibling'; // hermano/a
    }

    if (ageDiff >= 20 && ageDiff <= 35) {
      return 'parent_child'; // padre/hijo
    }

    if (ageDiff >= 45 && ageDiff <= 65) {
      return 'grandparent_grandchild'; // abuelo/nieto
    }

    if (ageDiff >= 10 && ageDiff <= 20) {
      return 'uncle_nephew'; // tío/sobrino
    }

    return 'cousin'; // primo (por defecto)
  }

  areSimilar(str1, str2) {
    if (!str1 || !str2) return false;
    
    // Algoritmo simple de similitud
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return true;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length > 0.7;
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  areNearbyLocations(place1, place2) {
    // Lista de provincias argentinas y sus ciudades principales
    const provinces = {
      'buenos aires': ['la plata', 'mar del plata', 'bahía blanca', 'tandil'],
      'córdoba': ['villa carlos paz', 'río cuarto', 'villa maría'],
      'santa fe': ['rosario', 'santa fe', 'rafaela'],
      'mendoza': ['san rafael', 'godoy cruz', 'luján de cuyo']
    };

    for (const [province, cities] of Object.entries(provinces)) {
      if ((place1.includes(province) || cities.some(city => place1.includes(city))) &&
          (place2.includes(province) || cities.some(city => place2.includes(city)))) {
        return true;
      }
    }

    return false;
  }

  // Detectar duplicados potenciales
  async detectDuplicates(familyData) {
    const duplicates = [];
    
    for (let i = 0; i < familyData.length; i++) {
      for (let j = i + 1; j < familyData.length; j++) {
        const person1 = familyData[i];
        const person2 = familyData[j];
        
        const similarity = this.calculateSimilarity(person1, person2);
        
        if (similarity > 0.8) {
          duplicates.push({
            person1,
            person2,
            similarity,
            reasons: this.getDuplicateReasons(person1, person2)
          });
        }
      }
    }
    
    return duplicates;
  }

  calculateSimilarity(person1, person2) {
    let score = 0;
    let factors = 0;

    // Nombre
    if (person1.first_name && person2.first_name) {
      factors++;
      if (person1.first_name.toLowerCase() === person2.first_name.toLowerCase()) {
        score += 0.4;
      } else if (this.areSimilar(person1.first_name.toLowerCase(), person2.first_name.toLowerCase())) {
        score += 0.2;
      }
    }

    // Apellido
    if (person1.last_name && person2.last_name) {
      factors++;
      if (person1.last_name.toLowerCase() === person2.last_name.toLowerCase()) {
        score += 0.3;
      }
    }

    // Fecha de nacimiento
    if (person1.birth_date && person2.birth_date) {
      factors++;
      if (person1.birth_date === person2.birth_date) {
        score += 0.3;
      }
    }

    return factors > 0 ? score / factors : 0;
  }

  getDuplicateReasons(person1, person2) {
    const reasons = [];
    
    if (person1.first_name?.toLowerCase() === person2.first_name?.toLowerCase()) {
      reasons.push('Mismo nombre');
    }
    
    if (person1.last_name?.toLowerCase() === person2.last_name?.toLowerCase()) {
      reasons.push('Mismo apellido');
    }
    
    if (person1.birth_date === person2.birth_date) {
      reasons.push('Misma fecha de nacimiento');
    }
    
    return reasons;
  }
}

module.exports = new AIService();