import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase.config';
import PersonForm from '../../components/PersonForm/PersonForm';
import BulkDeleteModal from '../../components/BulkDeleteModal';
import RelationshipManager from '../../components/RelationshipManager';
import { saveOfflineData, getOfflineData } from '../../utils/pwa';
import './PersonManagement.css';

const PersonManagement = () => {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showForm, setShowForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPersons, setFilteredPersons] = useState([]);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [selectedPersonForRelations, setSelectedPersonForRelations] = useState(null);
  const [filters, setFilters] = useState({
    gender: '',
    isAlive: '',
    personType: ''
  });

  useEffect(() => {
    // Listener para cambios de conexión
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const fetchPersons = async () => {
      // Si está offline, cargar datos guardados
      if (!navigator.onLine) {
        const offlineData = getOfflineData('persons');
        if (offlineData) {
          setPersons(offlineData);
          setFilteredPersons(offlineData);
          setLoading(false);
          return;
        }
      }
      try {
        const loadPersonsFromAPI = async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            
            if (!token) {
              setPersons([]);
              setFilteredPersons([]);
              setLoading(false);
              return;
            }
            
            // Usar familyId fijo por ahora
            const familyId = 'f01051a3-128e-499a-a715-8c8c22e11e01';
            const response = await fetch(`${process.env.REACT_APP_API_URL}/persons?familyId=${familyId}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (response.ok) {
              const result = await response.json();
              const persons = result.data || [];
              setPersons(persons);
              setFilteredPersons(persons);
              // Guardar datos para uso offline
              saveOfflineData('persons', persons);
            } else {
              console.error('Error loading persons:', response.status);
              setPersons([]);
              setFilteredPersons([]);
            }
          } catch (error) {
            console.error('Error loading persons:', error);
            setPersons([]);
            setFilteredPersons([]);
          } finally {
            setLoading(false);
          }
        };
        
        loadPersonsFromAPI();
      } catch (error) {
        console.error('Error al cargar personas:', error);
        setLoading(false);
      }
    };

    fetchPersons();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    let filtered = persons;
    
    // Filtro por búsqueda de texto
    if (searchTerm) {
      filtered = filtered.filter(person => {
        const fullName = person.full_name || `${person.first_name} ${person.last_name || ''}`.trim();
        return fullName.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    
    // Filtro por género
    if (filters.gender) {
      filtered = filtered.filter(person => person.gender === filters.gender);
    }
    
    // Filtro por estado (vivo/fallecido)
    if (filters.isAlive !== '') {
      filtered = filtered.filter(person => person.is_alive === (filters.isAlive === 'true'));
    }
    
    // Filtro por tipo de persona
    if (filters.personType) {
      filtered = filtered.filter(person => {
        const personType = person.person_type || (person.is_founder ? 'founder' : 'descendant');
        return personType === filters.personType;
      });
    }
    
    setFilteredPersons(filtered);
  }, [searchTerm, persons, filters]);

  const handleAddPerson = () => {
    setEditingPerson(null);
    setShowForm(true);
  };

  const handleEditPerson = (person) => {
    setEditingPerson(person);
    setShowForm(true);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'founder': return '#ff9800';
      case 'spouse': return '#e91e63';
      default: return '#2196f3';
    }
  };

  const handleChangePersonType = async (person, newType) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (!token) {
        alert('No hay sesión activa');
        return;
      }
      
      const updateData = {
        person_type: newType,
        is_founder: newType === 'founder'
      };
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}/persons/${person.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      
      if (response.ok) {
        const updatedPersons = persons.map(p => 
          p.id === person.id ? { ...p, person_type: newType, is_founder: newType === 'founder' } : p
        );
        setPersons(updatedPersons);
        
        const typeNames = {
          'founder': 'fundador',
          'descendant': 'descendiente', 
          'spouse': 'cónyuge'
        };
        alert(`${person.first_name} ahora es ${typeNames[newType]}`);
      } else {
        const result = await response.json();
        console.error('Change type error:', result);
        alert(`Error: ${result.message || result.error || 'No se pudo actualizar'}`);
      }
    } catch (error) {
      console.error('Error updating person type:', error);
      alert('Error al actualizar tipo de persona');
    }
  };

  const handleDeletePerson = async (personId) => {
    const person = persons.find(p => p.id === personId);
    const personName = person ? (person.full_name || `${person.first_name} ${person.last_name || ''}`.trim()) : 'persona';
    
    // Doble confirmación con nombre
    const step1 = window.confirm(`¿Estás seguro de que deseas eliminar a: "${personName}"?`);
    if (!step1) return;
    
    const userInput = window.prompt(
      `⚠️ CONFIRMACIÓN FINAL ⚠️\n\nPara eliminar a "${personName}" permanentemente, escribe exactamente:\nELIMINAR\n\n(Esta acción no se puede deshacer)`
    );
    
    if (userInput === 'ELIMINAR') {
      try {
        const { error } = await supabase
          .from('persons')
          .delete()
          .eq('id', personId);
        
        if (error) throw error;
        
        const deletedPerson = persons.find(p => p.id === personId);
        setPersons(persons.filter(p => p.id !== personId));
        setFilteredPersons(filteredPersons.filter(p => p.id !== personId));
        
        // Crear notificación familiar de eliminación
        try {
          const { data: { session } } = await supabase.auth.getSession();
          await fetch(`${process.env.REACT_APP_API_URL}/notifications`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({
              type: 'person_deleted',
              title: '🗑️ Persona eliminada',
              message: `Se eliminó una persona del árbol familiar`,
              link: `/persons`,
              personName: deletedPerson ? (deletedPerson.full_name || deletedPerson.first_name) : 'persona'
            })
          });
        } catch (notifError) {
          console.log('Error creating notification:', notifError);
        }
      } catch (error) {
        console.error('Error al eliminar persona:', error);
        alert('Error al eliminar persona');
      }
    } else if (userInput !== null) {
      alert('Eliminación cancelada. Debe escribir exactamente "ELIMINAR"');
    }
  };

  const handleBulkDelete = async () => {
    // Doble confirmación para eliminación masiva
    const step1 = window.confirm(`¿Estás seguro de que deseas eliminar TODAS las ${persons.length} personas?`);
    if (!step1) return;
    
    const userInput = window.prompt(
      `🚨 ELIMINACIÓN MASIVA 🚨\n\nVas a eliminar TODAS las ${persons.length} personas permanentemente.\n\nPara confirmar, escribe exactamente:\nELIMINAR TODAS\n\n(Esta acción no se puede deshacer)`
    );
    
    if (userInput === 'ELIMINAR TODAS') {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { error } = await supabase
          .from('persons')
          .delete()
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        setPersons([]);
        setFilteredPersons([]);
        alert('Todas las personas han sido eliminadas');
      } catch (error) {
        console.error('Error al eliminar personas:', error);
        alert('Error al eliminar personas');
      }
    } else if (userInput !== null) {
      alert('Eliminación cancelada. Debe escribir exactamente "ELIMINAR TODAS"');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      console.log('Person form data:', formData);
      console.log('Token:', token);
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      if (editingPerson) {
        // Mapear datos del formulario al formato de la API para actualización
        const apiData = {
          firstName: formData.firstName,
          lastName: formData.lastName || null,
          maidenName: formData.maidenName || null,
          gender: formData.gender || null,
          birthDate: formData.birthDate || null,
          deathDate: formData.deathDate || null,
          birthPlace: formData.birthPlace || null,
          deathPlace: formData.deathPlace || null,
          deathCause: formData.deathCause || null,
          occupation: formData.occupation || null,
          biography: formData.biography || null,
          photoUrl: formData.photoUrl || null
        };
        
        // Actualizar persona existente
        const response = await fetch(`${process.env.REACT_APP_API_URL}/persons/${editingPerson.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(apiData)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          console.error('Update person error:', result);
          console.error('Response status:', response.status);
          console.error('Response statusText:', response.statusText);
          console.error('Full response:', response);
          throw new Error(result.message || result.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        const updatedPersons = persons.map(p => 
          p.id === editingPerson.id ? result.data : p
        );
        setPersons(updatedPersons);
        setFilteredPersons(updatedPersons);
        
        // Crear notificación familiar
        try {
          const { data: { session } } = await supabase.auth.getSession();
          await fetch(`${process.env.REACT_APP_API_URL}/notifications`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({
              type: 'person_updated',
              title: '✏️ Persona actualizada',
              message: `Se actualizó información de una persona`,
              link: `/persons/${result.data.id}`,
              personName: result.data.first_name
            })
          });
        } catch (notifError) {
          console.log('Error creating notification:', notifError);
        }
      } else {
        // Crear nueva persona
        console.log('Creating person with API:', `${process.env.REACT_APP_API_URL}/persons`);
        
        // Mapear datos del formulario al formato de la API
        const apiData = {
          familyId: 'f01051a3-128e-499a-a715-8c8c22e11e01', // ID de familia correcto
          firstName: formData.firstName,
          lastName: formData.lastName || null,
          maidenName: formData.maidenName || null,
          gender: formData.gender || null,
          birthDate: formData.birthDate || null,
          deathDate: formData.deathDate || null,
          birthPlace: formData.birthPlace || null,
          deathPlace: formData.deathPlace || null,
          deathCause: formData.deathCause || null,
          occupation: formData.occupation || null,
          biography: formData.biography || null,
          photoUrl: formData.photoUrl || null,
          isAlive: formData.isAlive
        };
        
        console.log('Mapped API data:', apiData);
        
        const response = await fetch(`${process.env.REACT_APP_API_URL}/persons`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(apiData)
        });
        
        const result = await response.json();
        
        console.log('=== CREATE PERSON RESPONSE ===');
        console.log('Status:', response.status);
        console.log('Status text:', response.statusText);
        console.log('Result:', result);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
          console.error('=== CREATE PERSON ERROR ===');
          console.error('Status:', response.status);
          console.error('Result:', result);
          console.error('Error message:', result.message);
          console.error('Error details:', result.error);
          console.error('Full result:', JSON.stringify(result, null, 2));
          throw new Error(result.message || result.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        setPersons([...persons, result.data]);
        setFilteredPersons([...filteredPersons, result.data]);
        
        // Crear notificación familiar
        try {
          const { data: { session } } = await supabase.auth.getSession();
          await fetch(`${process.env.REACT_APP_API_URL}/notifications`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({
              type: 'person_added',
              title: '👤 Nueva persona agregada',
              message: `Se agregó una nueva persona al árbol familiar`,
              link: `/persons`,
              personName: result.data.first_name
            })
          });
        } catch (notifError) {
          console.log('Error creating notification:', notifError);
        }
      }
      setShowForm(false);
    } catch (error) {
      console.error('=== CATCH ERROR ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      console.error('Full error:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert('Error de conexión: No se puede conectar al servidor');
      } else {
        const action = editingPerson ? 'actualizar' : 'agregar';
        alert(`Error al ${action} persona: ${error.message}`);
      }
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Desconocida';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="person-management-container">
      <div className="person-management-header">
        <h1>Gestión de Personas {!isOnline && <span style={{color: '#f44336', fontSize: '14px'}}>(📵 Offline)</span>}</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={handleAddPerson}>
            Añadir Persona
          </button>
        </div>
      </div>

      <div className="search-and-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar persona..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '300px', padding: '8px', marginRight: '16px' }}
          />
        </div>
        
        <div className="filters-bar" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <label style={{ marginRight: '8px', fontWeight: 'bold' }}>Género:</label>
            <select 
              value={filters.gender} 
              onChange={(e) => setFilters({...filters, gender: e.target.value})}
              style={{ padding: '6px' }}
            >
              <option value="">Todos</option>
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
            </select>
          </div>
          
          <div>
            <label style={{ marginRight: '8px', fontWeight: 'bold' }}>Estado:</label>
            <select 
              value={filters.isAlive} 
              onChange={(e) => setFilters({...filters, isAlive: e.target.value})}
              style={{ padding: '6px' }}
            >
              <option value="">Todos</option>
              <option value="true">Vivos</option>
              <option value="false">Fallecidos</option>
            </select>
          </div>
          
          <div>
            <label style={{ marginRight: '8px', fontWeight: 'bold' }}>Tipo:</label>
            <select 
              value={filters.personType || ''} 
              onChange={(e) => setFilters({...filters, personType: e.target.value})}
              style={{ padding: '6px' }}
            >
              <option value="">Todos</option>
              <option value="founder">Fundadores</option>
              <option value="descendant">Descendientes</option>
              <option value="spouse">Cónyuges</option>
            </select>
          </div>
          
          <button 
            onClick={() => {
              setSearchTerm('');
              setFilters({ gender: '', isAlive: '', personType: '' });
            }}
            style={{ 
              padding: '6px 12px', 
              backgroundColor: '#f5f5f5', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">Cargando personas...</div>
      ) : (
        <div className="persons-table-container">
          <table className="persons-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Género</th>
                <th>Fecha de nacimiento</th>
                <th>Lugar de nacimiento</th>
                <th>Estado</th>
                <th>Tipo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPersons.length > 0 ? (
                filteredPersons.map(person => (
                  <tr key={person.id}>
                    <td>{person.full_name || `${person.first_name} ${person.last_name || ''}`.trim()}</td>
                    <td>{person.gender === 'male' ? '👨 Masculino' : person.gender === 'female' ? '👩 Femenino' : 'No especificado'}</td>
                    <td>{formatDate(person.birth_date)}</td>
                    <td>{person.birth_place || 'Desconocido'}</td>
                    <td>
                      <span style={{ 
                        color: person.is_alive ? '#4caf50' : '#f44336',
                        fontWeight: 'bold'
                      }}>
                        {person.is_alive ? '✓ Vivo' : '✗ Fallecido'}
                      </span>
                    </td>
                    <td>
                      <select
                        value={person.person_type || (person.is_founder ? 'founder' : 'descendant')}
                        onChange={(e) => handleChangePersonType(person, e.target.value)}
                        style={{
                          backgroundColor: getTypeColor(person.person_type || (person.is_founder ? 'founder' : 'descendant')),
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="founder">🌟 Fundador</option>
                        <option value="descendant">🌳 Descendiente</option>
                        <option value="spouse">💍 Cónyuge</option>
                      </select>
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="action-btn view-btn" 
                        title="Ver detalles"
                        onClick={() => window.open(`/persons/${person.id}/media`, '_blank')}
                      >
                        👁️
                      </button>
                      <button 
                        className="action-btn edit-btn" 
                        title="Editar"
                        onClick={() => handleEditPerson(person)}
                      >
                        ✏️
                      </button>
                      <button 
                        className="action-btn relation-btn" 
                        title="Gestionar relaciones"
                        onClick={() => setSelectedPersonForRelations(person)}
                        style={{ backgroundColor: '#9c27b0' }}
                      >
                        👥
                      </button>
                      <button 
                        className="action-btn delete-btn" 
                        title="Eliminar"
                        onClick={() => handleDeletePerson(person.id)}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="no-results">
                    No se encontraron personas con los filtros aplicados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <PersonForm
              person={editingPerson}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
            />
          </div>
        </div>
      )}
      
      <BulkDeleteModal 
        isOpen={showBulkDelete}
        onClose={() => setShowBulkDelete(false)}
        onConfirm={handleBulkDelete}
      />
      
      {selectedPersonForRelations && (
        <RelationshipManager
          personId={selectedPersonForRelations.id}
          onClose={() => setSelectedPersonForRelations(null)}
        />
      )}
    </div>
  );
};

export default PersonManagement;