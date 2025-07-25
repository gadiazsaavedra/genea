import React, { useState } from 'react';

const BulkDeleteModal = ({ isOpen, onClose, onConfirm }) => {
  const [confirmText, setConfirmText] = useState('');

  const handleConfirm = () => {
    if (confirmText === 'ELIMINAR TODO') {
      onConfirm();
      onClose();
      setConfirmText('');
    } else {
      alert('Debes escribir exactamente "ELIMINAR TODO" para confirmar');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '500px'
      }}>
        <h2 style={{ color: '#d32f2f', marginBottom: '16px' }}>
          ⚠️ Eliminar todas las personas
        </h2>
        
        <p style={{ marginBottom: '16px' }}>
          Esta acción eliminará <strong>TODAS las personas</strong> de la base de datos.
        </p>
        
        <p style={{ marginBottom: '16px', color: '#d32f2f' }}>
          <strong>¡Esta acción NO se puede deshacer!</strong>
        </p>
        
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
            Para confirmar, escribe exactamente: <code>ELIMINAR TODO</code>
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="ELIMINAR TODO"
            style={{ 
              width: '100%', 
              padding: '8px', 
              border: '2px solid #d32f2f', 
              borderRadius: '4px',
              fontSize: '16px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ 
              padding: '10px 20px', 
              border: '1px solid #ddd', 
              backgroundColor: 'white', 
              borderRadius: '4px', 
              cursor: 'pointer' 
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={confirmText !== 'ELIMINAR TODO'}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: confirmText === 'ELIMINAR TODO' ? '#d32f2f' : '#ccc',
              color: 'white', 
              border: 'none', 
              borderRadius: '4px', 
              cursor: confirmText === 'ELIMINAR TODO' ? 'pointer' : 'not-allowed'
            }}
          >
            Eliminar Todo
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkDeleteModal;