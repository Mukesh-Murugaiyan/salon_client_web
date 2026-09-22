import React from 'react';
import { Card, CardContent, Typography, Alert } from '@mui/material';
import PageContainer from '../components/layout/PageContainer';

const Salons = () => {
  return (
    <PageContainer
      title="Salons Management"
      subtitle="Onboard, configure, and inspect salon tenants across the platform"
    >
      <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
        Platform Admin Area: Restricted strictly to <strong>SUPER_ADMIN</strong>.
      </Alert>

      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#475569', mb: 1 }}>
            Multi-Tenant Salon Provisioning
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Global tenant provisioning and branch management module reserved for platform administrators.
          </Typography>
        </CardContent>
      </Card>
    </PageContainer>
  );
};

export default Salons;
