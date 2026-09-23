import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Button, Alert } from '@mui/material';
import { GppBad as ForbiddenIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getDefaultDashboardRoute } from '../routes/navigation';

const Unauthorized = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleReturn = () => {
    const route = getDefaultDashboardRoute(user);
    navigate(route, { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Card
        elevation={0}
        sx={{
          maxWidth: 480,
          width: '100%',
          border: '1px solid #fee2e2',
          backgroundColor: '#fff5f5',
          borderRadius: 3,
          p: 2,
          textAlign: 'center',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <ForbiddenIcon sx={{ fontSize: 56, color: '#ef4444', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#991b1b', mb: 1 }}>
            403 — Access Forbidden
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            You do not have permission to perform this action or view this resource. Your role (
            <strong>{user?.role || 'GUEST'}</strong>) does not permit access.
          </Typography>

          <Button
            variant="contained"
            color="error"
            startIcon={<ArrowBackIcon />}
            onClick={handleReturn}
            sx={{ borderRadius: 2 }}
          >
            Return to Home
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Unauthorized;
