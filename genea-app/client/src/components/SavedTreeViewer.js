import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase.config';
import { getParentAgeInfo } from '../utils/ageCalculator';
import PersonTimeline from './PersonTimeline';

const SavedTreeViewer = ({ familyId }) => {
  const [people, setPeople] = useState([]);
  const [positions, setPositions] = useState({});
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPersonId, setSelectedPersonId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  useEffect(() => {
    loadSavedTree();
  }, [familyId]);

  const loadSavedTree = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Cargar personas
      const peopleResponse = await fetch(`${process.env.REACT_APP_API_URL}/persons?familyId=${familyId}`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (peopleResponse.ok) {
        const peopleResult = await peopleResponse.json();
        setPeople(peopleResult.data || []);
      }

      // Cargar layout guardado
      const layoutResponse = await fetch(`${process.env.REACT_APP_API_URL}/tree-layouts/family/${familyId}`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (layoutResponse.ok) {
        const layoutResult = await layoutResponse.json();
        if (layoutResult.data) {
          setPositions(layoutResult.data.positions || {});
        }
      }

      // Cargar relaciones
      const relResponse = await fetch(`${process.env.REACT_APP_API_URL}/relationships/family/${familyId}`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (relResponse.ok) {
        const relResult = await relResponse.json();
        setRelationships(relResult.data || []);
      }

    } catch (error) {
      console.error('Error loading saved tree:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateConnections = () => {
    const connections = [];
    
    relationships.forEach(rel => {
      const person1 = people.find(p => p.id === rel.person1_id);
      const person2 = people.find(p => p.id === rel.person2_id);
      
      if (!person1 || !person2) return;
      
      const pos1 = positions[person1.id];
      const pos2 = positions[person2.id];
      
      if (!pos1 || !pos2) return;

      const centerX1 = pos1.x + 75; // Centro de tarjeta
      const centerY1 = pos1.y + 60;
      const centerX2 = pos2.x + 75;
      const centerY2 = pos2.y + 60;

      if (rel.relationship_type === 'spouse') {
        // Línea rosa punteada para matrimonios
        connections.push(
          <g key={`spouse-${rel.id}`}>
            <line
              x1={centerX1}
              y1={centerY1}
              x2={centerX2}
              y2={centerY2}
              stroke="#e91e63"
              strokeWidth="3"
              strokeDasharray="8,4"
              opacity="0.8"
            />
            <circle
              cx={(centerX1 + centerX2) / 2}
              cy={(centerY1 + centerY2) / 2}
              r="12"
              fill="white"
              stroke="#e91e63"
              strokeWidth="2"
            />
            <text
              x={(centerX1 + centerX2) / 2}
              y={(centerY1 + centerY2) / 2 + 4}
              textAnchor="middle"
              fontSize="16"
              fill="#e91e63"
            >
              ♥
            </text>
          </g>
        );
      } else if (rel.relationship_type === 'parent') {
        // Calcular edad del padre al nacer el hijo
        const parentAge = person1.birth_date && person2.birth_date ? 
          Math.floor((new Date(person2.birth_date) - new Date(person1.birth_date)) / (365.25 * 24 * 60 * 60 * 1000)) : null;
        
        // Línea verde para padre-hijo con edad
        connections.push(
          <g key={`parent-${rel.id}`}>
            <line
              x1={centerX1}
              y1={centerY1}
              x2={centerX2}
              y2={centerY2}
              stroke="#4caf50"
              strokeWidth="4"
              opacity="0.8"
              markerEnd="url(#arrowhead)"
            />
            {parentAge && parentAge > 0 && (
              <g>
                <rect
                  x={(centerX1 + centerX2) / 2 - 20}
                  y={(centerY1 + centerY2) / 2 - 10}
                  width="40"
                  height="20"
                  fill="white"
                  stroke="#4caf50"
                  strokeWidth="1"
                  rx="3"
                />
                <text
                  x={(centerX1 + centerX2) / 2}
                  y={(centerY1 + centerY2) / 2 + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill="#4caf50"
                >
                  {parentAge}a
                </text>
              </g>
            )}
          </g>
        );
      }
    });

    return connections;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.3, Math.min(3, prev * delta)));
  };

  const handleMouseDown = (e) => {
    if (e.button === 0) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const resetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h3>🔄 Cargando árbol guardado...</h3>
      </div>
    );
  }

  return (
    <div 
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ 
        width: '100%', 
        height: '600px', 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        backgroundColor: '#f8f9fa',
        position: 'relative',
        overflow: 'hidden',
        cursor: isPanning ? 'grabbing' : 'grab'
      }}>
      
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          width: '2000px',
          height: '2000px',
          position: 'relative'
        }}
      >
      {/* SVG para líneas de conexión */}
      <svg style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '2000px', 
        height: '2000px', 
        pointerEvents: 'none',
        zIndex: 1 
      }}>
        {/* Definir marcador de flecha */}
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon
              points="0 0, 10 3.5, 0 7"
              fill="#4caf50"
            />
          </marker>
        </defs>
        
        {generateConnections()}
      </svg>

      {/* Renderizar personas en posiciones guardadas */}
      {people.map(person => {
        const position = positions[person.id];
        if (!position) return null;
        
        return (
          <div
            key={person.id}
            style={{
              position: 'absolute',
              left: `${position.x}px`,
              top: `${position.y}px`,
              zIndex: 10
            }}
          >
            <div 
              onClick={() => setSelectedPersonId(person.id)}
              style={{
                border: '2px solid #1976d2',
                borderRadius: '12px',
                padding: '16px',
                backgroundColor: 'white',
                width: '150px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ 
                width: '50px', 
                height: '50px', 
                borderRadius: '50%', 
                backgroundColor: person.gender === 'male' ? '#2196f3' : '#e91e63',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px',
                margin: '0 auto 10px',
                fontWeight: 'bold'
              }}>
                {(person.first_name || '?').charAt(0)}
              </div>
              
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                {person.first_name} {person.last_name || ''}
              </h4>
              
              <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '8px' }}>
                {person.is_founder && (
                  <span style={{ 
                    backgroundColor: '#ff9800', 
                    color: 'white', 
                    padding: '2px 6px', 
                    borderRadius: '8px', 
                    fontSize: '10px' 
                  }}>Fundador</span>
                )}
                <span style={{ 
                  backgroundColor: person.gender === 'male' ? '#2196f3' : '#e91e63', 
                  color: 'white', 
                  padding: '2px 6px', 
                  borderRadius: '8px', 
                  fontSize: '10px' 
                }}>
                  {person.gender === 'male' ? '👨' : '👩'}
                </span>
              </div>
              
              <p style={{ margin: '4px 0', fontSize: '12px', color: '#666' }}>
                {person.birth_date ? new Date(person.birth_date).getFullYear() : '?'} - {person.death_date ? new Date(person.death_date).getFullYear() : 'Presente'}
              </p>
              
              <div style={{ 
                fontSize: '10px', 
                color: '#1976d2', 
                marginTop: '8px',
                fontStyle: 'italic'
              }}>
                📅 Clic para timeline
              </div>
            </div>
          </div>
        );
      })}
      </div>

      {/* Controles de zoom */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        gap: '5px',
        backgroundColor: 'white',
        padding: '8px',
        borderRadius: '6px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 100
      }}>
        <button
          onClick={() => setZoom(prev => Math.min(3, prev * 1.2))}
          style={{
            padding: '6px 10px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔍+
        </button>
        <span style={{ 
          fontSize: '13px', 
          padding: '6px 8px', 
          minWidth: '50px', 
          textAlign: 'center',
          color: '#666',
          fontWeight: 'bold'
        }}>
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(prev => Math.max(0.3, prev * 0.8))}
          style={{
            padding: '6px 10px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔍-
        </button>
        <button
          onClick={resetView}
          style={{
            padding: '6px 10px',
            backgroundColor: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🎯
        </button>
      </div>

      {/* Timeline Modal */}
      {selectedPersonId && (
        <PersonTimeline 
          personId={selectedPersonId}
          onClose={() => setSelectedPersonId(null)}
        />
      )}

      {/* Leyenda */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'white',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        fontSize: '12px',
        zIndex: 20
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Leyenda:</div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
          <div style={{ width: '20px', height: '3px', backgroundColor: '#4caf50', marginRight: '8px' }}></div>
          <span>Padre/Madre → Hijo/Hija (edad)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '20px', height: '3px', backgroundColor: '#e91e63', marginRight: '8px', borderTop: '3px dashed #e91e63', backgroundColor: 'transparent' }}></div>
          <span>♥ Matrimonio</span>
        </div>
      </div>

      {/* Estadísticas con edades de padres */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        backgroundColor: 'white',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        fontSize: '12px',
        zIndex: 20,
        maxWidth: '280px'
      }}>
        <div style={{ fontWeight: 'bold', color: '#1976d2', marginBottom: '8px' }}>
          🌳 Árbol Genealógico Guardado
        </div>
        <div style={{ color: '#666', marginBottom: '8px' }}>
          👥 {people.length} personas | 🔗 {relationships.length} relaciones
        </div>
        
        {(() => {
          const parentAges = getParentAgeInfo(people, relationships);
          if (parentAges.length > 0) {
            const avgAge = Math.round(parentAges.reduce((sum, info) => sum + info.ageAtBirth, 0) / parentAges.length);
            const youngestParent = parentAges[0];
            const oldestParent = parentAges[parentAges.length - 1];
            
            return (
              <div style={{ borderTop: '1px solid #eee', paddingTop: '8px' }}>
                <div style={{ fontWeight: 'bold', color: '#4caf50', marginBottom: '4px' }}>
                  👶 Edades al tener hijos:
                </div>
                <div style={{ fontSize: '11px', color: '#666' }}>
                  • Promedio: {avgAge} años<br/>
                  • Más joven: {youngestParent.parentName} ({youngestParent.ageAtBirth}a)<br/>
                  • Mayor: {oldestParent.parentName} ({oldestParent.ageAtBirth}a)
                </div>
              </div>
            );
          }
          return null;
        })()}
      </div>
    </div>
  );
};

export default SavedTreeViewer;