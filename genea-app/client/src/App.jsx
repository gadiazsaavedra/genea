import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { esES } from '@mui/material/locale';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';

// Páginas
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FamilyTree from './pages/FamilyTree';
import PersonDetail from './pages/PersonDetail';
import PersonForm from './pages/PersonForm';
import FamilyDetail from './pages/FamilyDetail';
import FamilyForm from './pages/FamilyForm';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Tema personalizado
const theme = createTheme({
  palette: {
    primary: {
      main: '#4a6741', // Verde oliva, representa árboles y naturaleza
      light: '#6e8b60',
      dark: '#2c4024',
      contrastText: '#fff',
    },
    secondary: {
      main: '#8e7d5b', // Marrón claro, representa madera y antigüedad
      light: '#b0a383',
      dark: '#6c5c36',
      contrastText: '#fff',
    },
    background: {
      default: '#f5f5f0', // Fondo crema claro
      paper: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        },
      },
    },
  },
}, esES); // Configuración para español

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Layout />}>
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              <Route path="/family-tree/:familyId" element={
                <PrivateRoute>
                  <FamilyTree />
                </PrivateRoute>
              } />
              <Route path="/person/:personId" element={
                <PrivateRoute>
                  <PersonDetail />
                </PrivateRoute>
              } />
              <Route path="/person/new" element={
                <PrivateRoute>
                  <PersonForm />
                </PrivateRoute>
              } />
              <Route path="/person/edit/:personId" element={
                <PrivateRoute>
                  <PersonForm />
                </PrivateRoute>
              } />
              <Route path="/family/:familyId" element={
                <PrivateRoute>
                  <FamilyDetail />
                </PrivateRoute>
              } />
              <Route path="/family/new" element={
                <PrivateRoute>
                  <FamilyForm />
                </PrivateRoute>
              } />
              <Route path="/family/edit/:familyId" element={
                <PrivateRoute>
                  <FamilyForm />
                </PrivateRoute>
              } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;