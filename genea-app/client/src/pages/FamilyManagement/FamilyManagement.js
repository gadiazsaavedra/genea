import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './FamilyManagement.css';

const FamilyManagement = () => {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFamily, setEditingFamily] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    const fetchFamilies = async () => {
      try {
        // Aquí se cargarían las familias desde la API
        // Por ahora usamos datos de ejemplo
        setTimeout(() => {
          const mockFamilies = [
            {
              _id: '1',
              name: 'Familia Pérez',
              description: 'Familia originaria de Madrid',
              membersCount: 12,
              createdAt: '2023-01-15',
              isAdmin: true
            },
            {
              _id: '2',
              name: 'Familia García',
              description: 'Rama familiar de Barcelona',
              membersCount: 8,
              createdAt: '2023-02-20',
              isAdmin: true
            },
            {
              _id: '3',
              name: 'Familia López',
              description: 'Familia extendida con raíces en Valencia',
              membersCount: 15,
              createdAt: '2023-03-05',
              isAdmin: false
            }
          ];
          setFamilies(mockFamilies);
          setLoading(false);
        }, 600);
      } catch (error) {
        console.error('Error al cargar familias:', error);
        setLoading(false);
      }
    };

    fetchFamilies();
  }, []);

  const handleAddFamily = () => {
    setEditingFamily(null);
    setFormData({
      name: '',
      description: ''
    });
    setShowForm(true);
  };

  const handleEditFamily = (family) => {
    setEditingFamily(family);
    setFormData({
      name: family.name,
      description: family.description
    });
    setShowForm(true);
  };

  const handleDeleteFamily = async (familyId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta familia? Esta acción no se puede deshacer.')) {
      try {
        // Aquí se eliminaría la familia a través de la API
        // Por ahora simulamos la eliminación
        setFamilies(families.filter(f => f._id !== familyId));
      } catch (error) {
        console.error('Error al eliminar familia:', error);
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFamily) {
        // Actualizar familia existente
        const updatedFamilies = families.map(f => 
          f._id === editingFamily._id ? { ...f, ...formData } : f
        );
        setFamilies(updatedFamilies);
      } else {
        // Crear nueva familia
        const newFamily = {
          _id: Date.now().toString(), // Simulamos un ID
          ...formData,
          membersCount: 1,
          createdAt: new Date().toISOString().split('T')[0],
          isAdmin: true
        };
        setFamilies([...families, newFamily]);
      }
      setShowForm(false);
    } catch (error) {
      console.error('Error al guardar familia:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="family-management-container">
      <div className="family-management-header">
        <h1>Mis Familias</h1>
        <button className="btn btn-primary" onClick={handleAddFamily}>
          Crear Nueva Familia
        </button>
      </div>

      {loading ? (
        <div className="loading">Cargando familias...</div>
      ) : (
        <div className="families-grid">
          {families.length > 0 ? (
            families.map(family => (
              <div key={family._id} className="family-card">
                <div className="family-card-header">
                  <h2>{family.name}</h2>
                  {family.isAdmin && <span className="admin-badge">Admin</span>}
                </div>
                <p className="family-description">{family.description}</p>
                <div className="family-meta">
                  <span>{family.membersCount} miembros</span>
                  <span>Creada: {formatDate(family.createdAt)}</span>
                </div>
                <div className="family-actions">
                  <Link to={`/family/${family._id}/tree`} className="btn btn-sm">
                    Ver árbol
                  </Link>
                  <Link to={`/family/${family._id}/members`} className="btn btn-sm btn-outline">
                    Miembros
                  </Link>
                  {family.isAdmin && (
                    <>
                      <button 
                        className="btn btn-sm btn-outline"
                        onClick={() => handleEditFamily(family)}
                      >
                        Editar
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteFamily(family._id)}
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-families">
              <p>No tienes familias creadas</p>
              <button className="btn btn-primary" onClick={handleAddFamily}>
                Crear tu primera familia
              </button>
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="family-form">
              <h2>{editingFamily ? 'Editar Familia' : 'Crear Nueva Familia'}</h2>
              <form onSubmit={handleFormSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Nombre de la familia *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="description">Descripción</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows="4"
                  />
                </div>
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn-cancel"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingFamily ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyManagement;