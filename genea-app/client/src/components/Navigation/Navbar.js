import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // Verificar si el usuario está autenticado
  const isAuthenticated = localStorage.getItem('authToken') !== null;
  
  const handleLogout = () => {
    // Eliminar el token de autenticación
    localStorage.removeItem('authToken');
    // Redirigir al inicio de sesión
    navigate('/auth/login');
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">Genea</span>
        </Link>
        
        <div className="menu-icon" onClick={toggleMenu}>
          <i className={isMenuOpen ? 'fas fa-times' : 'fas fa-bars'}>
            {isMenuOpen ? '✕' : '☰'}
          </i>
        </div>
        
        <ul className={isMenuOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              Inicio
            </Link>
          </li>
          
          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link to="/families" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  Mis Familias
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/persons" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  Personas
                </Link>
              </li>
              <li className="nav-item dropdown">
                <span className="nav-link dropdown-toggle">
                  Mi Cuenta
                </span>
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                    Perfil
                  </Link>
                  <Link to="/settings" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                    Configuración
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={handleLogout}>
                    Cerrar Sesión
                  </button>
                </div>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/auth/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  Iniciar Sesión
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/auth/register" className="nav-link nav-link-highlight" onClick={() => setIsMenuOpen(false)}>
                  Registrarse
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;