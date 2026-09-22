import React from 'react';
import { Card, CardContent, Typography, Alert } from '@mui/material';
import PageContainer from '../components/layout/PageContainer';
import { useAuth } from '../context/AuthContext';

const Appointments = () => {
  const { user } = useAuth();

  return (
    <PageContainer
      title="Appointments"
      subtitle="Salon calendar, booking management, and staff scheduling"
    >
      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        Authorized Roles: <strong>OWNER</strong>, <strong>RECEPTIONIST</strong>. Scoped strictly to Salon ID:{' '}
        <code>{user?.salonId || 'Assigned Salon'}</code>.
      </Alert>

      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#475569', mb: 1 }}>
            Appointment Scheduling Module (Ticket 3)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Application shell and role-based navigation established in Ticket 2. Full calendar booking, staff assignment,
            and conflict resolution workflows will be implemented in subsequent tickets.
          </Typography>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default Appointments;
