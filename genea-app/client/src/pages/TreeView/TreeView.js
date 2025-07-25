import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const TreeView = () => {
  const { familyId } = useParams();
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedFamilies = JSON.parse(localStorage.getItem('families') || '[]');
    const currentFamily = savedFamilies.find(f => f._id === familyId);
    
    setTimeout(() => {
      setFamily(currentFamily || {
        id: familyId,
        name: 'Mi Familia',
        description: 'Tu árbol genealógico'
      });
      setLoading(false);
    }, 500);
  }, [familyId]);

  if (loading) {
    return <div style={{ padding: '20px' }}>Cargando árbol...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Árbol Genealógico - {family?.name}</h1>
      <p>{family?.description}</p>
      
      <div style={{ 
        border: '2px dashed #ddd', 
        borderRadius: '8px', 
        padding: '60px 20px', 
        textAlign: 'center',
        margin: '40px 0'
      }}>
        <h3>Árbol genealógico en construcción</h3>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Agrega personas a tu familia para ver el árbol genealógico interactivo.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button style={{ 
            padding: '10px 20px', 
            backgroundColor: '#1976d2', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            + Agregar Fundadores
          </button>
          <button style={{ 
            padding: '10px 20px', 
            backgroundColor: '#4caf50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            + Agregar Persona
          </button>
        </div>
      </div>

      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h4>Próximamente disponible:</h4>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>🌳 Vista tradicional del árbol</li>
          <li>⏰ Timeline familiar</li>
          <li>⭕ Vista circular</li>
          <li>🌟 Vista en abanico</li>
          <li>🔍 Zoom y navegación interactiva</li>
        </ul>
      </div>

      <div style={{ marginTop: '40px' }}>
        <Link 
          to="/families" 
          style={{ 
            padding: '10px 20px', 
            border: '1px solid #1976d2', 
            color: '#1976d2', 
            textDecoration: 'none', 
            borderRadius: '4px',
            marginRight: '12px'
          }}
        >
          Volver a Familias
        </Link>
        <Link 
          to={`/family/${familyId}/members`}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#1976d2', 
            color: 'white', 
            textDecoration: 'none', 
            borderRadius: '4px'
          }}
        >
          Ver Miembros
        </Link>
      </div>
    </div>
  );
};

export default TreeView;