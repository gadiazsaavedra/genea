import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navigation/Navbar';
import { AuthProvider } from './contexts/AuthContext';
import { ConnectionProvider } from './contexts/ConnectionContext';
import PrivateRoute from './components/PrivateRoute';
import authService from './services/authService';
import DeveloperInfo from './components/DeveloperInfo';
import MobileNavigation from './components/Mobile/MobileNavigation';
import PWAInstall from './components/PWAInstall';
import OfflineIndicator from './components/OfflineIndicator';
import { registerServiceWorker } from './utils/pwa';
import './i18n';
import './App.css';
import './styles/mobile-optimizations.css';

// Carga perezosa de componentes para mejorar el rendimiento
const Home = lazy(() => import('./pages/Home.tsx'));
const Dashboard = lazy(() => import('./pages/Dashboard.tsx'));
const TreeView = lazy(() => import('./pages/TreeView/TreeView'));
const PersonManagement = lazy(() => import('./pages/PersonManagement/PersonManagement'));
const FamilyManagement = lazy(() => import('./pages/FamilyManagement/FamilyManagement'));
const FamilyMembers = lazy(() => import('./pages/FamilyMembers/FamilyMembers'));
const MediaManagement = lazy(() => import('./pages/MediaManagement/MediaManagement'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const AuthCallback = lazy(() => import('./pages/Auth/AuthCallback'));
const Profile = lazy(() => import('./pages/Profile/Profile'));
const Settings = lazy(() => import('./pages/Settings/Settings'));
const Statistics = lazy(() => import('./pages/Statistics/Statistics'));
const Export = lazy(() => import('./pages/Export/Export'));
const Invitations = lazy(() => import('./pages/Invitations/Invitations'));
const Notifications = lazy(() => import('./pages/Notifications/Notifications'));
const Comments = lazy(() => import('./pages/Comments/Comments'));
const Timeline = lazy(() => import('./pages/Timeline/Timeline'));
const Research = lazy(() => import('./pages/Research/Research'));
const AI = lazy(() => import('./pages/AI/AI'));
const Events = lazy(() => import('./pages/Events/Events'));
const InvitationAccept = lazy(() => import('./pages/InvitationAccept'));

// Componente para mostrar durante la carga
const LoadingFallback = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>Cargando...</p>
  </div>
);

function App() {
  // Inicializar Firebase y PWA al cargar la aplicación
  useEffect(() => {
    try {
      authService.initFirebase();
      registerServiceWorker();
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }, []);

  return (
    <AuthProvider>
      <ConnectionProvider>
        <Router>
          <div className="app">
            <OfflineIndicator />
            <Navbar />
            <main className="main-content">
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* Rutas públicas */}
                  <Route path="/" element={<Home />} />
                  <Route path="/auth/login" element={<Login />} />
                  <Route path="/auth/register" element={<Register />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  
                  {/* Rutas protegidas */}
                  <Route 
                    path="/dashboard" 
                    element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    } 
                  />
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
                    path="/family/:familyId/members" 
                    element={
                      <PrivateRoute>
                        <FamilyMembers />
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
                  <Route 
                    path="/profile" 
                    element={
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/settings" 
                    element={
                      <PrivateRoute>
                        <Settings />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/statistics" 
                    element={
                      <PrivateRoute>
                        <Statistics />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/export" 
                    element={
                      <PrivateRoute>
                        <Export />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/invitations" 
                    element={
                      <PrivateRoute>
                        <Invitations />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/notifications" 
                    element={
                      <PrivateRoute>
                        <Notifications />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/comments" 
                    element={
                      <PrivateRoute>
                        <Comments />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/timeline" 
                    element={
                      <PrivateRoute>
                        <Timeline />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/research" 
                    element={
                      <PrivateRoute>
                        <Research />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/ai" 
                    element={
                      <PrivateRoute>
                        <AI />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/events" 
                    element={
                      <PrivateRoute>
                        <Events />
                      </PrivateRoute>
                    } 
                  />
                  <Route 
                    path="/invitation/accept/:token" 
                    element={<InvitationAccept />}
                  />
                  
                  {/* Ruta para manejar páginas no encontradas */}
                  <Route path="*" element={<div className="not-found">Página no encontrada</div>} />
                </Routes>
              </Suspense>
            </main>
            <MobileNavigation />
            <PWAInstall />
            <DeveloperInfo variant="footer" />
          </div>
        </Router>
      </ConnectionProvider>
    </AuthProvider>
  );
}

export default App;