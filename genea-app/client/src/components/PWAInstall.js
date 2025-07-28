import React, { useState, useEffect } from 'react';

const PWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Install prompt outcome: ${outcome}`);
      setDeferredPrompt(null);
      setShowInstall(false);
    }
  };

  if (!showInstall) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: '#1976d2',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      zIndex: 1000
    }}>
      <div style={{ marginBottom: '10px' }}>
        📱 Instalar Genea como app
      </div>
      <div>
        <button 
          onClick={handleInstall}
          style={{
            backgroundColor: 'white',
            color: '#1976d2',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            marginRight: '10px',
            cursor: 'pointer'
          }}
        >
          Instalar
        </button>
        <button 
          onClick={() => setShowInstall(false)}
          style={{
            backgroundColor: 'transparent',
            color: 'white',
            border: '1px solid white',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default PWAInstall;