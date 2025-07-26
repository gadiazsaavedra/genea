import React, { useState, useRef, useEffect } from 'react';

const TreeVisualization = ({ people, relationships, viewType }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [forceUpdate, setForceUpdate] = useState(0);
  const containerRef = useRef(null);
  
  // Forzar re-render cuando people cambie
  useEffect(() => {
    console.log('People changed, forcing update:', people.length);
    setForceUpdate(prev => prev + 1);
  }, [people]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const newZoom = zoom + (e.deltaY > 0 ? -0.1 : 0.1);
    setZoom(Math.max(0.5, Math.min(3, newZoom)));
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [zoom]);

  const renderTraditionalTree = () => {
    console.log('Rendering traditional tree with', people.length, 'people');
    
    if (!people || people.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No hay personas en el árbol</p>
        </div>
      );
    }

    // Organizar personas por generaciones
    const organizeByGenerations = () => {
      const generations = {};
      const visited = new Set();
      const safeRelationships = relationships || [];
      
      console.log('=== ORGANIZING GENERATIONS ===');
      console.log('People:', people.length);
      console.log('Relationships:', safeRelationships.length);
      console.log('Relationships data:', JSON.stringify(safeRelationships, null, 2));
      
      // Encontrar personas sin padres (fundadores)
      const founders = people.filter(person => {
        const hasParents = safeRelationships.some(rel => 
          rel.relationship_type === 'parent' && rel.person2_id === person.id
        );
        console.log(`Person ${person.first_name} has parents:`, hasParents);
        return !hasParents;
      });
      
      console.log('Founders found:', founders.length, founders.map(f => f.first_name));
      
      // Organizar por generaciones reales
      if (founders.length === 0) {
        generations[0] = people;
      } else {
        generations[0] = founders;
        
        // Agregar hijos en generaciones siguientes
        let currentGen = 0;
        while (generations[currentGen] && generations[currentGen].length > 0) {
          const children = [];
          generations[currentGen].forEach(parent => {
            const parentChildren = safeRelationships
              .filter(rel => rel.relationship_type === 'parent' && rel.person1_id === parent.id)
              .map(rel => people.find(p => p.id === rel.person2_id))
              .filter(child => child && !visited.has(child.id));
            
            parentChildren.forEach(child => {
              visited.add(child.id);
              children.push(child);
            });
          });
          
          if (children.length > 0) {
            generations[currentGen + 1] = children;
          }
          currentGen++;
        }
      }
      
      console.log('Final generations:', generations);
      return generations;
    };
    
    const generations = organizeByGenerations();

    return (
      <div style={{ position: 'relative', padding: '40px' }}>
        {/* Líneas relacionales */}
        <svg style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          pointerEvents: 'none', 
          zIndex: 1 
        }} viewBox="0 0 1200 800" preserveAspectRatio="none">
          {(relationships || []).map((rel, index) => {
            const person1 = people.find(p => p.id === rel.person1_id);
            const person2 = people.find(p => p.id === rel.person2_id);
            
            if (!person1 || !person2) return null;
            
            if (rel.relationship_type === 'spouse') {
              // Calcular posiciones dinámicas para cónyuges
              const person1Index = people.findIndex(p => p.id === person1.id);
              const person2Index = people.findIndex(p => p.id === person2.id);
              
              // Usar coordenadas relativas para responsividad
              const foundersInGen0 = generations[0] || [];
              const person1PosInGen0 = foundersInGen0.findIndex(p => p.id === person1.id);
              const person2PosInGen0 = foundersInGen0.findIndex(p => p.id === person2.id);
              
              if (person1PosInGen0 === -1 || person2PosInGen0 === -1) return null;
              
              // Coordenadas relativas en el viewBox (1200x800)
              const x1 = person1PosInGen0 === 0 ? 300 : 900; // Izquierda o derecha
              const x2 = person2PosInGen0 === 0 ? 300 : 900;
              const y = 180;
              
              return (
                <g key={index}>
                  <line
                    x1={x1}
                    y1={y}
                    x2={x2}
                    y2={y}
                    stroke="#e91e63"
                    strokeWidth="3"
                    strokeDasharray="8,4"
                    opacity="0.8"
                  />
                  <rect 
                    x={(x1 + x2) / 2 - 40} 
                    y={y - 15} 
                    width="80" 
                    height="20" 
                    fill="white" 
                    stroke="#e91e63" 
                    strokeWidth="1" 
                    rx="3"
                  />
                  <text
                    x={(x1 + x2) / 2}
                    y={y - 2}
                    fill="#e91e63"
                    fontSize="11"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    CÓNYUGES
                  </text>
                </g>
              );
            } else if (rel.relationship_type === 'parent') {
              // Calcular posiciones dinámicas para padre-hijo
              const parentIndex = people.findIndex(p => p.id === person1.id);
              const childIndex = people.findIndex(p => p.id === person2.id);
              
              // Usar coordenadas relativas para padre-hijo
              const foundersInGen0 = generations[0] || [];
              const childrenInGen1 = generations[1] || [];
              
              const parentPosInGen0 = foundersInGen0.findIndex(p => p.id === person1.id);
              
              if (parentPosInGen0 === -1) return null;
              
              // Coordenadas relativas en viewBox
              const parentX = parentPosInGen0 === 0 ? 300 : 900; // Padre izquierda o derecha
              const spouseX = parentPosInGen0 === 0 ? 900 : 300; // Cónyuge opuesto
              const centerX = 600; // Centro entre ambos padres
              
              return (
                <g key={index}>
                  {/* Líneas desde ambos padres */}
                  <line x1={parentX} y1="250" x2={parentX} y2="320" stroke="#4caf50" strokeWidth="4" opacity="0.8" />
                  <line x1={spouseX} y1="250" x2={spouseX} y2="320" stroke="#4caf50" strokeWidth="4" opacity="0.8" />
                  
                  {/* Línea horizontal conectando ambos padres */}
                  <line x1={parentX} y1="320" x2={spouseX} y2="320" stroke="#4caf50" strokeWidth="4" opacity="0.8" />
                  
                  {/* Líneas hacia cada hijo desde la línea horizontal */}
                  {(() => {
                    const totalChildren = childrenInGen1.length;
                    const childPositions = [];
                    
                    // Calcular posiciones de los hijos basadas en su distribución real
                    for (let i = 0; i < totalChildren; i++) {
                      if (totalChildren === 1) {
                        childPositions.push(600); // Centro si hay un solo hijo
                      } else if (totalChildren === 2) {
                        childPositions.push(i === 0 ? 400 : 800); // Dos posiciones
                      } else if (totalChildren === 3) {
                        childPositions.push([300, 600, 900][i]); // Tres posiciones
                      } else if (totalChildren === 4) {
                        childPositions.push([250, 450, 650, 850][i]); // Cuatro posiciones
                      } else if (totalChildren === 5) {
                        childPositions.push([200, 350, 500, 650, 800][i]); // Cinco posiciones
                      } else {
                        // Para más de 5 hijos, distribuir uniformemente
                        childPositions.push(200 + (i * (600 / Math.max(totalChildren - 1, 1))));
                      }
                    }
                    
                    return childrenInGen1.map((child, childIdx) => {
                      const childX = childPositions[childIdx];
                      return (
                        <g key={child.id}>
                          <line x1={childX} y1="320" x2={childX} y2="420" stroke="#4caf50" strokeWidth="4" opacity="0.8" />
                          <polygon points={`${childX-5},415 ${childX},425 ${childX+5},415`} fill="#4caf50" />
                        </g>
                      );
                    });
                  })()}
                  
                  {/* Etiqueta solo para la primera relación padre-hijo */}
                  {relationships.filter(r => r.relationship_type === 'parent').indexOf(rel) === 0 && (
                    <g>
                      <rect x="540" y="305" width="120" height="20" fill="white" stroke="#4caf50" strokeWidth="1" rx="3" />
                      <text x="600" y="318" fill="#4caf50" fontSize="14" fontWeight="bold" textAnchor="middle">
                        HIJOS DE AMBOS
                      </text>
                    </g>
                  )}
                </g>
              );
            }
            return null;
          })}
        </svg>
        
        {/* Leyenda de relaciones */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: 'white',
          padding: '8px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          fontSize: '10px',
          zIndex: 3
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Relaciones ({(relationships || []).length}):</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <span style={{ 
              backgroundColor: '#4caf50', 
              color: 'white', 
              padding: '2px 6px', 
              borderRadius: '8px', 
              fontSize: '9px' 
            }}>Padre/Madre</span>
            <span style={{ fontSize: '12px' }}>Tiene hijos</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <span style={{ 
              backgroundColor: '#2196f3', 
              color: 'white', 
              padding: '2px 6px', 
              borderRadius: '8px', 
              fontSize: '9px' 
            }}>Hijo/Hija</span>
            <span style={{ fontSize: '12px' }}>Tiene padres</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ 
              backgroundColor: '#e91e63', 
              color: 'white', 
              padding: '2px 6px', 
              borderRadius: '8px', 
              fontSize: '9px' 
            }}>Cónyuge</span>
            <span style={{ fontSize: '12px' }}>Casado/a</span>
          </div>
        </div>
        
        <div style={{ position: 'relative', zIndex: 2 }}>
          {Object.keys(generations).map(genKey => (
            <div key={genKey} style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: genKey === '0' ? '200px' : '60px', // Mucha más separación para cónyuges
              marginBottom: genKey === '0' ? '120px' : '80px', // Más espacio para líneas
              flexWrap: 'wrap',
              position: 'relative'
            }}>
              {generations[genKey].map((person, index) => (
                <div key={person.id} style={{
                  border: '2px solid #1976d2',
                  borderRadius: '8px',
                  padding: '16px',
                  backgroundColor: 'white',
                  minWidth: '200px',
                  textAlign: 'center',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ 
                    width: '60px', 
                    height: '60px', 
                    borderRadius: '50%', 
                    backgroundColor: person.gender === 'male' ? '#2196f3' : '#e91e63',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px',
                    margin: '0 auto 12px'
                  }}>
                    {(person.first_name || person.fullName || '?').charAt(0)}
                  </div>
                  <h4 style={{ margin: '0 0 8px 0' }}>
                    {person.fullName || `${person.first_name || ''} ${person.last_name || ''}`.trim() || 'Sin nombre'}
                  </h4>
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4px' }}>
                    {person.isFounder && <span style={{ 
                      backgroundColor: '#ff9800', 
                      color: 'white', 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      fontSize: '10px' 
                    }}>Fundador</span>}
                    
                    {/* Mostrar relaciones sin duplicados */}
                    {(() => {
                      const personRels = (relationships || []).filter(rel => rel.person1_id === person.id || rel.person2_id === person.id);
                      const hasParentRel = personRels.some(rel => rel.relationship_type === 'parent' && rel.person1_id === person.id);
                      const hasChildRel = personRels.some(rel => rel.relationship_type === 'parent' && rel.person2_id === person.id);
                      const hasSpouseRel = personRels.some(rel => rel.relationship_type === 'spouse');
                      
                      const badges = [];
                      
                      if (hasParentRel) {
                        badges.push(
                          <span key="parent" style={{ 
                            backgroundColor: '#4caf50', 
                            color: 'white', 
                            padding: '1px 6px', 
                            borderRadius: '8px', 
                            fontSize: '9px' 
                          }}>Padre/Madre</span>
                        );
                      }
                      
                      if (hasChildRel) {
                        badges.push(
                          <span key="child" style={{ 
                            backgroundColor: '#2196f3', 
                            color: 'white', 
                            padding: '1px 6px', 
                            borderRadius: '8px', 
                            fontSize: '9px' 
                          }}>Hijo/Hija</span>
                        );
                      }
                      
                      if (hasSpouseRel) {
                        badges.push(
                          <span key="spouse" style={{ 
                            backgroundColor: '#e91e63', 
                            color: 'white', 
                            padding: '1px 6px', 
                            borderRadius: '8px', 
                            fontSize: '9px' 
                          }}>Cónyuge</span>
                        );
                      }
                      
                      return badges;
                    })()}
                  </div>
                  <p style={{ margin: '8px 0 4px 0', fontSize: '14px', color: '#666' }}>
                    {person.birth_date ? new Date(person.birth_date).getFullYear() : 'Nacimiento desconocido'} - {person.death_date ? new Date(person.death_date).getFullYear() : 'Presente'}
                  </p>
                  {person.birth_place && <p style={{ margin: '4px 0', fontSize: '12px', color: '#888' }}>📍 {person.birth_place}</p>}
                  
                  <div style={{ marginTop: '12px', display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => window.addChild && window.addChild(person)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '10px',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      + Hijo
                    </button>
                    <button
                      onClick={() => window.addSpouse && window.addSpouse(person)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '10px',
                        backgroundColor: '#e91e63',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      + Cónyuge
                    </button>
                    <button
                      onClick={() => window.deletePerson && window.deletePerson(person)}
                      style={{
                        padding: '4px 8px',
                        fontSize: '10px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer'
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTimeline = () => {
    const sortedPeople = [...people].sort((a, b) => {
      const dateA = a.birth_date ? new Date(a.birth_date) : new Date('1900-01-01');
      const dateB = b.birth_date ? new Date(b.birth_date) : new Date('1900-01-01');
      return dateA - dateB;
    });

    return (
      <div style={{ padding: '20px' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '30px', color: '#1976d2' }}>📅 Línea de Tiempo Familiar</h3>
        <div style={{ position: 'relative', paddingLeft: '60px', maxWidth: '800px', margin: '0 auto' }}>
          {/* Línea principal */}
          <div style={{
            position: 'absolute',
            left: '30px',
            top: '0',
            bottom: '0',
            width: '4px',
            background: 'linear-gradient(to bottom, #1976d2, #4caf50)',
            borderRadius: '2px'
          }}></div>
          
          {sortedPeople.map((person, index) => {
            const birthYear = person.birth_date ? new Date(person.birth_date).getFullYear() : '?';
            const deathYear = person.death_date ? new Date(person.death_date).getFullYear() : null;
            
            return (
              <div key={person.id} style={{ 
                position: 'relative', 
                marginBottom: '30px',
                paddingLeft: '50px'
              }}>
                {/* Punto en la línea */}
                <div style={{
                  position: 'absolute',
                  left: '-50px',
                  top: '15px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  backgroundColor: person.gender === 'male' ? '#2196f3' : '#e91e63',
                  border: '4px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>
                  {(person.first_name || '?').charAt(0)}
                </div>
                
                {/* Tarjeta de persona */}
                <div style={{
                  border: '2px solid #1976d2',
                  borderRadius: '12px',
                  padding: '16px',
                  backgroundColor: 'white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  position: 'relative'
                }}>
                  {/* Año prominente */}
                  <div style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '15px',
                    backgroundColor: '#1976d2',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '15px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {birthYear}{deathYear ? ` - ${deathYear}` : ''}
                  </div>
                  
                  <h4 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>
                    {person.first_name || ''} {person.last_name || ''}
                  </h4>
                  
                  {/* Badges de relaciones */}
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    {(relationships || []).filter(rel => rel.person1_id === person.id || rel.person2_id === person.id).map((rel, idx) => {
                      const isParent = rel.relationship_type === 'parent' && rel.person1_id === person.id;
                      const isChild = rel.relationship_type === 'parent' && rel.person2_id === person.id;
                      const isSpouse = rel.relationship_type === 'spouse';
                      
                      if (isParent) {
                        return <span key={idx} style={{ 
                          backgroundColor: '#4caf50', color: 'white', padding: '2px 6px', 
                          borderRadius: '8px', fontSize: '9px' 
                        }}>Padre/Madre</span>;
                      }
                      if (isChild) {
                        return <span key={idx} style={{ 
                          backgroundColor: '#2196f3', color: 'white', padding: '2px 6px', 
                          borderRadius: '8px', fontSize: '9px' 
                        }}>Hijo/Hija</span>;
                      }
                      if (isSpouse) {
                        return <span key={idx} style={{ 
                          backgroundColor: '#e91e63', color: 'white', padding: '2px 6px', 
                          borderRadius: '8px', fontSize: '9px' 
                        }}>Cónyuge</span>;
                      }
                      return null;
                    })}
                  </div>
                  
                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                    📅 {person.birth_date ? new Date(person.birth_date).toLocaleDateString() : 'Fecha desconocida'}
                  </p>
                  {person.birth_place && <p style={{ margin: '4px 0', fontSize: '12px', color: '#888' }}>📍 {person.birth_place}</p>}
                  {person.biography && <p style={{ margin: '8px 0 0 0', fontSize: '13px', fontStyle: 'italic' }}>{person.biography}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCircular = () => {
    const centerX = 300;
    const centerY = 300;
    const radius = 180;

    return (
      <div style={{ padding: '20px' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#1976d2' }}>⭕ Vista Circular Familiar</h3>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <svg width="600" height="600" style={{ border: '2px solid #1976d2', borderRadius: '12px', backgroundColor: '#f8f9fa' }}>
            {/* Círculo central decorativo */}
            <circle cx={centerX} cy={centerY} r="20" fill="#1976d2" stroke="white" strokeWidth="4" />
            <text x={centerX} y={centerY + 6} textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">🏠</text>
            
            {/* Personas en círculo simple */}
            {people.map((person, index) => {
              const angle = (index / people.length) * 2 * Math.PI - Math.PI/2;
              const x = centerX + radius * Math.cos(angle);
              const y = centerY + radius * Math.sin(angle);
              
              return (
                <g key={person.id}>
                  {/* Línea desde el centro */}
                  <line 
                    x1={centerX} 
                    y1={centerY} 
                    x2={x} 
                    y2={y} 
                    stroke="#ddd" 
                    strokeWidth="2" 
                    opacity="0.5"
                  />
                  
                  {/* Círculo de persona */}
                  <circle 
                    cx={x} 
                    cy={y} 
                    r="40" 
                    fill={person.gender === 'male' ? '#2196f3' : '#e91e63'} 
                    stroke="white" 
                    strokeWidth="4"
                  />
                  
                  {/* Iniciales */}
                  <text 
                    x={x} 
                    y={y + 5} 
                    textAnchor="middle" 
                    fill="white" 
                    fontSize="18" 
                    fontWeight="bold"
                  >
                    {(person.first_name || '?').charAt(0)}
                  </text>
                  
                  {/* Nombre */}
                  <text 
                    x={x} 
                    y={y + 65} 
                    textAnchor="middle" 
                    fontSize="14" 
                    fontWeight="bold"
                    fill="#333"
                  >
                    {person.first_name || 'Sin nombre'}
                  </text>
                  
                  {/* Badges de relaciones */}
                  <g>
                    {(relationships || []).filter(rel => rel.person1_id === person.id || rel.person2_id === person.id).map((rel, idx) => {
                      const isParent = rel.relationship_type === 'parent' && rel.person1_id === person.id;
                      const isChild = rel.relationship_type === 'parent' && rel.person2_id === person.id;
                      const isSpouse = rel.relationship_type === 'spouse';
                      
                      let badgeColor = '#666';
                      let badgeText = '';
                      
                      if (isParent) {
                        badgeColor = '#4caf50';
                        badgeText = 'P';
                      } else if (isChild) {
                        badgeColor = '#2196f3';
                        badgeText = 'H';
                      } else if (isSpouse) {
                        badgeColor = '#e91e63';
                        badgeText = 'C';
                      }
                      
                      if (badgeText) {
                        return (
                          <g key={idx}>
                            <circle 
                              cx={x + (idx * 20) - 10} 
                              cy={y - 50} 
                              r="10" 
                              fill={badgeColor} 
                              stroke="white" 
                              strokeWidth="2"
                            />
                            <text 
                              x={x + (idx * 20) - 10} 
                              y={y - 45} 
                              textAnchor="middle" 
                              fontSize="10" 
                              fontWeight="bold" 
                              fill="white"
                            >
                              {badgeText}
                            </text>
                          </g>
                        );
                      }
                      return null;
                    })}
                  </g>
                </g>
              );
            })}
            
            {/* Líneas de matrimonio */}
            {(relationships || []).filter(rel => rel.relationship_type === 'spouse').map((rel, index) => {
              const person1 = people.find(p => p.id === rel.person1_id);
              const person2 = people.find(p => p.id === rel.person2_id);
              
              if (person1 && person2) {
                const person1Index = people.indexOf(person1);
                const person2Index = people.indexOf(person2);
                
                const angle1 = (person1Index / people.length) * 2 * Math.PI - Math.PI/2;
                const angle2 = (person2Index / people.length) * 2 * Math.PI - Math.PI/2;
                
                const x1 = centerX + radius * Math.cos(angle1);
                const y1 = centerY + radius * Math.sin(angle1);
                const x2 = centerX + radius * Math.cos(angle2);
                const y2 = centerY + radius * Math.sin(angle2);
                
                return (
                  <line 
                    key={index}
                    x1={x1} 
                    y1={y1} 
                    x2={x2} 
                    y2={y2} 
                    stroke="#e91e63" 
                    strokeWidth="4" 
                    strokeDasharray="10,5" 
                    opacity="0.8"
                  />
                );
              }
              return null;
            })}
          </svg>
        </div>
        
        {/* Leyenda simplificada */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#666' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <span>🔵 Hombre</span>
            <span>🔴 Mujer</span>
            <span style={{ color: '#4caf50' }}>P = Padre/Madre</span>
            <span style={{ color: '#2196f3' }}>H = Hijo/Hija</span>
            <span style={{ color: '#e91e63' }}>C = Cónyuge</span>
          </div>
        </div>
      </div>
    );
  };

  const renderFan = () => {
    const centerX = 400;
    const centerY = 450;
    const baseRadius = 120;

    return (
      <div style={{ padding: '20px' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#1976d2' }}>🌟 Vista Abanico Generacional</h3>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <svg width="800" height="500" style={{ border: '2px solid #1976d2', borderRadius: '12px', backgroundColor: '#f8f9fa' }}>
            {/* Organizar por generaciones en abanico */}
            {(() => {
              const generations = {};
              const safeRelationships = relationships || [];
              
              // Encontrar fundadores (primera generación)
              const founders = people.filter(person => {
                const hasParents = safeRelationships.some(rel => 
                  rel.relationship_type === 'parent' && rel.person2_id === person.id
                );
                return !hasParents;
              });
              
              if (founders.length === 0) {
                generations[0] = people;
              } else {
                generations[0] = founders;
                
                // Agregar hijos en generaciones siguientes
                let currentGen = 0;
                const visited = new Set();
                while (generations[currentGen] && generations[currentGen].length > 0) {
                  const children = [];
                  generations[currentGen].forEach(parent => {
                    const parentChildren = safeRelationships
                      .filter(rel => rel.relationship_type === 'parent' && rel.person1_id === parent.id)
                      .map(rel => people.find(p => p.id === rel.person2_id))
                      .filter(child => child && !visited.has(child.id));
                    
                    parentChildren.forEach(child => {
                      visited.add(child.id);
                      children.push(child);
                    });
                  });
                  
                  if (children.length > 0) {
                    generations[currentGen + 1] = children;
                  }
                  currentGen++;
                }
              }
              
              return Object.keys(generations).map(genKey => {
                const generation = generations[genKey];
                const genLevel = parseInt(genKey);
                const radius = baseRadius + (genLevel * 80);
                
                // Ángulo total del abanico (180 grados = Math.PI radianes)
                const totalAngle = Math.PI;
                const startAngle = -Math.PI / 2 - totalAngle / 2; // Empezar desde arriba-izquierda
                
                return generation.map((person, index) => {
                  // Distribuir personas uniformemente en el arco
                  const angle = startAngle + (index / Math.max(generation.length - 1, 1)) * totalAngle;
                  const x = centerX + radius * Math.cos(angle);
                  const y = centerY + radius * Math.sin(angle);
                  
                  return (
                    <g key={person.id}>
                      {/* Línea desde el centro */}
                      <line 
                        x1={centerX} 
                        y1={centerY} 
                        x2={x} 
                        y2={y} 
                        stroke={genLevel === 0 ? '#1976d2' : '#4caf50'} 
                        strokeWidth="3" 
                        opacity="0.6"
                        strokeDasharray={genLevel > 0 ? '8,4' : 'none'}
                      />
                      
                      {/* Círculo de persona */}
                      <circle 
                        cx={x} 
                        cy={y} 
                        r="35" 
                        fill={person.gender === 'male' ? '#2196f3' : '#e91e63'} 
                        stroke="white" 
                        strokeWidth="4"
                      />
                      
                      {/* Iniciales */}
                      <text 
                        x={x} 
                        y={y + 5} 
                        textAnchor="middle" 
                        fill="white" 
                        fontSize="16" 
                        fontWeight="bold"
                      >
                        {(person.first_name || '?').charAt(0)}
                      </text>
                      
                      {/* Nombre */}
                      <text 
                        x={x} 
                        y={y + 55} 
                        textAnchor="middle" 
                        fontSize="12" 
                        fontWeight="bold"
                        fill="#333"
                      >
                        {person.first_name || 'Sin nombre'}
                      </text>
                      
                      {/* Badge de generación */}
                      <rect 
                        x={x - 15} 
                        y={y - 50} 
                        width="30" 
                        height="16" 
                        fill={genLevel === 0 ? '#ff9800' : '#4caf50'} 
                        stroke="white" 
                        strokeWidth="2" 
                        rx="8"
                      />
                      <text 
                        x={x} 
                        y={y - 38} 
                        textAnchor="middle" 
                        fontSize="10" 
                        fontWeight="bold" 
                        fill="white"
                      >
                        GEN {genLevel + 1}
                      </text>
                    </g>
                  );
                });
              });
            })()}
            
            {/* Punto central */}
            <circle cx={centerX} cy={centerY} r="20" fill="#1976d2" stroke="white" strokeWidth="4" />
            <text x={centerX} y={centerY + 6} textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">🏠</text>
            
            {/* Líneas de matrimonio */}
            {(relationships || []).filter(rel => rel.relationship_type === 'spouse').map((rel, index) => {
              const person1 = people.find(p => p.id === rel.person1_id);
              const person2 = people.find(p => p.id === rel.person2_id);
              
              if (person1 && person2) {
                // Encontrar posiciones de ambas personas en el abanico
                // (Cálculo simplificado - usar posiciones aproximadas)
                return (
                  <path 
                    key={index}
                    d={`M ${centerX - 60} ${centerY - 80} Q ${centerX} ${centerY - 120} ${centerX + 60} ${centerY - 80}`}
                    stroke="#e91e63" 
                    strokeWidth="4" 
                    strokeDasharray="10,5" 
                    fill="none"
                    opacity="0.8"
                  />
                );
              }
              return null;
            })}
          </svg>
        </div>
        
        {/* Leyenda */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '12px', color: '#666' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <span>🏠 Centro familiar</span>
            <span style={{ color: '#ff9800' }}>GEN 1 = Fundadores</span>
            <span style={{ color: '#4caf50' }}>GEN 2+ = Descendientes</span>
            <span style={{ color: '#e91e63' }}>Línea curva = Matrimonio</span>
          </div>
        </div>
      </div>
    );
  };

  const renderView = () => {
    switch (viewType) {
      case 'timeline': return renderTimeline();
      case 'circular': return renderCircular();
      case 'fan': return renderFan();
      default: return renderTraditionalTree();
    }
  };

  return (
    <div 
      ref={containerRef}
      style={{
        width: '100%',
        height: '600px',
        overflow: 'hidden',
        border: '1px solid #ddd',
        borderRadius: '8px',
        position: 'relative',
        cursor: isDragging ? 'grabbing' : 'grab'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div style={{
        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        transformOrigin: '0 0',
        width: '100%',
        height: '100%'
      }}>
        {renderView()}
      </div>
      
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={() => setZoom(Math.min(3, zoom + 0.2))}
          style={{ padding: '8px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
        >
          +
        </button>
        <button
          onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
          style={{ padding: '8px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
        >
          -
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          style={{ padding: '8px', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer' }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default TreeVisualization;