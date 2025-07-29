import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabase.config';
import { checkBirthdays, requestNotificationPermission, showBirthdayNotification } from '../utils/birthdayNotifications';

const BirthdayNotifications = ({ familyId }) => {
  const [people, setPeople] = useState([]);
  const [birthdayData, setBirthdayData] = useState({ todayBirthdays: [], upcomingBirthdays: [] });
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    loadPeople();
    checkNotificationPermission();
    
    // Verificar cumpleaños cada hora
    const interval = setInterval(() => {
      if (people.length > 0) {
        checkAndNotifyBirthdays();
      }
    }, 60 * 60 * 1000); // 1 hora

    return () => clearInterval(interval);
  }, [familyId]);

  useEffect(() => {
    if (people.length > 0) {
      checkAndNotifyBirthdays();
    }
  }, [people]);

  const loadPeople = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(`${process.env.REACT_APP_API_URL}/persons?familyId=${familyId}`, {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      
      if (response.ok) {
        const result = await response.json();
        setPeople(result.data || []);
      }
    } catch (error) {
      console.error('Error loading people:', error);
    }
  };

  const checkNotificationPermission = async () => {
    const hasPermission = Notification.permission === 'granted';
    setNotificationsEnabled(hasPermission);
  };

  const enableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    
    if (granted) {
      checkAndNotifyBirthdays();
    }
  };

  const checkAndNotifyBirthdays = () => {
    const birthdays = checkBirthdays(people);
    setBirthdayData(birthdays);
    
    if (notificationsEnabled) {
      // Notificar cumpleaños de hoy
      birthdays.todayBirthdays.forEach(person => {
        showBirthdayNotification(person, 0);
      });
      
      // Notificar próximos cumpleaños (solo una vez por día)
      const today = new Date().toDateString();
      const lastNotified = localStorage.getItem('lastBirthdayNotification');
      
      if (lastNotified !== today) {
        birthdays.upcomingBirthdays.forEach(person => {
          if (person.daysUntil <= 3) { // Solo próximos 3 días
            showBirthdayNotification(person, person.daysUntil);
          }
        });
        localStorage.setItem('lastBirthdayNotification', today);
      }
    }
    
    // Mostrar panel si hay cumpleaños
    if (birthdays.todayBirthdays.length > 0 || birthdays.upcomingBirthdays.length > 0) {
      setShowPanel(true);
    }
  };

  const hasBirthdays = birthdayData.todayBirthdays.length > 0 || birthdayData.upcomingBirthdays.length > 0;

  return (
    <>
      {/* Botón flotante de cumpleaños */}
      {hasBirthdays && (
        <div
          onClick={() => setShowPanel(!showPanel)}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#ff9800',
            color: 'white',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            zIndex: 1000,
            animation: 'pulse 2s infinite'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '20px' }}>🎂</div>
            <div style={{ fontSize: '10px', fontWeight: 'bold' }}>
              {birthdayData.todayBirthdays.length + birthdayData.upcomingBirthdays.length}
            </div>
          </div>
        </div>
      )}

      {/* Panel de cumpleaños */}
      {showPanel && (
        <div style={{
          position: 'fixed',
          top: '90px',
          right: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          padding: '20px',
          maxWidth: '350px',
          zIndex: 1001
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: '#ff9800' }}>🎉 Cumpleaños Familiares</h3>
            <button onClick={() => setShowPanel(false)} style={{
              background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer'
            }}>×</button>
          </div>

          {/* Cumpleaños de hoy */}
          {birthdayData.todayBirthdays.length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#4caf50' }}>🎂 Hoy cumplen años:</h4>
              {birthdayData.todayBirthdays.map(person => (
                <div key={person.id} style={{
                  backgroundColor: '#e8f5e8',
                  padding: '10px',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  border: '1px solid #4caf50'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#2e7d32' }}>
                    {person.first_name} {person.last_name || ''}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Cumple {person.age} años hoy 🎉
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Próximos cumpleaños */}
          {birthdayData.upcomingBirthdays.length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#ff9800' }}>📅 Próximos cumpleaños:</h4>
              {birthdayData.upcomingBirthdays.slice(0, 5).map(person => (
                <div key={person.id} style={{
                  backgroundColor: '#fff3e0',
                  padding: '10px',
                  borderRadius: '8px',
                  marginBottom: '8px',
                  border: '1px solid #ff9800'
                }}>
                  <div style={{ fontWeight: 'bold', color: '#f57c00' }}>
                    {person.first_name} {person.last_name || ''}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    En {person.daysUntil} día{person.daysUntil > 1 ? 's' : ''} cumplirá {person.age} años
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Configuración de notificaciones */}
          <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
            {!notificationsEnabled ? (
              <button onClick={enableNotifications} style={{
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                width: '100%'
              }}>
                🔔 Activar notificaciones automáticas
              </button>
            ) : (
              <div style={{ fontSize: '12px', color: '#4caf50', textAlign: 'center' }}>
                ✅ Notificaciones activadas
              </div>
            )}
          </div>
        </div>
      )}

      {/* CSS para animación */}
      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `}</style>
    </>
  );
};

export default BirthdayNotifications;