import React from 'react';
import { Box, Typography, Card, CardContent, Alert } from '@mui/material';
import { CreditCard as CreditCardIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Subscriptions = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <CreditCardIcon sx={{ fontSize: 36, color: '#8b5cf6' }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Subscription & Invoicing
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user?.role === 'SUPER_ADMIN'
              ? 'Platform-wide subscription assignment, renewal, and revenue tracking'
              : 'Salon subscription status, quota usage, and payment history'}
          </Typography>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        Authorized Roles: <strong>SUPER_ADMIN</strong> and <strong>OWNER</strong> only.{' '}
        <span style={{ color: '#ef4444', fontWeight: 600 }}>RECEPTIONIST role is forbidden.</span>
      </Alert>

      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#475569', mb: 1 }}>
            Subscription Engine
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Subscription gating, quota management, and payment gateway integration will be handled in subsequent
            milestones.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Subscriptions;
