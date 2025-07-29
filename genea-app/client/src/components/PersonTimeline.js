import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase.config';

const PersonTimeline = ({ personId, onClose }) => {
  const [person, setPerson] = useState(null);
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (personId) {
      loadPersonTimeline();
    }
  }, [personId]);

  const loadPersonTimeline = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Cargar persona principal
      const personResponse = await fetch(`${process.env.REACT_APP_API_URL}/persons/${personId}`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (personResponse.ok) {
        const personResult = await personResponse.json();
        setPerson(personResult.data);
      }

      // Cargar todas las personas y relaciones
      const [peopleResponse, relResponse] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}/persons`, {
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        }),
        fetch(`${process.env.REACT_APP_API_URL}/relationships`, {
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        })
      ]);

      if (peopleResponse.ok && relResponse.ok) {
        const peopleResult = await peopleResponse.json();
        const relResult = await relResponse.json();
        
        const timeline = generateTimeline(personId, peopleResult.data || [], relResult.data || []);
        setTimelineData(timeline);
      }

    } catch (error) {
      console.error('Error loading timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeline = (targetPersonId, people, relationships) => {
    const targetPerson = people.find(p => p.id === targetPersonId);
    if (!targetPerson) return [];

    const timeline = [];
    const processed = new Set();

    // Función para obtener relación específica
    const getRelationshipType = (personId, targetId) => {
      // Padres
      const parentRel = relationships.find(r => 
        r.relationship_type === 'parent' && r.person1_id === personId && r.person2_id === targetId
      );
      if (parentRel) return 'padre/madre';

      // Hijos
      const childRel = relationships.find(r => 
        r.relationship_type === 'parent' && r.person1_id === targetId && r.person2_id === personId
      );
      if (childRel) return 'hijo/hija';

      // Cónyuge
      const spouseRel = relationships.find(r => 
        r.relationship_type === 'spouse' && 
        ((r.person1_id === personId && r.person2_id === targetId) || 
         (r.person1_id === targetId && r.person2_id === personId))
      );
      if (spouseRel) return 'cónyuge';

      // Hermanos (mismo padre)
      const targetParents = relationships.filter(r => 
        r.relationship_type === 'parent' && r.person2_id === targetId
      ).map(r => r.person1_id);
      
      const personParents = relationships.filter(r => 
        r.relationship_type === 'parent' && r.person2_id === personId
      ).map(r => r.person1_id);

      const sharedParents = targetParents.filter(p => personParents.includes(p));
      if (sharedParents.length > 0) {
        return sharedParents.length === targetParents.length && sharedParents.length === personParents.length 
          ? 'hermano/hermana' : 'medio hermano/hermana';
      }

      // Abuelos (padres de los padres)
      const isGrandparent = targetParents.some(parentId => {
        return relationships.some(r => 
          r.relationship_type === 'parent' && r.person1_id === personId && r.person2_id === parentId
        );
      });
      if (isGrandparent) return 'abuelo/abuela';

      // Nietos (hijos de los hijos)
      const targetChildren = relationships.filter(r => 
        r.relationship_type === 'parent' && r.person1_id === targetId
      ).map(r => r.person2_id);
      
      const isGrandchild = targetChildren.some(childId => {
        return relationships.some(r => 
          r.relationship_type === 'parent' && r.person1_id === childId && r.person2_id === personId
        );
      });
      if (isGrandchild) return 'nieto/nieta';

      // Tíos (hermanos de los padres)
      const isUncle = targetParents.some(parentId => {
        const parentSiblings = relationships.filter(r => 
          r.relationship_type === 'parent' && r.person2_id === parentId
        ).map(r => r.person1_id);
        
        return parentSiblings.some(grandparentId => {
          return relationships.some(r => 
            r.relationship_type === 'parent' && r.person1_id === grandparentId && r.person2_id === personId
          );
        });
      });
      if (isUncle) return 'tío/tía';

      // Sobrinos (hijos de hermanos)
      const personSiblings = people.filter(p => {
        const pParents = relationships.filter(r => 
          r.relationship_type === 'parent' && r.person2_id === p.id
        ).map(r => r.person1_id);
        return pParents.some(parent => personParents.includes(parent)) && p.id !== personId;
      });

      const isNephew = personSiblings.some(siblingId => {
        return relationships.some(r => 
          r.relationship_type === 'parent' && r.person1_id === siblingId && r.person2_id === targetId
        );
      });
      if (isNephew) return 'sobrino/sobrina';

      return 'familiar';
    };

    // Agregar persona principal
    timeline.push({
      person: targetPerson,
      relationship: 'persona principal',
      birthDate: targetPerson.birth_date,
      priority: 0
    });
    processed.add(targetPersonId);

    // Agregar familiares relacionados
    people.forEach(person => {
      if (person.id === targetPersonId || processed.has(person.id)) return;

      const relationship = getRelationshipType(person.id, targetPersonId);
      if (relationship !== 'familiar') {
        timeline.push({
          person,
          relationship,
          birthDate: person.birth_date,
          priority: getPriority(relationship)
        });
        processed.add(person.id);
      }
    });

    // Ordenar cronológicamente
    return timeline.sort((a, b) => {
      const dateA = a.birthDate ? new Date(a.birthDate) : new Date('1900-01-01');
      const dateB = b.birthDate ? new Date(b.birthDate) : new Date('1900-01-01');
      return dateA - dateB;
    });
  };

  const getPriority = (relationship) => {
    const priorities = {
      'abuelo/abuela': 1,
      'padre/madre': 2,
      'tío/tía': 3,
      'persona principal': 4,
      'hermano/hermana': 5,
      'medio hermano/hermana': 5,
      'cónyuge': 6,
      'hijo/hija': 7,
      'sobrino/sobrina': 8,
      'nieto/nieta': 9
    };
    return priorities[relationship] || 10;
  };

  const getRelationshipColor = (relationship) => {
    const colors = {
      'persona principal': '#1976d2',
      'padre/madre': '#4caf50',
      'hijo/hija': '#2196f3',
      'abuelo/abuela': '#ff9800',
      'nieto/nieta': '#03a9f4',
      'hermano/hermana': '#9c27b0',
      'medio hermano/hermana': '#9c27b0',
      'cónyuge': '#e91e63',
      'tío/tía': '#ff5722',
      'sobrino/sobrina': '#795548'
    };
    return colors[relationship] || '#666';
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
        justifyContent: 'center', alignItems: 'center', zIndex: 1000
      }}>
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
          <h3>🔄 Cargando timeline...</h3>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '12px',
        maxWidth: '800px', maxHeight: '80vh', overflow: 'auto',
        width: '90%', boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px', borderBottom: '1px solid #eee',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, color: '#1976d2' }}>
            📅 Timeline de {person?.first_name} {person?.last_name}
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: '24px',
            cursor: 'pointer', color: '#666'
          }}>×</button>
        </div>

        {/* Timeline */}
        <div style={{ padding: '20px' }}>
          <div style={{ position: 'relative', paddingLeft: '60px' }}>
            {/* Línea principal */}
            <div style={{
              position: 'absolute', left: '30px', top: '0', bottom: '0',
              width: '4px', background: 'linear-gradient(to bottom, #1976d2, #4caf50)',
              borderRadius: '2px'
            }}></div>

            {timelineData.map((item, index) => (
              <div key={item.person.id} style={{
                position: 'relative', marginBottom: '30px', paddingLeft: '50px'
              }}>
                {/* Punto en la línea */}
                <div style={{
                  position: 'absolute', left: '-50px', top: '15px',
                  width: '20px', height: '20px', borderRadius: '50%',
                  backgroundColor: getRelationshipColor(item.relationship),
                  border: '4px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '10px', fontWeight: 'bold'
                }}>
                  {item.person.first_name?.charAt(0) || '?'}
                </div>

                {/* Tarjeta de persona */}
                <div style={{
                  border: `2px solid ${getRelationshipColor(item.relationship)}`,
                  borderRadius: '12px', padding: '16px', backgroundColor: 'white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative'
                }}>
                  {/* Año prominente */}
                  <div style={{
                    position: 'absolute', top: '-10px', right: '15px',
                    backgroundColor: getRelationshipColor(item.relationship),
                    color: 'white', padding: '4px 12px', borderRadius: '15px',
                    fontSize: '12px', fontWeight: 'bold'
                  }}>
                    {item.birthDate ? new Date(item.birthDate).getFullYear() : '?'}
                  </div>

                  <h4 style={{ margin: '0 0 8px 0', color: '#1976d2' }}>
                    {item.person.first_name} {item.person.last_name || ''}
                  </h4>

                  {/* Badge de relación */}
                  <div style={{
                    backgroundColor: getRelationshipColor(item.relationship),
                    color: 'white', padding: '4px 12px', borderRadius: '20px',
                    fontSize: '12px', fontWeight: 'bold', display: 'inline-block',
                    marginBottom: '8px'
                  }}>
                    {item.relationship}
                  </div>

                  <p style={{ margin: '4px 0', fontSize: '14px', color: '#666' }}>
                    📅 {item.birthDate ? new Date(item.birthDate).toLocaleDateString() : 'Fecha desconocida'}
                  </p>

                  {item.person.birth_place && (
                    <p style={{ margin: '4px 0', fontSize: '12px', color: '#888' }}>
                      📍 {item.person.birth_place}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer con estadísticas */}
        <div style={{
          padding: '15px 20px', borderTop: '1px solid #eee',
          backgroundColor: '#f8f9fa', fontSize: '12px', color: '#666'
        }}>
          📊 Timeline de {timelineData.length} personas relacionadas con {person?.first_name}
        </div>
      </div>
    </div>
  );
};

export default PersonTimeline;