import React, { useState, useEffect, useCallback } from 'react';
import { Grid, Box, Chip, Typography, Paper } from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  CheckCircle as ConfirmedIcon,
  People as PeopleIcon,
  Badge as StaffIcon,
  CreditCard as SubscriptionIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import PageContainer from '../../components/layout/PageContainer';
import SummaryCard from '../../components/common/SummaryCard';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { getDashboardSummary } from '../../services/dashboard.service';
import { MESSAGES } from '../../constants/messages';

/**
 * Salon Owner Dashboard View
 * Displays real-time operational statistics and subscription tier status.
 */
const OwnerDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDashboardSummary();
      setSummary(response.data);
    } catch (err) {
      setError(err.response?.data?.message || MESSAGES.ERRORS.GENERIC);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  if (loading) {
    return (
      <PageContainer title="Salon Dashboard" subtitle="Loading metrics...">
        <LoadingState message={MESSAGES.LOADING.DASHBOARD} />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Salon Dashboard">
        <ErrorState message={error} onRetry={fetchSummary} />
      </PageContainer>
    );
  }

  const isSubscriptionActive = summary?.subscriptionStatus === 'ACTIVE';

  return (
    <PageContainer
      title={summary?.salonName || 'Salon Dashboard'}
      subtitle="Overview of your salon operations, clients, and today's schedule"
      actions={
        <Chip
          icon={<StoreIcon />}
          label={`Status: ${summary?.subscriptionStatus || 'ACTIVE'}`}
          color={isSubscriptionActive ? 'success' : 'warning'}
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      }
    >
      <Grid container spacing={3}>
        {/* Today's Appointments */}
        <Grid item xs={12} sm={6} md={2.4}>
          <SummaryCard
            label="Today's Appointments"
            value={summary?.todayAppointments ?? 0}
            icon={<CalendarIcon />}
            color="#6366f1"
            subtitle="Booked for today"
          />
        </Grid>

        {/* Confirmed Appointments */}
        <Grid item xs={12} sm={6} md={2.4}>
          <SummaryCard
            label="Confirmed Schedule"
            value={summary?.confirmedAppointments ?? 0}
            icon={<ConfirmedIcon />}
            color="#10b981"
            subtitle="Ready for service"
          />
        </Grid>

        {/* Active Clients */}
        <Grid item xs={12} sm={6} md={2.4}>
          <SummaryCard
            label="Active Clients"
            value={summary?.activeClients ?? 0}
            icon={<PeopleIcon />}
            color="#ec4899"
            subtitle="Registered in salon"
          />
        </Grid>

        {/* Staff Members */}
        <Grid item xs={12} sm={6} md={2.4}>
          <SummaryCard
            label="Staff Members"
            value={summary?.staffCount ?? 0}
            icon={<StaffIcon />}
            color="#8b5cf6"
            subtitle="Active accounts"
          />
        </Grid>

        {/* Subscription Tier */}
        <Grid item xs={12} sm={6} md={2.4}>
          <SummaryCard
            label="Subscription Status"
            value={summary?.subscriptionStatus || 'ACTIVE'}
            icon={<SubscriptionIcon />}
            color="#f59e0b"
            subtitle="Plan tier access"
          />
        </Grid>

        {/* Informational Guidance Banner */}
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
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#0f172a', mb: 1 }}>
              Operational Overview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All metrics above are populated live from your salon's database. As your front desk books appointments
              and onboards clients, this dashboard reflects real-time operational status.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default OwnerDashboard;
