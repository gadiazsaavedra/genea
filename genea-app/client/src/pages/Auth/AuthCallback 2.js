import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { supabase } from '../../config/supabase.config';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error en callback:', error);
          navigate('/auth/login?error=auth_failed');
          return;
        }

        if (data.session) {
          // Usuario autenticado exitosamente
          navigate('/dashboard');
        } else {
          // No hay sesión, redirigir al login
          navigate('/auth/login');
        }
      } catch (error) {
        console.error('Error procesando callback:', error);
        navigate('/auth/login?error=callback_failed');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="center" 
      minHeight="100vh"
      gap={2}
    >
      <CircularProgress size={60} />
      <Typography variant="h6">
        Completando autenticación...
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Por favor espera mientras procesamos tu login con Google
      </Typography>
    </Box>
  );
};

export default AuthCallback;