import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../LanguageSelector';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  
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
            <LanguageSelector variant="compact" />
          </li>
          <li className="nav-item">
            <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>
              {t('nav.dashboard')}
            </Link>
          </li>
          
          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link to="/families" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  {t('nav.families')}
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/persons" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  {t('nav.people')}
                </Link>
              </li>
              <li className="nav-item">
                <button 
                  className="nav-link logout-btn" 
                  onClick={handleLogout}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: '#fff', 
                    cursor: 'pointer',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    backgroundColor: '#dc3545'
                  }}
                >
                  {t('nav.logout')}
                </button>
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
                    {t('nav.logout')}
                  </button>
                </div>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/auth/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  {t('auth.login')}
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/auth/register" className="nav-link nav-link-highlight" onClick={() => setIsMenuOpen(false)}>
                  {t('auth.register')}
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