import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
} from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  CheckCircle as CheckIcon,
  People as PeopleIcon,
  Badge as BadgeIcon,
  CreditCard as CreditCardIcon,
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import PageContainer from '../../components/layout/PageContainer';
import SummaryCard from '../../components/common/SummaryCard';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { useAuth } from '../../context/AuthContext';
import { usePermission } from '../../hooks/usePermission';
import { getDashboardSummary } from '../../services/dashboard.service';
import { ROUTES } from '../../constants/routes';

/**
 * Dynamic Permission-Driven Operational Dashboard
 * Renders live metrics and quick actions based strictly on dynamic user permissions.
 */
const Dashboard = () => {
  const { user } = useAuth();
  const { can, hasPermission } = usePermission();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getDashboardSummary();
      setSummary(data);
    } catch (err) {
      console.error('[Dashboard] Metrics load failed:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const companyLabel = user?.salon?.name || summary?.salonName || 'My Salon';
  const roleLabel = user?.role?.name || user?.role?.code || 'Staff';

  return (
    <PageContainer
      title={`Welcome back, ${user?.name || 'User'}`}
      subtitle={`${companyLabel} • ${roleLabel}`}
      action={
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {can('appointments', 'create') && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(ROUTES.APPOINTMENTS.value)}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '8px',
              }}
            >
              New Appointment
            </Button>
          )}
          {can('users', 'create') && (
            <Button
              variant="outlined"
              startIcon={<BadgeIcon />}
              onClick={() => navigate(ROUTES.USERS.value)}
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                borderColor: '#cbd5e1',
                color: '#334155',
              }}
            >
              Add User
            </Button>
          )}
        </Box>
      }
    >
      {isLoading ? (
        <LoadingState message="Loading live operational metrics..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchMetrics} />
      ) : (
        <Box>
          {/* Top Metric Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                title="Today's Appointments"
                value={summary?.todayAppointments ?? 0}
                icon="CalendarMonth"
                color="#6366f1"
                subtitle="Booked for today"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                title="Confirmed Bookings"
                value={summary?.confirmedAppointments ?? 0}
                icon="CheckCircle"
                color="#10b981"
                subtitle="Ready for service"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                title="Active Clients"
                value={summary?.activeClients ?? 0}
                icon="People"
                color="#f59e0b"
                subtitle="Total registered"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <SummaryCard
                title="Salon Users"
                value={summary?.staffCount ?? 1}
                icon="Badge"
                color="#ec4899"
                subtitle="Active accounts"
              />
            </Grid>
          </Grid>

          {/* Operational Module Cards */}
          <Grid container spacing={3}>
            {/* Quick Actions & Navigation Module */}
            <Grid item xs={12} md={8}>
              <Card sx={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', mb: 1 }}>
                    Quick Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Access your authorized operational modules:
                  </Typography>

                  <Grid container spacing={2}>
                    {can('appointments', 'view') && (
                      <Grid item xs={12} sm={6}>
                        <Card
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: '#6366f1', boxShadow: '0 4px 12px rgba(99,102,241,0.1)' },
                          }}
                          onClick={() => navigate(ROUTES.APPOINTMENTS.value)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <CalendarIcon sx={{ color: '#6366f1' }} />
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Appointments
                              </Typography>
                            </Box>
                            <ArrowForwardIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                          </Box>
                        </Card>
                      </Grid>
                    )}

                    {can('clients', 'view') && (
                      <Grid item xs={12} sm={6}>
                        <Card
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: '#10b981', boxShadow: '0 4px 12px rgba(16,185,129,0.1)' },
                          }}
                          onClick={() => navigate(ROUTES.CLIENTS.value)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <PeopleIcon sx={{ color: '#10b981' }} />
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Clients
                              </Typography>
                            </Box>
                            <ArrowForwardIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                          </Box>
                        </Card>
                      </Grid>
                    )}

                    {can('users', 'view') && (
                      <Grid item xs={12} sm={6}>
                        <Card
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: '#ec4899', boxShadow: '0 4px 12px rgba(236,72,153,0.1)' },
                          }}
                          onClick={() => navigate(ROUTES.USERS.value)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <BadgeIcon sx={{ color: '#ec4899' }} />
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Users & Staff
                              </Typography>
                            </Box>
                            <ArrowForwardIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                          </Box>
                        </Card>
                      </Grid>
                    )}

                    {can('roles', 'view') && (
                      <Grid item xs={12} sm={6}>
                        <Card
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: '#8b5cf6', boxShadow: '0 4px 12px rgba(139,92,246,0.1)' },
                          }}
                          onClick={() => navigate(ROUTES.ROLES.value)}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <SecurityIcon sx={{ color: '#8b5cf6' }} />
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Roles & Permissions
                              </Typography>
                            </Box>
                            <ArrowForwardIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                          </Box>
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Tenant & Permissions Status Card */}
            <Grid item xs={12} md={4}>
              <Card sx={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', mb: 2 }}>
                    Assigned Permissions
                  </Typography>
                  <Box sx={{ p: 2, borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', mb: 2.5 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block' }}>
                      ACTIVE ROLE
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                      {roleLabel}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Salon: {companyLabel}
                    </Typography>
                  </Box>

                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                    AVAILABLE MODULES ({user?.permissions?.length || 0})
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                    {can('users', 'view') && <Chip size="small" label="Users" />}
                    {can('roles', 'view') && <Chip size="small" label="Roles" />}
                    {can('appointments', 'view') && <Chip size="small" label="Appointments" />}
                    {can('clients', 'view') && <Chip size="small" label="Clients" />}
                    {can('subscription', 'view') && <Chip size="small" label="Subscription" />}
                    {can('plans', 'view') && <Chip size="small" label="Plans" />}
                    {can('companies', 'view') && <Chip size="small" label="Companies" />}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </PageContainer>
  );
};

export default Dashboard;
