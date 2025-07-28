import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase.config';

const DragDropTreeBuilder = ({ familyId }) => {
  const [people, setPeople] = useState([]);
  const [draggedPerson, setDraggedPerson] = useState(null);
  const [positions, setPositions] = useState({});
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    loadPeople();
    loadPositions();
  }, [familyId]);

  const loadPeople = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/persons?familyId=${familyId}`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (response.ok) {
        const result = await response.json();
        console.log('Loaded people for drag drop:', result.data);
        setPeople(result.data || []);
        
        // Establecer posiciones iniciales si no existen
        if (result.data && result.data.length > 0) {
          const initialPositions = {};
          result.data.forEach((person, index) => {
            if (!positions[person.id]) {
              initialPositions[person.id] = {
                x: 50 + (index % 4) * 200,
                y: 100 + Math.floor(index / 4) * 150
              };
            }
          });
          if (Object.keys(initialPositions).length > 0) {
            setPositions(prev => ({ ...prev, ...initialPositions }));
          }
        }
      } else {
        console.error('Error response:', response.status);
      }
    } catch (error) {
      console.error('Error loading people:', error);
    }
  };

  const loadPositions = async () => {
    // Cargar posiciones guardadas desde localStorage o API
    const saved = localStorage.getItem(`tree-positions-${familyId}`);
    if (saved) {
      setPositions(JSON.parse(saved));
    }
  };

  const handleDragStart = (e, person) => {
    setDraggedPerson(person);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (!draggedPerson) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - 75; // Centrar tarjeta
    const y = e.clientY - rect.top - 60;

    const newPositions = {
      ...positions,
      [draggedPerson.id]: { x, y }
    };

    setPositions(newPositions);
    localStorage.setItem(`tree-positions-${familyId}`, JSON.stringify(newPositions));
    setDraggedPerson(null);
  };

  const saveTreeLayout = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const layoutData = {
        familyId,
        positions,
        connections,
        createdAt: new Date().toISOString()
      };

      const response = await fetch(`${process.env.REACT_APP_API_URL}/tree-layouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify(layoutData)
      });

      if (response.ok) {
        alert('¡Árbol guardado exitosamente! 🎉');
      } else {
        alert('Error al guardar el árbol');
      }
    } catch (error) {
      console.error('Error saving tree:', error);
      alert('Error al guardar el árbol');
    }
  };

  const PersonCard = ({ person }) => {
    const position = positions[person.id] || { x: 0, y: 0 };
    
    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, person)}
        style={{
          position: 'absolute',
          left: `${position.x}px`,
          top: `${position.y}px`,
          cursor: 'move',
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
          transition: 'transform 0.2s',
          userSelect: 'none'
        }}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
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
            {person.birth_date ? new Date(person.birth_date).getFullYear() : '?'} - Presente
          </p>
        </div>
      </div>
    );
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Área de construcción */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          width: '100%',
          height: '600px',
          border: '2px dashed #ddd',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
          position: 'relative',
          backgroundImage: 'radial-gradient(circle, #ddd 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      >
        {/* Instrucciones */}
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          backgroundColor: 'white',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          maxWidth: '300px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>🎯 Constructor de Árbol</h3>
          <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
            Arrastra las tarjetas para posicionar tu árbol genealógico. 
            Una vez terminado, haz clic en "Guardar Árbol".
          </p>
        </div>

        {/* Botones de acción */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          gap: '10px'
        }}>
          <button
            onClick={() => setPositions({})}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Resetear
          </button>
          <button
            onClick={saveTreeLayout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4caf50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            💾 Guardar Árbol
          </button>
        </div>

        {/* Debug info */}
        {people.length === 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#666'
          }}>
            <h3>🔄 Cargando personas...</h3>
            <p>Si no aparecen tarjetas, verifica que hay personas en la familia.</p>
          </div>
        )}

        {/* Renderizar personas */}
        {people.map(person => (
          <PersonCard key={person.id} person={person} />
        ))}

        {/* Estadísticas y debug */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          backgroundColor: 'white',
          padding: '10px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '12px', color: '#666' }}>
            👥 {people.length} personas | 📍 {Object.keys(positions).length} posicionadas
          </div>
          <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>
            Family ID: {familyId}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DragDropTreeBuilder;