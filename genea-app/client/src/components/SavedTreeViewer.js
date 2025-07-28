import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase.config';

const SavedTreeViewer = ({ familyId }) => {
  const [people, setPeople] = useState([]);
  const [positions, setPositions] = useState({});
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(true);

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
        // Línea verde para padre-hijo
        connections.push(
          <line
            key={`parent-${rel.id}`}
            x1={centerX1}
            y1={centerY1}
            x2={centerX2}
            y2={centerY2}
            stroke="#4caf50"
            strokeWidth="4"
            opacity="0.8"
            markerEnd="url(#arrowhead)"
          />
        );
      }
    });

    return connections;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h3>🔄 Cargando árbol guardado...</h3>
      </div>
    );
  }

  return (
    <div style={{ 
      width: '100%', 
      height: '600px', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      backgroundColor: '#f8f9fa',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* SVG para líneas de conexión */}
      <svg style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
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
            <div style={{
              border: '2px solid #1976d2',
              borderRadius: '12px',
              padding: '16px',
              backgroundColor: 'white',
              width: '150px',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              transition: 'transform 0.2s'
            }}>
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
                {person.birth_date ? new Date(person.birth_date).getFullYear() : '?'} - Presente
              </p>
            </div>
          </div>
        );
      })}

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
          <span>Padre/Madre → Hijo/Hija</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '20px', height: '3px', backgroundColor: '#e91e63', marginRight: '8px', borderTop: '3px dashed #e91e63', backgroundColor: 'transparent' }}></div>
          <span>♥ Matrimonio</span>
        </div>
      </div>

      {/* Estadísticas */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        fontSize: '12px',
        zIndex: 20
      }}>
        <div style={{ fontWeight: 'bold', color: '#1976d2' }}>🌳 Árbol Genealógico Guardado</div>
        <div style={{ marginTop: '4px', color: '#666' }}>
          👥 {people.length} personas | 🔗 {relationships.length} relaciones
        </div>
      </div>
    </div>
  );
};

export default SavedTreeViewer;