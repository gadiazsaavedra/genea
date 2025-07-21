import React, { createContext, useContext, useState, useEffect } from 'react';

interface ConnectionContextType {
  connectionType: string;
  isOnline: boolean;
  isSlowConnection: boolean;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnection debe ser usado dentro de un ConnectionProvider');
  }
  return context;
};

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSlowConnection, setIsSlowConnection] = useState<boolean>(false);

  useEffect(() => {
    // Detectar cambios en la conexión
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Detectar tipo de conexión si está disponible
    if ('connection' in navigator && navigator['connection']) {
      const networkInfo = navigator['connection'];
      
      // Establecer tipo de conexión inicial
      setConnectionType(networkInfo.effectiveType || 'unknown');
      setIsSlowConnection(['slow-2g', '2g', '3g'].includes(networkInfo.effectiveType));
      
      // Escuchar cambios en el tipo de conexión
      const handleConnectionChange = () => {
        setConnectionType(networkInfo.effectiveType || 'unknown');
        setIsSlowConnection(['slow-2g', '2g', '3g'].includes(networkInfo.effectiveType));
      };
      
      networkInfo.addEventListener('change', handleConnectionChange);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        networkInfo.removeEventListener('change', handleConnectionChange);
      };
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const value = {
    connectionType,
    isOnline,
    isSlowConnection
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
};

export default ConnectionProvider;