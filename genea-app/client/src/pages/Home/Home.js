import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [recentFamilies, setRecentFamilies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Aquí se cargarían las familias recientes del usuario
    // Por ahora usamos datos de ejemplo
    const fetchRecentFamilies = async () => {
      try {
        // Simulamos una llamada a la API
        setTimeout(() => {
          setRecentFamilies([
            { _id: '1', name: 'Familia Pérez', membersCount: 12, lastUpdated: '2023-07-15' },
            { _id: '2', name: 'Familia García', membersCount: 8, lastUpdated: '2023-07-10' },
            { _id: '3', name: 'Familia López', membersCount: 15, lastUpdated: '2023-07-05' }
          ]);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error al cargar familias recientes:', error);
        setLoading(false);
      }
    };

    fetchRecentFamilies();
  }, []);

  return (
    <div className="home-container">
      <section className="hero-section">
        <h1>Bienvenido a Genea</h1>
        <p>Tu plataforma para crear y gestionar árboles genealógicos familiares</p>
        <div className="hero-actions">
          <Link to="/family/new" className="btn btn-primary">Crear nueva familia</Link>
          <Link to="/families" className="btn btn-secondary">Ver mis familias</Link>
        </div>
      </section>

      <section className="recent-families">
        <h2>Familias recientes</h2>
        {loading ? (
          <div className="loading">Cargando familias...</div>
        ) : (
          <div className="families-grid">
            {recentFamilies.map(family => (
              <div key={family._id} className="family-card">
                <h3>{family.name}</h3>
                <p>{family.membersCount} miembros</p>
                <p className="last-updated">Última actualización: {family.lastUpdated}</p>
                <div className="card-actions">
                  <Link to={`/family/${family._id}`} className="btn btn-sm">Ver detalles</Link>
                  <Link to={`/family/${family._id}/tree`} className="btn btn-sm btn-outline">Ver árbol</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="features-section">
        <h2>Características principales</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🌳</div>
            <h3>Árbol interactivo</h3>
            <p>Visualiza tu árbol genealógico de forma interactiva y navega fácilmente entre generaciones.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👪</div>
            <h3>Gestión familiar</h3>
            <p>Añade y edita información detallada de cada miembro de tu familia.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Acceso móvil</h3>
            <p>Accede a tu árbol genealógico desde cualquier dispositivo, en cualquier momento.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🖼️</div>
            <h3>Galería multimedia</h3>
            <p>Guarda y organiza fotos y documentos importantes de tu familia.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;