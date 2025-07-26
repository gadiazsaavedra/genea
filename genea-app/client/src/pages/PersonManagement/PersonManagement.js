import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase.config';
import PersonForm from '../../components/PersonForm/PersonForm';
import BulkDeleteModal from '../../components/BulkDeleteModal';
import './PersonManagement.css';

const PersonManagement = () => {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPersons, setFilteredPersons] = useState([]);
  const [showBulkDelete, setShowBulkDelete] = useState(false);

  useEffect(() => {
    const fetchPersons = async () => {
      try {
        setTimeout(() => {
          const mockPersons = [];
          setPersons(mockPersons);
          setFilteredPersons(mockPersons);
          setLoading(false);
        }, 600);
      } catch (error) {
        console.error('Error al cargar personas:', error);
        setLoading(false);
      }
    };

    fetchPersons();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = persons.filter(person => 
        person.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPersons(filtered);
    } else {
      setFilteredPersons(persons);
    }
  }, [searchTerm, persons]);

  const handleAddPerson = () => {
    setEditingPerson(null);
    setShowForm(true);
  };

  const handleEditPerson = (person) => {
    setEditingPerson(person);
    setShowForm(true);
  };

  const handleDeletePerson = async (personId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta persona?')) {
      try {
        const { error } = await supabase
          .from('persons')
          .delete()
          .eq('id', personId);
        
        if (error) throw error;
        
        setPersons(persons.filter(p => p.id !== personId));
        setFilteredPersons(filteredPersons.filter(p => p.id !== personId));
      } catch (error) {
        console.error('Error al eliminar persona:', error);
        alert('Error al eliminar persona');
      }
    }
  };

  const handleBulkDelete = async () => {
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
        // Actualizar persona existente
        const response = await fetch(`${process.env.REACT_APP_API_URL}/persons/${editingPerson.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          console.error('Update person error:', result);
          throw new Error(result.message || 'Error al actualizar persona');
        }
        
        const updatedPersons = persons.map(p => 
          p.id === editingPerson.id ? result.data : p
        );
        setPersons(updatedPersons);
        setFilteredPersons(updatedPersons);
      } else {
        // Crear nueva persona
        console.log('Creating person with API:', `${process.env.REACT_APP_API_URL}/persons`);
        
        const response = await fetch(`${process.env.REACT_APP_API_URL}/persons`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        console.log('Create person response:', response.status, result);
        
        if (!response.ok) {
          console.error('Create person error:', result);
          throw new Error(result.message || result.error || 'Error al crear persona');
        }
        
        setPersons([...persons, result.data]);
        setFilteredPersons([...filteredPersons, result.data]);
      }
      setShowForm(false);
    } catch (error) {
      console.error('Error al guardar persona:', error);
      alert(`Error al agregar persona: ${error.message}`);
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
        <h1>Gestión de Personas</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={handleAddPerson}>
            Añadir Persona
          </button>
          {persons.length > 0 && (
            <button 
              className="btn btn-danger" 
              onClick={() => setShowBulkDelete(true)}
              style={{ backgroundColor: '#d32f2f' }}
            >
              Eliminar Todas
            </button>
          )}
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Buscar persona..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading">Cargando personas...</div>
      ) : (
        <div className="persons-table-container">
          <table className="persons-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Fecha de nacimiento</th>
                <th>Lugar de nacimiento</th>
                <th>Estado</th>
                <th>Ocupación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPersons.length > 0 ? (
                filteredPersons.map(person => (
                  <tr key={person.id}>
                    <td>{person.fullName}</td>
                    <td>{formatDate(person.birthDate)}</td>
                    <td>{person.birthPlace || 'Desconocido'}</td>
                    <td>{person.isAlive ? 'Vivo' : 'Fallecido'}</td>
                    <td>{person.occupation || 'Desconocida'}</td>
                    <td className="actions-cell">
                      <button 
                        className="action-btn view-btn" 
                        title="Ver detalles"
                        onClick={() => {/* Ver detalles */}}
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
                  <td colSpan="6" className="no-results">
                    No se encontraron personas
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
    </div>
  );
};

export default PersonManagement;