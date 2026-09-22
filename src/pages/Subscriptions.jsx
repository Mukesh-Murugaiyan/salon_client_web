import React from 'react';
import { Card, CardContent, Typography, Alert } from '@mui/material';
import PageContainer from '../components/layout/PageContainer';
import { useAuth } from '../context/AuthContext';
import { isSuperAdmin } from '../utils/role.utils';

const Subscriptions = () => {
  const { user } = useAuth();
  const isAdmin = isSuperAdmin(user?.role);

  return (
    <PageContainer
      title="Subscriptions & Invoicing"
      subtitle={
        isAdmin
          ? 'Platform-wide subscription assignment, renewal history, and billing'
          : 'Salon subscription status, quota usage, and invoice receipts'
      }
    >
      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        Authorized Roles: <strong>SUPER_ADMIN</strong> and <strong>OWNER</strong> only.{' '}
        <span style={{ color: '#ef4444', fontWeight: 600 }}>RECEPTIONIST is strictly forbidden.</span>
      </Alert>

      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#475569', mb: 1 }}>
            Subscription Billing & Gating Module
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Payment gateway webhooks, automated subscription renewals, and feature gating will be activated in subsequent
            milestones.
          </Typography>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default Subscriptions;
