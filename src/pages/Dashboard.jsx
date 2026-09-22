import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Paper,
  Divider,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Store as StoreIcon,
  AccountCircle as AccountIcon,
  VerifiedUser as VerifiedIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Salon ERP Multi-Tenant Portal — Ticket 1 Auth & RBAC Foundation
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* User Identity Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <AccountIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Authenticated User Identity
                </Typography>
              </Box>
              <Divider sx={{ mb: 2.5 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Full Name
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user?.name}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Email Address
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user?.email}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Assigned Role
                  </Typography>
                  <Chip
                    label={user?.role}
                    size="small"
                    color={user?.role === 'SUPER_ADMIN' ? 'error' : user?.role === 'OWNER' ? 'primary' : 'secondary'}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    User ID
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#64748b' }}>
                    {user?.id}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tenant Scope Card */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <StoreIcon color="secondary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Tenant Isolation Context
                </Typography>
              </Box>
              <Divider sx={{ mb: 2.5 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Tenant Mode
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {user?.role === 'SUPER_ADMIN' ? 'Cross-Tenant Platform Admin' : 'Single Salon Tenant'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Authoritative Salon ID
                  </Typography>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#64748b' }}>
                    {user?.salonId || 'NULL (Global Platform)'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Isolation Enforcement
                  </Typography>
                  <Chip
                    icon={<VerifiedIcon />}
                    label="Server-Authoritative"
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Security Summary Banner */}
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <SecurityIcon sx={{ color: '#6366f1' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Architecture & Security Verification Status
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Ticket 1 enforces strict server-authoritative RBAC. Navigation links and frontend views are tailored for UX,
              while the Express backend middleware rigorously validates every request against database state and rejects tenant spoofing.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              <Chip label="Bcrypt 12 Salt Rounds" size="small" variant="outlined" />
              <Chip label="Stateless JWT" size="small" variant="outlined" />
              <Chip label="Zero-Trust salonId" size="small" variant="outlined" />
              <Chip label="No Password Hash In Responses" size="small" variant="outlined" />
              <Chip label="Inactive User Gate" size="small" variant="outlined" />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
