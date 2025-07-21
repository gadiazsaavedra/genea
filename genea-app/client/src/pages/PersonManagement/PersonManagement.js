import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PersonForm from '../../components/PersonForm/PersonForm';
import './PersonManagement.css';

const PersonManagement = () => {
  const [persons, setPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPersons, setFilteredPersons] = useState([]);

  useEffect(() => {
    const fetchPersons = async () => {
      try {
        // Aquí se cargarían las personas desde la API
        // Por ahora usamos datos de ejemplo
        setTimeout(() => {
          const mockPersons = [
            {
              _id: '1',
              fullName: 'Juan Pérez',
              birthDate: '1950-05-15',
              birthPlace: 'Madrid, España',
              isAlive: true,
              occupation: 'Ingeniero (jubilado)'
            },
            {
              _id: '2',
              fullName: 'María Pérez',
              birthDate: '1975-08-20',
              birthPlace: 'Barcelona, España',
              isAlive: true,
              occupation: 'Médico'
            },
            {
              _id: '3',
              fullName: 'Pedro Pérez',
              birthDate: '1978-12-03',
              birthPlace: 'Valencia, España',
              isAlive: true,
              occupation: 'Abogado'
            },
            {
              _id: '4',
              fullName: 'Carlos Gómez',
              birthDate: '2000-03-10',
              birthPlace: 'Madrid, España',
              isAlive: true,
              occupation: 'Estudiante'
            },
            {
              _id: '5',
              fullName: 'Laura Gómez',
              birthDate: '2002-11-05',
              birthPlace: 'Madrid, España',
              isAlive: true,
              occupation: 'Estudiante'
            }
          ];
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
        // Aquí se eliminaría la persona a través de la API
        // Por ahora simulamos la eliminación
        setPersons(persons.filter(p => p._id !== personId));
        setFilteredPersons(filteredPersons.filter(p => p._id !== personId));
      } catch (error) {
        console.error('Error al eliminar persona:', error);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingPerson) {
        // Actualizar persona existente
        const updatedPersons = persons.map(p => 
          p._id === editingPerson._id ? { ...p, ...formData } : p
        );
        setPersons(updatedPersons);
        setFilteredPersons(updatedPersons);
      } else {
        // Crear nueva persona
        const newPerson = {
          _id: Date.now().toString(), // Simulamos un ID
          ...formData
        };
        setPersons([...persons, newPerson]);
        setFilteredPersons([...filteredPersons, newPerson]);
      }
      setShowForm(false);
    } catch (error) {
      console.error('Error al guardar persona:', error);
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
        <button className="btn btn-primary" onClick={handleAddPerson}>
          Añadir Persona
        </button>
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
                  <tr key={person._id}>
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
                        onClick={() => handleDeletePerson(person._id)}
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
    </div>
  );
};

export default PersonManagement;