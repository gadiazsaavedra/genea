import React, { useState } from 'react';
import { supabase } from '../../config/supabase.config';

const Research = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/research/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ query })
      });
      
      if (response.ok) {
        const result = await response.json();
        setResults(Array.isArray(result.data) ? result.data : []);
        
        if (result.data.length === 0) {
          alert('No se encontraron resultados para tu búsqueda');
        }
      } else {
        alert('Error en la búsqueda');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔍 Investigación Genealógica</h1>
      
      <form onSubmit={handleSearch} style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Buscar antepasados, lugares, fechas..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </form>

      <div>
        <h2>📋 Resultados de Investigación ({results.length})</h2>
        {!Array.isArray(results) || results.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
            <p style={{ fontSize: '18px', color: '#666' }}>No hay resultados.</p>
            <p style={{ color: '#888' }}>Busca nombres, lugares o fechas para encontrar información en tu árbol familiar.</p>
            <div style={{ marginTop: '20px', fontSize: '14px', color: '#999' }}>
              <strong>Ejemplos de búsqueda:</strong><br/>
              • "María" - Buscar por nombre<br/>
              • "Buenos Aires" - Buscar por lugar<br/>
              • "1950" - Buscar por año<br/>
              • "Reunión" - Buscar eventos
            </div>
          </div>
        ) : (
          <div>
            {results.map((result, index) => (
              <div key={index} style={{ 
                padding: '20px', 
                border: '1px solid #eee', 
                borderRadius: '8px', 
                marginBottom: '15px',
                backgroundColor: '#f9f9f9'
              }}>
                <h3 style={{ 
                  color: result.type === 'person' ? '#28a745' : '#007bff', 
                  marginBottom: '10px' 
                }}>
                  {result.title}
                </h3>
                <p style={{ marginBottom: '10px' }}>{result.description}</p>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  <span>📅 {result.date !== 'Fecha desconocida' ? new Date(result.date).toLocaleDateString() : result.date}</span>
                  {result.source && <span style={{ marginLeft: '15px' }}>📚 {result.source}</span>}
                  {result.location && result.location !== 'Lugar desconocido' && <span style={{ marginLeft: '15px' }}>📍 {result.location}</span>}
                  <span style={{ marginLeft: '15px' }}>🎯 Tipo: {result.type === 'person' ? 'Persona' : 'Evento'}</span>
                </div>
                {result.confidence && (
                  <div style={{ marginTop: '10px' }}>
                    <span style={{ 
                      backgroundColor: result.confidence > 80 ? '#28a745' : result.confidence > 60 ? '#ffc107' : '#dc3545',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      Confianza: {result.confidence}%
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Research;