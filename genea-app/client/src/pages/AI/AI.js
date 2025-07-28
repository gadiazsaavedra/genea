import React, { useState } from 'react';
import { supabase } from '../../config/supabase.config';

const AI = () => {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const handleAIQuery = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/ai/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ question })
      });
      
      if (response.ok) {
        const result = await response.json();
        const aiResponse = result.data?.response || 'No se pudo obtener respuesta';
        setResponse(aiResponse);
        setHistory(prev => [...prev, { question, response: aiResponse, timestamp: new Date() }]);
        setQuestion('');
      }
    } catch (error) {
      console.error('Error:', error);
      setResponse('Error al consultar la IA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🤖 Asistente IA Genealógico</h1>
      
      <div style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
        <h3>💡 Ejemplos de preguntas:</h3>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>¿Cuántos descendientes tiene Juan Barbara?</li>
          <li>¿Cuál es el lugar de nacimiento más común en mi familia?</li>
          <li>¿Quiénes son los fundadores de mi árbol genealógico?</li>
          <li>¿Hay patrones en los nombres de mi familia?</li>
        </ul>
      </div>

      <form onSubmit={handleAIQuery} style={{ marginBottom: '30px' }}>
        <div style={{ marginBottom: '15px' }}>
          <textarea
            placeholder="Haz una pregunta sobre tu árbol genealógico..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={3}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              resize: 'vertical'
            }}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#6f42c1', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '🤔 Pensando...' : '🚀 Preguntar a la IA'}
        </button>
      </form>

      {response && (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6', 
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <h3 style={{ color: '#6f42c1', marginBottom: '15px' }}>🤖 Respuesta de la IA:</h3>
          <p style={{ lineHeight: '1.6', margin: 0 }}>{response}</p>
        </div>
      )}

      {history.length > 0 && (
        <div>
          <h2>📚 Historial de Consultas</h2>
          {history.slice().reverse().map((item, index) => (
            <div key={index} style={{ 
              padding: '15px', 
              border: '1px solid #eee', 
              borderRadius: '8px', 
              marginBottom: '15px'
            }}>
              <div style={{ marginBottom: '10px' }}>
                <strong>❓ Pregunta:</strong> {item.question}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <strong>🤖 Respuesta:</strong> {item.response}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {item.timestamp.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AI;