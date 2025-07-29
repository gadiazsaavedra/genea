import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase.config';

const DragDropTreeBuilder = ({ familyId }) => {
  const [people, setPeople] = useState([]);
  const [draggedPerson, setDraggedPerson] = useState(null);
  const [positions, setPositions] = useState({});
  const [connections, setConnections] = useState([]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

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
        
        // Establecer posiciones iniciales solo para personas sin posición
        if (result.data && result.data.length > 0) {
          setPositions(prevPositions => {
            const newPositions = { ...prevPositions };
            let hasNewPositions = false;
            
            result.data.forEach((person, index) => {
              if (!newPositions[person.id]) {
                newPositions[person.id] = {
                  x: 50 + (index % 4) * 200,
                  y: 100 + Math.floor(index / 4) * 150
                };
                hasNewPositions = true;
              }
            });
            
            return hasNewPositions ? newPositions : prevPositions;
          });
        }
      } else {
        console.error('Error response:', response.status);
      }
    } catch (error) {
      console.error('Error loading people:', error);
    }
  };

  const loadPositions = async () => {
    try {
      // Primero intentar cargar desde API (árbol guardado)
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/tree-layouts/family/${familyId}`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data.positions) {
          console.log('Loaded saved positions:', result.data.positions);
          setPositions(result.data.positions);
          return; // Usar posiciones guardadas
        }
      }
    } catch (error) {
      console.log('No saved positions found, using localStorage');
    }
    
    // Fallback a localStorage
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
    const rawX = (e.clientX - rect.left - pan.x) / zoom - 75;
    const rawY = (e.clientY - rect.top - pan.y) / zoom - 60;

    // Snap to grid (20px grid)
    const gridSize = 20;
    const x = Math.round(rawX / gridSize) * gridSize;
    const y = Math.round(rawY / gridSize) * gridSize;

    const newPositions = {
      ...positions,
      [draggedPerson.id]: { x, y }
    };

    setPositions(newPositions);
    localStorage.setItem(`tree-positions-${familyId}`, JSON.stringify(newPositions));
    setDraggedPerson(null);
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.3, Math.min(3, prev * delta)));
  };

  const handleMouseDown = (e) => {
    if (e.button === 0 && !draggedPerson) {
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

  const saveTreeLayout = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        alert('No hay sesión activa. Por favor, inicia sesión.');
        return;
      }
      
      const layoutData = {
        familyId,
        positions,
        connections
      };

      console.log('Saving layout data:', layoutData);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/tree-layouts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(layoutData)
      });

      const result = await response.json();
      console.log('Save response:', result);

      if (response.ok) {
        alert('¡Árbol guardado exitosamente! 🎉');
      } else {
        console.error('Save error:', result);
        alert(`Error al guardar: ${result.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error saving tree:', error);
      alert(`Error al guardar el árbol: ${error.message}`);
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
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: '100%',
          height: '600px',
          border: '2px dashed #ddd',
          borderRadius: '8px',
          backgroundColor: '#f8f9fa',
          position: 'relative',
          overflow: 'hidden',
          cursor: isPanning ? 'grabbing' : 'grab'
        }}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: '2000px',
            height: '2000px',
            backgroundImage: 'radial-gradient(circle, #ccc 1px, transparent 1px)',
            backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            position: 'relative'
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
            Las tarjetas se alinean automáticamente al grid para mayor precisión.
          </p>
        </div>

        {/* Renderizar personas */}
        {people.map(person => (
          <PersonCard key={person.id} person={person} />
        ))}
        </div>

        {/* Controles de zoom y pan */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 100
        }}>
          <div style={{
            display: 'flex',
            gap: '5px',
            backgroundColor: 'white',
            padding: '5px',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <button
              onClick={() => setZoom(prev => Math.min(3, prev * 1.2))}
              style={{
                padding: '4px 8px',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🔍+
            </button>
            <span style={{ fontSize: '12px', padding: '4px', minWidth: '40px', textAlign: 'center' }}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(prev => Math.max(0.3, prev * 0.8))}
              style={{
                padding: '4px 8px',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🔍-
            </button>
            <button
              onClick={resetView}
              style={{
                padding: '4px 8px',
                backgroundColor: '#ff9800',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              🎯
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '5px' }}>
            <button
              onClick={() => setPositions({})}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
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
                fontWeight: 'bold',
                fontSize: '12px'
              }}
            >
              💾 Guardar
            </button>
          </div>
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