import React from 'react';
import { Box, Typography, Link, Divider, IconButton } from '@mui/material';
import { Email, WhatsApp, GitHub, LinkedIn } from '@mui/icons-material';

const DeveloperInfo = ({ variant = 'footer', showTitle = true }) => {
  const containerStyle = {
    footer: {
      textAlign: 'center',
      py: 2,
      px: 3,
      backgroundColor: '#f5f5f5',
      borderTop: '1px solid #e0e0e0',
      mt: 'auto'
    },
    sidebar: {
      p: 2,
      backgroundColor: '#fafafa',
      borderRadius: 1,
      border: '1px solid #e0e0e0'
    },
    modal: {
      textAlign: 'center',
      p: 3
    }
  };

  return (
    <Box sx={containerStyle[variant]}>
      {showTitle && (
        <>
          <Typography variant="h6" color="primary" gutterBottom>
            Desarrollado por
          </Typography>
          <Divider sx={{ mb: 2 }} />
        </>
      )}
      
      <Typography variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
        Gustavo Díaz Saavedra
      </Typography>
      
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Desarrollador Full Stack
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, my: 2 }}>
        <IconButton 
          component={Link} 
          href="mailto:gadiazsaavedra@gmail.com"
          color="primary"
          title="Email"
        >
          <Email />
        </IconButton>
        
        <IconButton 
          component={Link} 
          href="https://wa.me/5491149737619"
          target="_blank"
          color="success"
          title="WhatsApp"
        >
          <WhatsApp />
        </IconButton>
        
        <IconButton 
          component={Link} 
          href="https://github.com/gadiazsaavedra"
          target="_blank"
          color="inherit"
          title="GitHub"
        >
          <GitHub />
        </IconButton>
      </Box>
      
      <Typography variant="body2" color="text.secondary">
        <Link href="mailto:gadiazsaavedra@gmail.com" color="inherit">
          gadiazsaavedra@gmail.com
        </Link>
        {' • '}
        <Link href="https://wa.me/5491149737619" target="_blank" color="inherit">
          +54 11 4973-7619
        </Link>
      </Typography>
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        © {new Date().getFullYear()} Genea - Sistema de Gestión de Árbol Genealógico
      </Typography>
    </Box>
  );
};

export default DeveloperInfo;