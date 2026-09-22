import React, { useState, useEffect, useCallback } from 'react';
import { Grid, Typography, Paper } from '@mui/material';
import {
  Storefront as SalonIcon,
  CheckCircle as ActiveIcon,
  Warning as ExpiredIcon,
  Layers as PlanIcon,
  People as UserIcon,
} from '@mui/icons-material';
import PageContainer from '../../components/layout/PageContainer';
import SummaryCard from '../../components/common/SummaryCard';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { getAdminDashboardSummary } from '../../services/dashboard.service';
import { MESSAGES } from '../../constants/messages';

/**
 * Super Admin Platform Dashboard View
 * Displays platform-wide operational statistics and tenant counts.
 */
const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAdminDashboardSummary();
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
      <PageContainer title="Platform Administration" subtitle="Loading metrics...">
        <LoadingState message={MESSAGES.LOADING.ADMIN_DASHBOARD} />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Platform Administration">
        <ErrorState message={error} onRetry={fetchSummary} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Platform Overview"
      subtitle="Cross-tenant administration, salon subscriptions, and SaaS plan metrics"
    >
      <Grid container spacing={3}>
        {/* Total Salons */}
        <Grid item xs={12} sm={6} md={2.4}>
          <SummaryCard
            label="Total Salons"
            value={summary?.totalSalons ?? 0}
            icon={<SalonIcon />}
            color="#6366f1"
            subtitle="Registered tenants"
          />
        </Grid>

        {/* Active Subscriptions */}
        <Grid item xs={12} sm={6} md={2.4}>
          <SummaryCard
            label="Active Subscriptions"
            value={summary?.activeSubscriptions ?? 0}
            icon={<ActiveIcon />}
            color="#10b981"
            subtitle="Current active tiers"
          />
        </Grid>

        {/* Expired Subscriptions */}
        <Grid item xs={12} sm={6} md={2.4}>
          <SummaryCard
            label="Expired Subscriptions"
            value={summary?.expiredSubscriptions ?? 0}
            icon={<ExpiredIcon />}
            color="#ef4444"
            subtitle="Needs renewal"
          />
        </Grid>

        {/* Available Plans */}
        <Grid item xs={12} sm={6} md={2.4}>
          <SummaryCard
            label="Available Plans"
            value={summary?.totalPlans ?? 0}
            icon={<PlanIcon />}
            color="#f59e0b"
            subtitle="Active SaaS tiers"
          />
        </Grid>

        {/* Total Users */}
        <Grid item xs={12} sm={6} md={2.4}>
          <SummaryCard
            label="Platform Users"
            value={summary?.totalUsers ?? 0}
            icon={<UserIcon />}
            color="#8b5cf6"
            subtitle="Global accounts"
          />
        </Grid>

        {/* Admin Architecture Card */}
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
              Platform Super Admin Controls
            </Typography>
            <Typography variant="body2" color="text.secondary">
              As a global administrator, you have access to cross-tenant provisioning, subscription assignments, and
              plan tier definitions. Data metrics are queried live from MongoDB across all active salons.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default AdminDashboard;
