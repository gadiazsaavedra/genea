import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Alert
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Person
} from '@mui/icons-material';

const ChangeApproval = ({ familyId }) => {
  const [pendingChanges, setPendingChanges] = useState([]);

  useEffect(() => {
    loadPendingChanges();
  }, [familyId]);

  const loadPendingChanges = async () => {
    const mockChanges = [
      {
        id: '1',
        type: 'person_update',
        person_name: 'Juan García',
        proposed_by: 'María López',
        proposed_at: '2024-01-15T10:30:00Z',
        status: 'pending',
        changes: {
          birth_date: { old: '1950-05-15', new: '1950-05-20' },
          birth_place: { old: 'Buenos Aires', new: 'La Plata' }
        },
        reason: 'Encontré el acta de nacimiento original'
      }
    ];

    setPendingChanges(mockChanges);
  };

  const handleApprove = async (changeId) => {
    setPendingChanges(prev => 
      prev.map(change => 
        change.id === changeId 
          ? { ...change, status: 'approved' }
          : change
      )
    );
  };

  const handleReject = async (changeId) => {
    setPendingChanges(prev => 
      prev.map(change => 
        change.id === changeId 
          ? { ...change, status: 'rejected' }
          : change
      )
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-AR');
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        ✅ Aprobación de Cambios
      </Typography>
      
      {pendingChanges.length === 0 ? (
        <Alert severity="info">
          No hay cambios pendientes de aprobación
        </Alert>
      ) : (
        <Box>
          {pendingChanges.map(change => (
            <Card key={change.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Avatar>{change.proposed_by[0]}</Avatar>
                    <Box>
                      <Typography variant="h6">Actualización de Persona</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Por {change.proposed_by} • {formatDate(change.proposed_at)}
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Chip 
                    label="Pendiente"
                    color="warning"
                    variant="outlined"
                  />
                </Box>

                <Typography variant="subtitle1" gutterBottom>
                  <Person sx={{ mr: 1 }} />
                  {change.person_name}
                </Typography>

                <Alert severity="info" sx={{ mb: 2 }}>
                  <strong>Razón:</strong> {change.reason}
                </Alert>

                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>Cambios:</Typography>
                  {Object.entries(change.changes).map(([field, value]) => (
                    <Box key={field} mb={1}>
                      <Typography variant="body2">
                        <strong>{field}:</strong> {value.old} → {value.new}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    onClick={() => handleApprove(change.id)}
                  >
                    Aprobar
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Cancel />}
                    onClick={() => handleReject(change.id)}
                  >
                    Rechazar
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default ChangeApproval;