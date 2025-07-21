import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Box, 
  Toolbar, 
  IconButton, 
  Typography, 
  Menu, 
  Container, 
  Avatar, 
  Button, 
  Tooltip, 
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Settings,
  FamilyRestroom,
  Dashboard,
  Person,
  ChevronLeft
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };
  
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Mis Familias', icon: <FamilyRestroom />, path: '/dashboard' },
    { text: 'Personas', icon: <Person />, path: '/dashboard?tab=persons' }
  ];
  
  return (
    <Box sx={{ display: 'flex' }}>
      {/* Barra de navegación superior */}
      <AppBar position="fixed">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <IconButton
              color="inherit"
              aria-label="abrir menú"
              onClick={toggleDrawer}
              edge="start"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}
            >
              Genea
            </Typography>
            
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Abrir opciones">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar 
                    alt={currentUser?.displayName || 'Usuario'} 
                    src={currentUser?.photoURL || undefined}
                  />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/profile'); }}>
                  <ListItemIcon>
                    <AccountCircle fontSize="small" />
                  </ListItemIcon>
                  <Typography textAlign="center">Mi Perfil</Typography>
                </MenuItem>
                <MenuItem onClick={() => { handleCloseUserMenu(); navigate('/profile/settings'); }}>
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  <Typography textAlign="center">Configuración</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { handleCloseUserMenu(); handleLogout(); }}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  <Typography textAlign="center">Cerrar Sesión</Typography>
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Menú lateral */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={toggleDrawer}
        ModalProps={{
          keepMounted: true, // Mejor rendimiento en dispositivos móviles
        }}
        sx={{
          '& .MuiDrawer-paper': { 
            width: 240,
            boxSizing: 'border-box',
            backgroundColor: theme => theme.palette.background.default
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', padding: 2 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Genea
          </Typography>
          <IconButton onClick={toggleDrawer}>
            <ChevronLeft />
          </IconButton>
        </Box>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.text} 
              onClick={() => {
                navigate(item.path);
                toggleDrawer();
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      
      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          minHeight: '100vh',
          marginTop: '64px', // Altura de la barra de navegación
          backgroundColor: theme => theme.palette.background.default
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;