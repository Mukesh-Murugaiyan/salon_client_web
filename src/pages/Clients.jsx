import React from 'react';
import { Box, Typography, Card, CardContent, Alert } from '@mui/material';
import { People as PeopleIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Clients = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <PeopleIcon sx={{ fontSize: 36, color: '#ec4899' }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Clients Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage client profiles, service history, and loyalty preferences
          </Typography>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        Authorized Roles: <strong>OWNER</strong>, <strong>RECEPTIONIST</strong>. Scoped strictly to Salon ID:{' '}
        <code>{user?.salonId}</code>.
      </Alert>

      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#475569', mb: 1 }}>
            Client Management System
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Client directory and CRM history features will be activated in future tickets on top of this authenticated tenant foundation.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Clients;
