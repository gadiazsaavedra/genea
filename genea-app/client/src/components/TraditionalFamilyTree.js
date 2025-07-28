import React from 'react';

const TraditionalFamilyTree = () => {
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
        {/* Línea de matrimonio Juan - Constantina */}
        <line x1="200" y1="120" x2="400" y2="120" stroke="#e91e63" strokeWidth="3" strokeDasharray="8,4" />
        <rect x="270" y="105" width="60" height="20" fill="white" stroke="#e91e63" strokeWidth="1" rx="3" />
        <text x="300" y="118" fill="#e91e63" fontSize="11" fontWeight="bold" textAnchor="middle">CÓNYUGES</text>
        
        {/* Línea de matrimonio Luis - Alicia */}
        <line x1="150" y1="320" x2="350" y2="320" stroke="#e91e63" strokeWidth="3" strokeDasharray="8,4" />
        <rect x="220" y="305" width="60" height="20" fill="white" stroke="#e91e63" strokeWidth="1" rx="3" />
        <text x="250" y="318" fill="#e91e63" fontSize="11" fontWeight="bold" textAnchor="middle">CÓNYUGES</text>
        
        {/* Líneas padre-hijo desde Juan y Constantina */}
        <line x1="200" y1="180" x2="200" y2="220" stroke="#4caf50" strokeWidth="4" />
        <line x1="400" y1="180" x2="400" y2="220" stroke="#4caf50" strokeWidth="4" />
        <line x1="200" y1="220" x2="400" y2="220" stroke="#4caf50" strokeWidth="4" />
        
        {/* Líneas hacia los hijos */}
        <line x1="150" y1="220" x2="150" y2="260" stroke="#4caf50" strokeWidth="4" />
        <line x1="250" y1="220" x2="250" y2="260" stroke="#4caf50" strokeWidth="4" />
        <line x1="350" y1="220" x2="350" y2="260" stroke="#4caf50" strokeWidth="4" />
        <line x1="450" y1="220" x2="450" y2="260" stroke="#4caf50" strokeWidth="4" />
        
        {/* Flechas hacia los hijos */}
        <polygon points="145,255 150,265 155,255" fill="#4caf50" />
        <polygon points="245,255 250,265 255,255" fill="#4caf50" />
        <polygon points="345,255 350,265 355,255" fill="#4caf50" />
        <polygon points="445,255 450,265 455,255" fill="#4caf50" />
      </svg>
      
      {/* Generación 1: Fundadores */}
      <div style={{ 
        position: 'absolute', 
        top: '60px', 
        left: '120px',
        display: 'flex',
        gap: '120px'
      }}>
        {/* Juan Barbara */}
        <div style={{
          border: '2px solid #1976d2',
          borderRadius: '8px',
          padding: '16px',
          backgroundColor: 'white',
          width: '160px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 2,
          position: 'relative'
        }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            backgroundColor: '#2196f3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            margin: '0 auto 12px'
          }}>
            J
          </div>
          <h4 style={{ margin: '0 0 8px 0' }}>Juan Barbara</h4>
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '4px' }}>
            <span style={{ 
              backgroundColor: '#ff9800', 
              color: 'white', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              fontSize: '10px' 
            }}>Fundador</span>
            <span style={{ 
              backgroundColor: '#e91e63', 
              color: 'white', 
              padding: '1px 6px', 
              borderRadius: '8px', 
              fontSize: '9px' 
            }}>Cónyuge</span>
            <span style={{ 
              backgroundColor: '#4caf50', 
              color: 'white', 
              padding: '1px 6px', 
              borderRadius: '8px', 
              fontSize: '9px' 
            }}>Padre</span>
          </div>
          <p style={{ margin: '8px 0 4px 0', fontSize: '14px', color: '#666' }}>1950 - Presente</p>
        </div>
        
        {/* Constantina Roura */}
        <div style={{
          border: '2px solid #1976d2',
          borderRadius: '8px',
          padding: '16px',
          backgroundColor: 'white',
          width: '160px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 2,
          position: 'relative'
        }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            backgroundColor: '#e91e63',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            margin: '0 auto 12px'
          }}>
            C
          </div>
          <h4 style={{ margin: '0 0 8px 0' }}>Constantina Roura</h4>
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '4px' }}>
            <span style={{ 
              backgroundColor: '#ff9800', 
              color: 'white', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              fontSize: '10px' 
            }}>Fundador</span>
            <span style={{ 
              backgroundColor: '#e91e63', 
              color: 'white', 
              padding: '1px 6px', 
              borderRadius: '8px', 
              fontSize: '9px' 
            }}>Cónyuge</span>
            <span style={{ 
              backgroundColor: '#4caf50', 
              color: 'white', 
              padding: '1px 6px', 
              borderRadius: '8px', 
              fontSize: '9px' 
            }}>Madre</span>
          </div>
          <p style={{ margin: '8px 0 4px 0', fontSize: '14px', color: '#666' }}>1952 - Presente</p>
        </div>
      </div>
      
      {/* Generación 2: Hijos */}
      <div style={{ 
        position: 'absolute', 
        top: '280px', 
        left: '70px',
        display: 'flex',
        gap: '80px'
      }}>
        {/* Luis Barbara */}
        <div style={{
          border: '2px solid #1976d2',
          borderRadius: '8px',
          padding: '16px',
          backgroundColor: 'white',
          width: '160px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 2,
          position: 'relative'
        }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            backgroundColor: '#2196f3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            margin: '0 auto 12px'
          }}>
            L
          </div>
          <h4 style={{ margin: '0 0 8px 0' }}>Luis Barbara</h4>
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '4px' }}>
            <span style={{ 
              backgroundColor: '#2196f3', 
              color: 'white', 
              padding: '1px 6px', 
              borderRadius: '8px', 
              fontSize: '9px' 
            }}>Hijo</span>
            <span style={{ 
              backgroundColor: '#e91e63', 
              color: 'white', 
              padding: '1px 6px', 
              borderRadius: '8px', 
              fontSize: '9px' 
            }}>Cónyuge</span>
          </div>
          <p style={{ margin: '8px 0 4px 0', fontSize: '14px', color: '#666' }}>1975 - Presente</p>
        </div>
        
        {/* Alicia Pasamani */}
        <div style={{
          border: '2px solid #1976d2',
          borderRadius: '8px',
          padding: '16px',
          backgroundColor: 'white',
          width: '160px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 2,
          position: 'relative'
        }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            backgroundColor: '#e91e63',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            margin: '0 auto 12px'
          }}>
            A
          </div>
          <h4 style={{ margin: '0 0 8px 0' }}>Alicia Pasamani</h4>
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '4px' }}>
            <span style={{ 
              backgroundColor: '#e91e63', 
              color: 'white', 
              padding: '1px 6px', 
              borderRadius: '8px', 
              fontSize: '9px' 
            }}>Cónyuge</span>
          </div>
          <p style={{ margin: '8px 0 4px 0', fontSize: '14px', color: '#666' }}>1978 - Presente</p>
        </div>
        
        {/* María Barbara */}
        <div style={{
          border: '2px solid #1976d2',
          borderRadius: '8px',
          padding: '16px',
          backgroundColor: 'white',
          width: '160px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 2,
          position: 'relative'
        }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            backgroundColor: '#e91e63',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            margin: '0 auto 12px'
          }}>
            M
          </div>
          <h4 style={{ margin: '0 0 8px 0' }}>María Barbara</h4>
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '4px' }}>
            <span style={{ 
              backgroundColor: '#2196f3', 
              color: 'white', 
              padding: '1px 6px', 
              borderRadius: '8px', 
              fontSize: '9px' 
            }}>Hija</span>
          </div>
          <p style={{ margin: '8px 0 4px 0', fontSize: '14px', color: '#666' }}>1977 - Presente</p>
        </div>
        
        {/* Carlos Barbara */}
        <div style={{
          border: '2px solid #1976d2',
          borderRadius: '8px',
          padding: '16px',
          backgroundColor: 'white',
          width: '160px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 2,
          position: 'relative'
        }}>
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            backgroundColor: '#2196f3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '24px',
            margin: '0 auto 12px'
          }}>
            C
          </div>
          <h4 style={{ margin: '0 0 8px 0' }}>Carlos Barbara</h4>
          <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '4px' }}>
            <span style={{ 
              backgroundColor: '#2196f3', 
              color: 'white', 
              padding: '1px 6px', 
              borderRadius: '8px', 
              fontSize: '9px' 
            }}>Hijo</span>
          </div>
          <p style={{ margin: '8px 0 4px 0', fontSize: '14px', color: '#666' }}>1980 - Presente</p>
        </div>
      </div>
      
      {/* Leyenda */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        fontSize: '12px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Leyenda:</div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#4caf50', marginRight: '5px' }}></div>
          <span>Líneas verdes: Padre/Madre → Hijo/Hija</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#e91e63', marginRight: '5px' }}></div>
          <span>Líneas rosas: Matrimonio</span>
        </div>
      </div>
    </div>
  );
};

export default TraditionalFamilyTree;