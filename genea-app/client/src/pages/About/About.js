import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Grid,
  Chip,
  Avatar
} from '@mui/material';
import { 
  Code, 
  Web, 
  Storage, 
  Security,
  Speed,
  Group
} from '@mui/icons-material';
import DeveloperInfo from '../../components/DeveloperInfo';

const About = () => {
  const technologies = [
    'React', 'Node.js', 'TypeScript', 'Supabase', 'PostgreSQL',
    'Material-UI', 'D3.js', 'Express', 'JWT', 'REST APIs'
  ];

  const features = [
    {
      icon: <Group />,
      title: 'Colaboración Familiar',
      description: 'Múltiples usuarios pueden trabajar en el mismo árbol genealógico'
    },
    {
      icon: <Security />,
      title: 'Seguridad Avanzada',
      description: 'Autenticación robusta y control de acceso por roles'
    },
    {
      icon: <Storage />,
      title: 'Almacenamiento en la Nube',
      description: 'Fotos y documentos seguros en Supabase Storage'
    },
    {
      icon: <Speed />,
      title: 'Rendimiento Optimizado',
      description: 'Carga rápida y experiencia fluida en todos los dispositivos'
    },
    {
      icon: <Web />,
      title: 'Responsive Design',
      description: 'Funciona perfectamente en desktop, tablet y móvil'
    },
    {
      icon: <Code />,
      title: 'Código Limpio',
      description: 'Arquitectura escalable y mantenible'
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" gutterBottom color="primary">
          Acerca de Genea
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          Sistema profesional de gestión de árboles genealógicos
        </Typography>
      </Box>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            ¿Qué es Genea?
          </Typography>
          <Typography variant="body1" paragraph>
            Genea es una aplicación web moderna diseñada para ayudar a las familias a 
            crear, mantener y compartir sus árboles genealógicos. Con una interfaz 
            intuitiva y funcionalidades avanzadas, permite a los usuarios documentar 
            su historia familiar de manera colaborativa y segura.
          </Typography>
        </CardContent>
      </Card>

      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Características Principales
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    {feature.icon}
                  </Avatar>
                  <Typography variant="h6">
                    {feature.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Tecnologías Utilizadas
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {technologies.map((tech, index) => (
              <Chip 
                key={index} 
                label={tech} 
                variant="outlined" 
                color="primary"
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      <DeveloperInfo variant="modal" />
    </Container>
  );
};

export default About;