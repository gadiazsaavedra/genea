import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../config/supabase.config';
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
        const loadFamiliesFromSupabase = async () => {
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
              setLoading(false);
              return;
            }
            
            const { data, error } = await supabase
              .from('families')
              .select('*')
              .eq('user_id', user.id);
            
            if (error) throw error;
            setFamilies(data || []);
          } catch (error) {
            console.error('Error loading families:', error);
            setFamilies([]);
          } finally {
            setLoading(false);
          }
        };
        
        loadFamiliesFromSupabase();
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
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (editingFamily) {
        // Actualizar familia existente
        const response = await fetch(`${process.env.REACT_APP_API_URL}/families/${editingFamily.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description
          })
        });
        
        const result = await response.json();
        
        console.log('Response status:', response.status);
        console.log('Response data:', result);
        
        if (!response.ok) {
          console.error('API Error:', result);
          throw new Error(result.message || result.error || 'Error al actualizar familia');
        }
        
        const updatedFamilies = families.map(f => 
          f.id === editingFamily.id ? result.data : f
        );
        setFamilies(updatedFamilies);
      } else {
        // Crear nueva familia
        const response = await fetch(`${process.env.REACT_APP_API_URL}/families`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description
          })
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.message || 'Error al crear familia');
        }
        
        setFamilies([...families, result.data]);
      }
      setShowForm(false);
      setFormData({ name: '', description: '' });
    } catch (error) {
      console.error('Error al guardar familia:', error);
      console.error('Error details:', error.message);
      alert(`Error al guardar familia: ${error.message}`);
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
              <div key={family.id} className="family-card">
                <div className="family-card-header">
                  <h2>{family.name}</h2>
                  <span className="admin-badge">Admin</span>
                </div>
                <p className="family-description">{family.description}</p>
                <div className="family-meta">
                  <span>Creada: {formatDate(family.created_at)}</span>
                </div>
                <div className="family-actions">
                  <Link to={`/family/${family.id}/tree`} className="btn btn-sm">
                    Ver árbol
                  </Link>
                  <Link to={`/family/${family.id}/members`} className="btn btn-sm btn-outline">
                    Miembros
                  </Link>
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => handleEditFamily(family)}
                  >
                    Editar
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteFamily(family.id)}
                  >
                    Eliminar
                  </button>
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