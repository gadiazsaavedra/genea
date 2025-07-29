import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase.config';

const RelationshipManager = ({ personId, onClose }) => {
  const [relationships, setRelationships] = useState({});
  const [relationshipTypes, setRelationshipTypes] = useState({});
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRelation, setNewRelation] = useState({
    person2_id: '',
    relationship_type: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [personId]);

  const fetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Obtener tipos de relaciones
      const typesResponse = await fetch(`${process.env.REACT_APP_API_URL}/relationships/types`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (typesResponse.ok) {
        const typesResult = await typesResponse.json();
        setRelationshipTypes(typesResult.data.types);
      }

      // Obtener relaciones de la persona
      const relResponse = await fetch(`${process.env.REACT_APP_API_URL}/relationships/person/${personId}`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (relResponse.ok) {
        const relResult = await relResponse.json();
        setRelationships(relResult.data.relationships);
      }

      // Obtener todas las personas para el selector
      const peopleResponse = await fetch(`${process.env.REACT_APP_API_URL}/people`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (peopleResponse.ok) {
        const peopleResult = await peopleResponse.json();
        setPeople(peopleResult.data.filter(p => p.id !== personId));
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRelation = async (e) => {
    e.preventDefault();
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/relationships`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          person1_id: personId,
          ...newRelation
        })
      });

      if (response.ok) {
        setShowAddForm(false);
        setNewRelation({ person2_id: '', relationship_type: '', notes: '' });
        fetchData(); // Recargar datos
        alert('Relación agregada exitosamente');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error adding relation:', error);
      alert('Error al agregar relación');
    }
  };

  const handleDeleteRelation = async (relationId, relationPerson) => {
    // Primera confirmación
    const step1 = window.confirm(
      `¿Estás seguro de eliminar la relación con "${relationPerson.first_name} ${relationPerson.last_name || ''}"?\n\nEsta acción eliminará la conexión familiar.`
    );
    if (!step1) return;
    
    // Segunda confirmación con texto específico
    const userInput = window.prompt(
      `⚠️ CONFIRMACIÓN FINAL ⚠️\n\nPara eliminar la relación con "${relationPerson.first_name} ${relationPerson.last_name || ''}", escribe exactamente:\nELIMINAR RELACION\n\n(Esta acción no se puede deshacer)`
    );
    
    if (userInput !== 'ELIMINAR RELACION') {
      if (userInput !== null) {
        alert('Eliminación cancelada. Debe escribir exactamente "ELIMINAR RELACION"');
      }
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/relationships/${relationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });

      if (response.ok) {
        fetchData(); // Recargar datos
        alert('Relación eliminada exitosamente');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting relation:', error);
      alert('Error al eliminar relación');
    }
  };

  if (loading) return <div>Cargando relaciones...</div>;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        maxWidth: '800px',
        maxHeight: '80vh',
        overflow: 'auto',
        width: '90%'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>👥 Gestión de Relaciones Familiares</h2>
          <button onClick={onClose} style={{ fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              backgroundColor: '#4caf50',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            + Agregar Relación
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddRelation} style={{
            backgroundColor: '#f5f5f5',
            padding: '15px',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            <h3>Nueva Relación</h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              <div>
                <label>Persona:</label>
                <select
                  value={newRelation.person2_id}
                  onChange={(e) => setNewRelation({...newRelation, person2_id: e.target.value})}
                  required
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="">Seleccionar persona...</option>
                  {people.map(person => (
                    <option key={person.id} value={person.id}>
                      {person.first_name} {person.last_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label>Tipo de Relación:</label>
                <select
                  value={newRelation.relationship_type}
                  onChange={(e) => setNewRelation({...newRelation, relationship_type: e.target.value})}
                  required
                  style={{ width: '100%', padding: '8px' }}
                >
                  <option value="">Seleccionar relación...</option>
                  {Object.entries(relationshipTypes).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label>Notas (opcional):</label>
                <textarea
                  value={newRelation.notes}
                  onChange={(e) => setNewRelation({...newRelation, notes: e.target.value})}
                  style={{ width: '100%', padding: '8px', height: '60px' }}
                  placeholder="Información adicional..."
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{
                  backgroundColor: '#2196f3',
                  color: 'white',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  Agregar
                </button>
                <button type="button" onClick={() => setShowAddForm(false)} style={{
                  backgroundColor: '#f44336',
                  color: 'white',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}>
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        )}

        <div>
          <h3>Relaciones Existentes</h3>
          {Object.keys(relationships).length === 0 ? (
            <p>No hay relaciones registradas.</p>
          ) : (
            Object.entries(relationships).map(([relType, relations]) => (
              <div key={relType} style={{ marginBottom: '20px' }}>
                <h4 style={{ 
                  backgroundColor: '#e3f2fd', 
                  padding: '8px', 
                  borderRadius: '4px',
                  margin: '0 0 10px 0'
                }}>
                  {relationshipTypes[relType] || relType} ({relations.length})
                </h4>
                {relations.map(relation => (
                  <div key={relation.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginBottom: '5px'
                  }}>
                    <div>
                      <strong>{relation.person.first_name} {relation.person.last_name}</strong>
                      {relation.notes && <div style={{ fontSize: '12px', color: '#666' }}>{relation.notes}</div>}
                    </div>
                    <button
                      onClick={() => handleDeleteRelation(relation.id, relation.person)}
                      style={{
                        backgroundColor: '#f44336',
                        color: 'white',
                        padding: '4px 8px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RelationshipManager;