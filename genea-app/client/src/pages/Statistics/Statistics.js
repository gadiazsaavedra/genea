import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase.config';
import './Statistics.css';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      console.log('Fetching statistics...');
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      console.log('Session:', !!session, 'Token:', !!token);
      
      if (!token) {
        console.log('No token available');
        setLoading(false);
        return;
      }
      
      const url = `${process.env.REACT_APP_API_URL}/stats`;
      console.log('Fetching from:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);
      
      if (response.ok) {
        setStats(result.data);
      } else {
        console.error('API Error:', result);
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando estadísticas...</div>;
  if (!stats) return <div className="error">No se pudieron cargar las estadísticas</div>;

  return (
    <div className="statistics-container">
      <h1>📊 Estadísticas Familiares</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>👥 Total de Personas</h3>
          <div className="stat-number">{stats.totalPersons || 0}</div>
        </div>
        
        <div className="stat-card">
          <h3>👨 Hombres</h3>
          <div className="stat-number">{stats.maleCount || 0}</div>
        </div>
        
        <div className="stat-card">
          <h3>👩 Mujeres</h3>
          <div className="stat-number">{stats.femaleCount || 0}</div>
        </div>
        
        <div className="stat-card">
          <h3>💚 Vivos</h3>
          <div className="stat-number">{stats.aliveCount || 0}</div>
        </div>
        
        <div className="stat-card">
          <h3>🌟 Fundadores</h3>
          <div className="stat-number">{stats.foundersCount || 0}</div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;