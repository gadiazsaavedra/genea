import React, { useState } from 'react';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Badge,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  Home,
  People,
  AccountTree,
  Map,
  Settings
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileNavigation = ({ notificationCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const getValueFromPath = (pathname) => {
    if (pathname === '/' || pathname === '/dashboard') return 0;
    if (pathname.includes('/persons')) return 1;
    if (pathname.includes('/tree')) return 2;
    if (pathname.includes('/map')) return 3;
    if (pathname.includes('/settings')) return 4;
    return 0;
  };

  const [value, setValue] = useState(getValueFromPath(location.pathname));

  const handleChange = (event, newValue) => {
    setValue(newValue);
    
    switch (newValue) {
      case 0:
        navigate('/dashboard');
        break;
      case 1:
        navigate('/persons');
        break;
      case 2:
        navigate('/tree');
        break;
      case 3:
        navigate('/map');
        break;
      case 4:
        navigate('/settings');
        break;
      default:
        navigate('/dashboard');
    }
  };

  if (!isMobile) return null;

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        borderTop: '1px solid #e0e0e0'
      }} 
      elevation={3}
    >
      <BottomNavigation
        value={value}
        onChange={handleChange}
        showLabels
        sx={{
          '& .MuiBottomNavigationAction-root': {
            minWidth: 'auto',
            padding: '6px 12px 8px',
          },
          '& .MuiBottomNavigationAction-label': {
            fontSize: '0.75rem',
            marginTop: '4px'
          }
        }}
      >
        <BottomNavigationAction label="Inicio" icon={<Home />} />
        <BottomNavigationAction label="Personas" icon={<People />} />
        <BottomNavigationAction label="Árbol" icon={<AccountTree />} />
        <BottomNavigationAction label="Mapa" icon={<Map />} />
        <BottomNavigationAction 
          label="Config" 
          icon={
            notificationCount > 0 ? (
              <Badge badgeContent={notificationCount} color="error">
                <Settings />
              </Badge>
            ) : (
              <Settings />
            )
          } 
        />
      </BottomNavigation>
    </Paper>
  );
};

export default MobileNavigation;