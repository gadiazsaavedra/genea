import React, { useState } from 'react';
import { supabase } from '../../config/supabase.config';
import './Export.css';

const Export = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleGedcomExport = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        setMessage('No hay sesión activa');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/gedcom/export`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'familia.ged';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setMessage('✅ Archivo GEDCOM descargado exitosamente');
      } else {
        setMessage('❌ Error al exportar GEDCOM');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Error al exportar GEDCOM');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="export-container">
      <h1>📤 Exportar Árbol Genealógico</h1>
      
      <div className="export-section">
        <div className="export-card">
          <h2>📄 Formato GEDCOM</h2>
          <p>
            GEDCOM es el formato estándar para intercambio de datos genealógicos.
            Compatible con la mayoría de software de genealogía.
          </p>
          
          <button 
            className="export-btn"
            onClick={handleGedcomExport}
            disabled={loading}
          >
            {loading ? '⏳ Exportando...' : '📥 Descargar GEDCOM'}
          </button>
        </div>
      </div>
      
      {message && (
        <div className={`message ${message.includes('✅') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default Export;