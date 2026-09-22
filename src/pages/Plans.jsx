import React from 'react';
import { Box, Typography, Card, CardContent, Alert } from '@mui/material';
import { Layers as LayersIcon } from '@mui/icons-material';

const Plans = () => {
  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <LayersIcon sx={{ fontSize: 36, color: '#f59e0b' }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Subscription Plans
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Global tier configuration for multi-tenant salons
          </Typography>
        </Box>
      </Box>

      <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
        Platform Admin Area: Restricted strictly to <strong>SUPER_ADMIN</strong>.
      </Alert>

      <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#475569', mb: 1 }}>
            Plan Management Tier
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This module is reserved for platform administrators. Receptionists and Owners are forbidden from accessing
            plan configuration.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Plans;
