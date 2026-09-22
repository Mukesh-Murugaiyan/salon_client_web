import React from 'react';
import { Box, Typography, Card, CardContent, Alert } from '@mui/material';
import { CalendarMonth as CalendarIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Appointments = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <CalendarIcon sx={{ fontSize: 36, color: '#6366f1' }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Appointments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Salon calendar, booking management, and staff scheduling
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
            Appointment Scheduling Engine
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Foundation established in Ticket 1. Appointment booking, conflict detection, and calendar views will be
            implemented in subsequent tickets.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Appointments;
