import React, { useState, useEffect, useCallback } from 'react';
import { Grid, Box, Typography, Paper } from '@mui/material';
import {
  CalendarMonth as CalendarIcon,
  CheckCircle as ConfirmedIcon,
  People as PeopleIcon,
  Badge as StaffIcon,
} from '@mui/icons-material';
import PageContainer from '../../components/layout/PageContainer';
import SummaryCard from '../../components/common/SummaryCard';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { getDashboardSummary } from '../../services/dashboard.service';
import { MESSAGES } from '../../constants/messages';

/**
 * Front Desk Receptionist Dashboard View
 * Displays day-to-day front desk metrics without billing or subscription access.
 */
const ReceptionistDashboard = () => {
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
      <PageContainer title="Front Desk Dashboard" subtitle="Loading schedule...">
        <LoadingState message={MESSAGES.LOADING.DASHBOARD} />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Front Desk Dashboard">
        <ErrorState message={error} onRetry={fetchSummary} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={summary?.salonName || 'Front Desk Dashboard'}
      subtitle="Today's booking schedule, client visits, and team presence"
    >
      <Grid container spacing={3}>
        {/* Today's Appointments */}
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            label="Today's Appointments"
            value={summary?.todayAppointments ?? 0}
            icon={<CalendarIcon />}
            color="#6366f1"
            subtitle="Scheduled for today"
          />
        </Grid>

        {/* Confirmed Appointments */}
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            label="Confirmed Bookings"
            value={summary?.confirmedAppointments ?? 0}
            icon={<ConfirmedIcon />}
            color="#10b981"
            subtitle="Confirmed arrival"
          />
        </Grid>

        {/* Active Clients */}
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            label="Active Clients"
            value={summary?.activeClients ?? 0}
            icon={<PeopleIcon />}
            color="#ec4899"
            subtitle="Registered in directory"
          />
        </Grid>

        {/* Staff Members */}
        <Grid item xs={12} sm={6} md={3}>
          <SummaryCard
            label="Staff on Duty"
            value={summary?.staffCount ?? 0}
            icon={<StaffIcon />}
            color="#8b5cf6"
            subtitle="Active accounts"
          />
        </Grid>

        {/* Daily Schedule Notice */}
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
              Front Desk Operations Notice
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome to today's shift! Ensure all clients are greeted and checked into the appointment calendar.
              Administrative billing and subscription plans are managed by your salon owner.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default ReceptionistDashboard;
