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
        setResults(result.data || []);
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
        <h2>📋 Resultados de Investigación</h2>
        {results.length === 0 ? (
          <p>No hay resultados. Realiza una búsqueda para encontrar información genealógica.</p>
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
                <h3 style={{ color: '#007bff', marginBottom: '10px' }}>{result.title}</h3>
                <p style={{ marginBottom: '10px' }}>{result.description}</p>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  <span>📅 {result.date}</span>
                  {result.source && <span style={{ marginLeft: '15px' }}>📚 Fuente: {result.source}</span>}
                  {result.location && <span style={{ marginLeft: '15px' }}>📍 {result.location}</span>}
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