import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  LinearProgress,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
  Upgrade as UpgradeIcon,
  Autorenew as AutorenewIcon,
  CheckCircle as CheckCircleIcon,
  WarningAmber as WarningIcon,
  People as PeopleIcon,
  EventNote as EventNoteIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import PageContainer from '../components/layout/PageContainer';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { usePermission } from '../hooks/usePermission';
import { subscriptionApi } from '../api/subscriptionApi';
import { plansApi } from '../api/plansApi';
import salonsApi from '../api/salonsApi';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const Subscriptions = () => {
  const { can, user } = usePermission();
  const isSuperAdmin = !user?.salonId;

  const [subscription, setSubscription] = useState(null);
  const [history, setHistory] = useState([]);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [currentTab, setCurrentTab] = useState(0);

  // Dialog State: Assign / Upgrade Plan
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [planDialogError, setPlanDialogError] = useState('');

  // Dialog State: Renew
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);

  // Super Admin Selector State
  const [allSalons, setAllSalons] = useState([]);
  const [selectedContextSalonId, setSelectedContextSalonId] = useState('');

  const fetchSubscriptionData = useCallback(async (salonIdOverride) => {
    if (isSuperAdmin && !salonIdOverride) {
      setIsLoading(false);
      setSubscription(null);
      setHistory([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [subRes, historyRes, plansRes] = await Promise.all([
        subscriptionApi.getCurrentSubscription(salonIdOverride),
        subscriptionApi.getSubscriptionHistory(salonIdOverride).catch(() => ({ history: [] })),
        plansApi.listPlans({ isActive: true }).catch(() => ({ plans: [] })),
      ]);

      setSubscription(subRes.subscription);
      setHistory(historyRes.history || []);
      setAvailablePlans(plansRes.plans || []);
      if (plansRes.plans?.length > 0) {
        setSelectedPlanId(plansRes.plans[0].id || plansRes.plans[0]._id);
      }
    } catch (err) {
      console.error('[Subscriptions] Load failed:', err);
      setError(err.response?.data?.message || 'Failed to load subscription details.');
    } finally {
      setIsLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (isSuperAdmin) {
      salonsApi.listSalons({ limit: 100 })
        .then(res => setAllSalons(res.salons || []))
        .catch(err => console.error('[Subscriptions] Failed to load salons', err));
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    fetchSubscriptionData(selectedContextSalonId);
  }, [fetchSubscriptionData, selectedContextSalonId]);

  // Open Assign / Upgrade Modal
  const handleOpenPlanModal = () => {
    setPlanDialogError('');
    if (subscription?.plan?.id) {
      setSelectedPlanId(subscription.plan.id);
    } else if (availablePlans.length > 0) {
      setSelectedPlanId(availablePlans[0].id || availablePlans[0]._id);
    }
    setPlanDialogOpen(true);
  };

  // Submit Assign / Upgrade
  const handleConfirmPlanChange = async () => {
    if (!selectedPlanId) {
      setPlanDialogError('Please select a plan.');
      return;
    }

    setIsUpgrading(true);
    setPlanDialogError('');
    try {
      if (subscription?.plan) {
        await subscriptionApi.upgradePlan(selectedPlanId, selectedContextSalonId);
        setActionSuccess('Plan upgraded successfully.');
      } else {
        await subscriptionApi.assignPlan(selectedPlanId, selectedContextSalonId);
        setActionSuccess('Plan assigned successfully.');
      }

      setPlanDialogOpen(false);
      await fetchSubscriptionData(selectedContextSalonId);
    } catch (err) {
      console.error('[Subscriptions] Plan change error:', err);
      setPlanDialogError(err.response?.data?.message || 'Failed to update plan.');
    } finally {
      setIsUpgrading(false);
    }
  };

  // Submit Renew
  const handleConfirmRenew = async () => {
    setIsRenewing(true);
    try {
      await subscriptionApi.renewSubscription(selectedContextSalonId);
      setActionSuccess('Subscription renewed successfully for another billing cycle.');
      setRenewDialogOpen(false);
      await fetchSubscriptionData(selectedContextSalonId);
    } catch (err) {
      console.error('[Subscriptions] Renew error:', err);
      setError(err.response?.data?.message || 'Failed to renew subscription.');
    } finally {
      setIsRenewing(false);
    }
  };

  const handleRemovePlan = async () => {
    if (!window.confirm('Are you sure you want to completely remove this subscription plan? This will immediately revoke access and expire the status.')) return;

    setIsLoading(true);
    try {
      await subscriptionApi.removePlan(selectedContextSalonId);
      setActionSuccess('Subscription plan removed successfully.');
      await fetchSubscriptionData(selectedContextSalonId);
    } catch (err) {
      console.error('[Subscriptions] Remove error:', err);
      setError(err.response?.data?.message || 'Failed to remove subscription.');
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading salon subscription status..." />;
  }

  if (error && !subscription) {
    return (
      <PageContainer title="Subscription & Billing" subtitle="Manage salon plan tier, renewals, and quota limits">
        <ErrorState message={error} onRetry={fetchSubscriptionData} />
      </PageContainer>
    );
  }

  const isExpired = subscription?.status === 'EXPIRED' || subscription?.isExpired;
  const staffUsagePercent =
    subscription?.usage?.maxStaff > 0
      ? Math.min(100, Math.round((subscription.usage.staffCount / subscription.usage.maxStaff) * 100))
      : 0;

  const appUsagePercent =
    subscription?.usage?.maxAppointments > 0
      ? Math.min(
        100,
        Math.round((subscription.usage.appointmentsCount / subscription.usage.maxAppointments) * 100)
      )
      : 0;

  return (
    <PageContainer
      title="Subscription Management"
      subtitle="Salon subscription status, quota usage, renewals, and plan management"
      actions={
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {subscription?.plan && can('subscription', 'renew') && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<AutorenewIcon />}
              onClick={() => setRenewDialogOpen(true)}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Renew Plan
            </Button>
          )}

          {subscription?.plan && isSuperAdmin && (
            <Button
              variant="outlined"
              color="error"
              onClick={handleRemovePlan}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Remove Plan
            </Button>
          )}

          {(can('subscription', 'assign') || can('subscription', 'upgrade')) && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<UpgradeIcon />}
              onClick={handleOpenPlanModal}
              disabled={availablePlans.length === 0}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {subscription?.plan ? 'Change / Upgrade Plan' : 'Assign Plan'}
            </Button>
          )}
        </Box>
      }
    >
      {isSuperAdmin && (
        <Card sx={{ p: 2, mb: 3, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Select Salon Context</InputLabel>
            <Select
              value={selectedContextSalonId}
              label="Select Salon Context"
              onChange={(e) => setSelectedContextSalonId(e.target.value)}
            >
              <MenuItem value="" disabled>Select a Salon...</MenuItem>
              {allSalons.map(s => (
                <MenuItem key={s.id || s._id} value={s.id || s._id}>
                  {s.name} ({s.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Card>
      )}

      {isSuperAdmin && !selectedContextSalonId && (
        <EmptyState
          title="No Salon Selected"
          description="Please select a salon from the dropdown above to view and manage its subscription."
        />
      )}

      {(selectedContextSalonId || !isSuperAdmin) && (
        <>
          {/* Action Success Alert */}
          {actionSuccess && (
            <Alert severity="success" onClose={() => setActionSuccess('')} sx={{ mb: 3 }}>
              {actionSuccess}
            </Alert>
          )}

          {/* Expired Subscription Warning Banner */}
          {isExpired && (
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: 2 }}
              action={
                (can('subscription', 'renew') || can('subscription', 'upgrade')) && (
                  <Button
                    color="inherit"
                    size="small"
                    variant="outlined"
                    onClick={subscription?.plan ? () => setRenewDialogOpen(true) : handleOpenPlanModal}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    {subscription?.plan ? 'Renew Now' : 'Select Plan'}
                  </Button>
                )
              }
            >
              <strong>Your subscription is currently EXPIRED.</strong> Gated actions such as registering new staff or booking appointments are blocked until your plan is renewed.
            </Alert>
          )}

          {/* Main Subscription Overview Card */}
          <Card sx={{ p: { xs: 2, sm: 2.5 }, mb: 2.5, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
                gap: 1.5,
                mb: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: isExpired ? 'error.light' : 'primary.light',
                    color: isExpired ? 'error.main' : 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CreditCardIcon sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                      {subscription?.plan?.name || 'No Active Plan Assigned'}
                    </Typography>
                    <Chip
                      size="small"
                      label={subscription?.status || 'EXPIRED'}
                      color={isExpired ? 'error' : 'success'}
                      sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Salon: <strong>{subscription?.salonName}</strong>
                  </Typography>
                </Box>
              </Box>

              {subscription?.plan && (
                <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                  <Typography variant="h6" fontWeight={800} color="primary.main" sx={{ fontSize: { xs: '1.2rem', sm: '1.35rem' } }}>
                    ${Number(subscription.plan.price).toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    per {subscription.plan.durationInDays} days billing cycle
                  </Typography>
                </Box>
              )}
            </Box>

            <Divider sx={{ my: 1.5 }} />

            {/* Schedule & Duration Info */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Cycle Start Date
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {subscription?.startDate
                    ? new Date(subscription.startDate).toLocaleDateString()
                    : 'Not Started'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Cycle End Date
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {subscription?.endDate
                    ? new Date(subscription.endDate).toLocaleDateString()
                    : 'Not Set'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  Remaining Duration
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color={isExpired ? 'error.main' : 'success.main'}
                >
                  {isExpired ? '0 days (Expired)' : `${subscription?.daysRemaining || 0} days left`}
                </Typography>
              </Box>
            </Box>
          </Card>

          {/* Live Quota Usage Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: { xs: 1.5, sm: 2 }, mb: 3 }}>
            {/* Staff Quota */}
            <Card sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.25 }}>
                <PeopleIcon color="primary" fontSize="small" />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.85rem' }}>
                    Staff Member Quota
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Active stylists and service specialists
                  </Typography>
                </Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {subscription?.usage?.staffCount || 0} / {subscription?.usage?.maxStaff || 0}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={staffUsagePercent}
                color={staffUsagePercent >= 100 ? 'error' : staffUsagePercent >= 80 ? 'warning' : 'primary'}
                sx={{ height: 6, borderRadius: 3, mb: 0.75 }}
              />
              <Typography variant="caption" color="text.secondary">
                {staffUsagePercent}% of plan limit utilized
              </Typography>
            </Card>

            {/* Appointments Quota */}
            <Card sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1.25 }}>
                <EventNoteIcon color="secondary" fontSize="small" />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: '0.85rem' }}>
                    Appointments Quota
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Bookings scheduled in current billing cycle
                  </Typography>
                </Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {subscription?.usage?.appointmentsCount || 0} / {subscription?.usage?.maxAppointments || 0}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={appUsagePercent}
                color={appUsagePercent >= 100 ? 'error' : appUsagePercent >= 80 ? 'warning' : 'secondary'}
                sx={{ height: 6, borderRadius: 3, mb: 0.75 }}
              />
              <Typography variant="caption" color="text.secondary">
                {appUsagePercent}% of cycle bookings utilized
              </Typography>
            </Card>
          </Box>

          {/* Subscription History Tab Container */}
          {can('subscription', 'history') && <Card sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
              <Tabs value={currentTab} onChange={(e, val) => setCurrentTab(val)}>
                <Tab
                  icon={<HistoryIcon fontSize="small" />}
                  iconPosition="start"
                  label={`Subscription Audit History (${history.length})`}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                />
              </Tabs>
            </Box>

            {history.length === 0 ? (
              <EmptyState
                title="No Subscription History"
                description="No subscription assignments or renewals have occurred yet for this salon."
              />
            ) : (
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead sx={{ bgcolor: 'grey.50' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Plan Tier</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Date Coverage</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Audit Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.map((h) => (
                      <TableRow key={h.id} hover>
                        <TableCell>
                          <Chip
                            label={h.action}
                            size="small"
                            color={
                              h.action === 'UPGRADE'
                                ? 'primary'
                                : h.action === 'RENEW'
                                  ? 'success'
                                  : 'default'
                            }
                            sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {h.plan?.name || 'Standard Tier'}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" fontWeight={700} color="primary.main">
                            ${Number(h.price).toFixed(2)}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(h.startDate).toLocaleDateString()} – {new Date(h.endDate).toLocaleDateString()}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(h.createdAt).toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Card>}

          {/* Modal: Assign / Upgrade Plan */}
          <Dialog open={planDialogOpen} onClose={() => !isUpgrading && setPlanDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>
              {subscription?.plan ? 'Upgrade / Switch Subscription Plan' : 'Assign Salon Subscription Plan'}
            </DialogTitle>
            <DialogContent dividers>
              {planDialogError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {planDialogError}
                </Alert>
              )}

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select a plan tier below. Your salon limits and billing cycle duration will immediately update upon confirmation:
              </Typography>

              <RadioGroup
                value={selectedPlanId}
                onChange={(e) => setSelectedPlanId(e.target.value)}
              >
                {availablePlans.map((p) => (
                  <Card
                    key={p.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      mb: 1.5,
                      borderRadius: 2,
                      borderColor: selectedPlanId === p.id ? 'primary.main' : 'divider',
                      bgcolor: selectedPlanId === p.id ? 'primary.light' : 'background.paper',
                      cursor: 'pointer',
                    }}
                    onClick={() => setSelectedPlanId(p.id)}
                  >
                    <FormControlLabel
                      value={p.id}
                      control={<Radio color="primary" />}
                      label={
                        <Box sx={{ ml: 1, width: '100%' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" fontWeight={700}>
                              {p.name}
                            </Typography>
                            <Typography variant="subtitle1" fontWeight={800} color="primary.main">
                              ${Number(p.price).toFixed(2)}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            {p.durationInDays} Days • Up to {p.maxStaff} Staff • Up to {p.maxAppointments} Appointments
                          </Typography>
                        </Box>
                      }
                      sx={{ width: '100%', m: 0 }}
                    />
                  </Card>
                ))}
              </RadioGroup>
            </DialogContent>
            <DialogActions sx={{ px: 2, py: 1.25 }}>
              <Button onClick={() => setPlanDialogOpen(false)} disabled={isUpgrading} sx={{ textTransform: 'none' }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleConfirmPlanChange}
                disabled={isUpgrading || !selectedPlanId}
                startIcon={isUpgrading && <CircularProgress size={18} color="inherit" />}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {isUpgrading ? 'Updating...' : subscription?.plan ? 'Confirm Upgrade' : 'Assign Plan'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Modal: Renew Confirmation */}
          <Dialog open={renewDialogOpen} onClose={() => !isRenewing && setRenewDialogOpen(false)} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>
              Renew Subscription?
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" sx={{ pt: 1 }}>
                Renewing will extend your current <strong>{subscription?.plan?.name}</strong> plan for another{' '}
                <strong>{subscription?.plan?.durationInDays} days</strong> at{' '}
                <strong>${Number(subscription?.plan?.price || 0).toFixed(2)}</strong>.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 2, py: 1.25 }}>
              <Button onClick={() => setRenewDialogOpen(false)} disabled={isRenewing} sx={{ textTransform: 'none' }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleConfirmRenew}
                disabled={isRenewing}
                startIcon={isRenewing && <CircularProgress size={18} color="inherit" />}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                {isRenewing ? 'Renewing...' : 'Confirm Renewal'}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </PageContainer>
  );
};

export default Subscriptions;
