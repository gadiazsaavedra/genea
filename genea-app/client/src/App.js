import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navigation/Navbar';
import { AuthProvider } from './contexts/AuthContext';
import { ConnectionProvider } from './contexts/ConnectionContext';
import PrivateRoute from './components/PrivateRoute';
import authService from './services/authService';
import './App.css';
import './styles/mobile-optimizations.css';

// Carga perezosa de componentes para mejorar el rendimiento
const Home = lazy(() => import('./pages/Home/Home'));
const TreeView = lazy(() => import('./pages/TreeView/TreeView'));
const PersonManagement = lazy(() => import('./pages/PersonManagement/PersonManagement'));
const FamilyManagement = lazy(() => import('./pages/FamilyManagement/FamilyManagement'));
const MediaManagement = lazy(() => import('./pages/MediaManagement/MediaManagement'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));

// Componente para mostrar durante la carga
const LoadingFallback = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Cargando...</p>
  </div>
);

function App() {
  // Inicializar Firebase al cargar la aplicación
  useEffect(() => {
    try {
      authService.initFirebase();
    } catch (error) {
      console.error('Error initializing Firebase:', error);
    }
  }, []);

  return (
    <AuthProvider>
      <ConnectionProvider>
        <Router>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* Rutas públicas */}
                  <Route path="/" element={<Home />} />
                  <Route path="/auth/login" element={<Login />} />
                  <Route path="/auth/register" element={<Register />} />
                  
                  {/* Rutas protegidas */}
                  <Route 
                    path="/family/:familyId/tree" 
                    element={
                      <PrivateRoute>
                        <TreeView />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/persons" 
                    element={
                      <PrivateRoute>
                        <PersonManagement />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/families" 
                    element={
                      <PrivateRoute>
                        <FamilyManagement />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/persons/:personId/media" 
                    element={
                      <PrivateRoute>
                        <MediaManagement />
                      </PrivateRoute>
                    } 
                  />
                  
                  {/* Ruta para manejar páginas no encontradas */}
                  <Route path="*" element={<div className="not-found">Página no encontrada</div>} />
                </Routes>
              </Suspense>
            </main>
            <footer className="footer">
              <div className="footer-content">
                <p>&copy; {new Date().getFullYear()} Genea - Sistema de Gestión de Árbol Genealógico</p>
              </div>
            </footer>
          </div>
        </Router>
      </ConnectionProvider>
    </AuthProvider>
  );
}

export default App;