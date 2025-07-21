import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // Puedes mostrar un spinner o indicador de carga aquí
    return <div>Cargando...</div>;
  }

  if (!currentUser) {
    // Redirigir al login si no hay usuario autenticado
    return <Navigate to="/login" />;
  }

  // Si hay un usuario autenticado, mostrar el componente hijo
  return <>{children}</>;
};

export default PrivateRoute;