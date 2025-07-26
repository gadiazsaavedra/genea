import React, { useState, useRef, useEffect } from 'react';

const TreeVisualization = ({ people, viewType }) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

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
    if (people.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <p>No hay personas en el árbol</p>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '40px', padding: '40px' }}>
        {people.map((person, index) => (
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
            {person.isFounder && <span style={{ 
              backgroundColor: '#ff9800', 
              color: 'white', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              fontSize: '12px' 
            }}>Fundador</span>}
            <p style={{ margin: '8px 0 4px 0', fontSize: '14px', color: '#666' }}>
              {person.birthDate ? new Date(person.birthDate).getFullYear() : '?'} - {person.isAlive ? 'Presente' : (person.deathDate ? new Date(person.deathDate).getFullYear() : '?')}
            </p>
            {person.birthPlace && <p style={{ margin: '4px 0', fontSize: '12px', color: '#888' }}>📍 {person.birthPlace}</p>}
          </div>
        ))}
      </div>
    );
  };

  const renderTimeline = () => {
    const sortedPeople = [...people].sort((a, b) => {
      const dateA = a.birthDate ? new Date(a.birthDate) : new Date('1900-01-01');
      const dateB = b.birthDate ? new Date(b.birthDate) : new Date('1900-01-01');
      return dateA - dateB;
    });

    return (
      <div style={{ padding: '40px' }}>
        <div style={{ position: 'relative', paddingLeft: '40px' }}>
          <div style={{
            position: 'absolute',
            left: '20px',
            top: '0',
            bottom: '0',
            width: '2px',
            backgroundColor: '#1976d2'
          }}></div>
          {sortedPeople.map((person, index) => (
            <div key={person.id} style={{ 
              position: 'relative', 
              marginBottom: '40px',
              paddingLeft: '40px'
            }}>
              <div style={{
                position: 'absolute',
                left: '-40px',
                top: '20px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#1976d2'
              }}></div>
              <div style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '16px',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <h4 style={{ margin: '0 0 8px 0' }}>
                  {person.fullName || `${person.first_name || ''} ${person.last_name || ''}`.trim() || 'Sin nombre'}
                </h4>
                <p style={{ margin: '4px 0', color: '#666' }}>
                  Nacimiento: {person.birthDate ? new Date(person.birthDate).toLocaleDateString() : 'Desconocido'}
                </p>
                {person.birthPlace && <p style={{ margin: '4px 0', color: '#666' }}>📍 {person.birthPlace}</p>}
                {person.biography && <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>{person.biography}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCircular = () => {
    const centerX = 300;
    const centerY = 300;
    const radius = 200;

    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <svg width="600" height="600" style={{ border: '1px solid #ddd', borderRadius: '8px' }}>
          <circle cx={centerX} cy={centerY} r="5" fill="#1976d2" />
          {people.map((person, index) => {
            const angle = (index / people.length) * 2 * Math.PI;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            return (
              <g key={person.id}>
                <line x1={centerX} y1={centerY} x2={x} y2={y} stroke="#ddd" strokeWidth="1" />
                <circle cx={x} cy={y} r="30" fill={person.gender === 'male' ? '#2196f3' : '#e91e63'} />
                <text x={x} y={y} textAnchor="middle" dy="5" fill="white" fontSize="12">
                  {(person.fullName || `${person.first_name || ''} ${person.last_name || ''}`.trim() || '?').split(' ').map(n => n.charAt(0)).join('')}
                </text>
                <text x={x} y={y + 50} textAnchor="middle" fontSize="12" fill="#333">
                  {person.fullName || `${person.first_name || ''} ${person.last_name || ''}`.trim() || 'Sin nombre'}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  const renderFan = () => {
    const centerX = 300;
    const centerY = 500;
    const maxRadius = 400;

    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <svg width="600" height="500" style={{ border: '1px solid #ddd', borderRadius: '8px' }}>
          {people.map((person, index) => {
            const angle = (index / Math.max(people.length - 1, 1)) * Math.PI - Math.PI/2;
            const radius = 100 + (index * 50);
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
            return (
              <g key={person.id}>
                <line x1={centerX} y1={centerY} x2={x} y2={y} stroke="#ddd" strokeWidth="1" />
                <circle cx={x} cy={y} r="25" fill={person.gender === 'male' ? '#2196f3' : '#e91e63'} />
                <text x={x} y={y} textAnchor="middle" dy="5" fill="white" fontSize="10">
                  {(person.fullName || `${person.first_name || ''} ${person.last_name || ''}`.trim() || '?').split(' ').map(n => n.charAt(0)).join('')}
                </text>
                <text x={x} y={y + 40} textAnchor="middle" fontSize="10" fill="#333">
                  {person.fullName || `${person.first_name || ''} ${person.last_name || ''}`.trim() || 'Sin nombre'}
                </text>
              </g>
            );
          })}
        </svg>
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