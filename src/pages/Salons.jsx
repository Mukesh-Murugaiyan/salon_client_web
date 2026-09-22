import React from 'react';
import { Box, Typography, Card, CardContent, Alert } from '@mui/material';
import { Storefront as StorefrontIcon } from '@mui/icons-material';

const Salons = () => {
  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <StorefrontIcon sx={{ fontSize: 36, color: '#10b981' }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Salons Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Onboard, inspect and configure salon tenants across the platform
          </Typography>
        </Box>
      </Box>

      <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
        Platform Admin Area: Restricted strictly to <strong>SUPER_ADMIN</strong>.
      </Alert>

      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#475569', mb: 1 }}>
            Salon Directory & Tenant Provisioning
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Multi-tenant provisioning and management controls reserved for Platform Super Admins.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Salons;
