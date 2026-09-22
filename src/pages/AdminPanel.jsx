import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Alert } from '@mui/material';
import { AdminPanelSettings as AdminIcon } from '@mui/icons-material';

const AdminPanel = () => {
  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <AdminIcon sx={{ fontSize: 36, color: '#ef4444' }} />
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a' }}>
            Platform Super Admin Console
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Global salon management, subscription plan definitions, and platform configurations
          </Typography>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        Only authenticated <strong>SUPER_ADMIN</strong> users can access this console.
      </Alert>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Plans Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure SaaS pricing tiers, monthly limits, and add-on features for salons.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Salons Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Onboard new salons, configure branches, manage tenant domains and active status.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Subscriptions & Billing
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Assign and renew subscriptions, review audit history, and monitor revenue.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminPanel;
