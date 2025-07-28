import React, { useState, useEffect } from 'react';
import { checkOnlineStatus, addOnlineStatusListener } from '../utils/pwa';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(checkOnlineStatus());

  useEffect(() => {
    addOnlineStatusListener(setIsOnline);
  }, []);

  if (isOnline) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      backgroundColor: '#f44336',
      color: 'white',
      padding: '10px',
      textAlign: 'center',
      zIndex: 9999,
      fontSize: '14px'
    }}>
      📵 Sin conexión - Trabajando en modo offline
    </div>
  );
};

export default OfflineIndicator;