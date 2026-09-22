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
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Layers as LayersIcon,
  AttachMoney as AttachMoneyIcon,
  CalendarToday as CalendarIcon,
  People as PeopleIcon,
  EventNote as EventNoteIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import PageContainer from '../components/layout/PageContainer';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { usePermission } from '../hooks/usePermission';
import { plansApi } from '../api/plansApi';

const Plans = () => {
  const { can } = usePermission();

  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  // Dialog State: Create / Edit
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 49.99,
    durationInDays: 30,
    maxStaff: 5,
    maxAppointments: 100,
    isActive: true,
  });
  const [dialogError, setDialogError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog State: View Details
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingPlan, setViewingPlan] = useState(null);

  // Dialog State: Deactivate Confirmation
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [targetPlan, setTargetPlan] = useState(null);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await plansApi.listPlans();
      setPlans(res.plans || []);
    } catch (err) {
      console.error('[Plans] Fetch failed:', err);
      setError(err.response?.data?.message || 'Failed to load subscription plans.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Open Create Dialog
  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      description: '',
      price: 49.99,
      durationInDays: 30,
      maxStaff: 5,
      maxAppointments: 100,
      isActive: true,
    });
    setDialogError('');
    setDialogOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      price: plan.price,
      durationInDays: plan.durationInDays,
      maxStaff: plan.maxStaff,
      maxAppointments: plan.maxAppointments,
      isActive: plan.isActive,
    });
    setDialogError('');
    setDialogOpen(true);
  };

  // Open View Dialog
  const handleOpenView = (plan) => {
    setViewingPlan(plan);
    setViewDialogOpen(true);
  };

  // Open Deactivate Dialog
  const handleOpenDeactivate = (plan) => {
    setTargetPlan(plan);
    setDeactivateDialogOpen(true);
  };

  // Submit Create / Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setDialogError('');

    if (!formData.name.trim()) {
      setDialogError('Plan name is required.');
      return;
    }

    const price = Number(formData.price);
    if (isNaN(price) || price < 0) {
      setDialogError('Price must be a valid non-negative number.');
      return;
    }

    const duration = Number(formData.durationInDays);
    if (isNaN(duration) || duration < 1) {
      setDialogError('Duration in days must be at least 1.');
      return;
    }

    const maxStaff = Number(formData.maxStaff);
    if (isNaN(maxStaff) || maxStaff < 1) {
      setDialogError('Max staff limit must be at least 1.');
      return;
    }

    const maxAppointments = Number(formData.maxAppointments);
    if (isNaN(maxAppointments) || maxAppointments < 1) {
      setDialogError('Max appointments limit must be at least 1.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price,
        durationInDays: duration,
        maxStaff,
        maxAppointments,
        isActive: formData.isActive,
      };

      if (editingPlan) {
        await plansApi.updatePlan(editingPlan.id, payload);
        setActionSuccess(`Plan '${payload.name}' updated successfully.`);
      } else {
        await plansApi.createPlan(payload);
        setActionSuccess(`Plan '${payload.name}' created successfully.`);
      }

      setDialogOpen(false);
      await fetchPlans();
    } catch (err) {
      console.error('[Plans] Submit error:', err);
      setDialogError(err.response?.data?.message || 'Failed to save plan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (plan) => {
    try {
      await plansApi.updatePlan(plan.id, { isActive: !plan.isActive });
      setActionSuccess(`Plan '${plan.name}' is now ${!plan.isActive ? 'Active' : 'Inactive'}.`);
      await fetchPlans();
    } catch (err) {
      console.error('[Plans] Status toggle failed:', err);
      setError(err.response?.data?.message || 'Failed to update plan status.');
    }
  };

  // Confirm Deactivate
  const handleConfirmDeactivate = async () => {
    if (!targetPlan) return;
    setIsDeactivating(true);
    try {
      await plansApi.deletePlan(targetPlan.id);
      setActionSuccess(`Plan '${targetPlan.name}' deactivated successfully.`);
      setDeactivateDialogOpen(false);
      setTargetPlan(null);
      await fetchPlans();
    } catch (err) {
      console.error('[Plans] Deactivate failed:', err);
      setError(err.response?.data?.message || 'Failed to deactivate plan.');
    } finally {
      setIsDeactivating(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading subscription plans..." />;
  }

  if (error && plans.length === 0) {
    return (
      <PageContainer title="Subscription Plans" subtitle="Configure SaaS subscription plans, limits, and pricing tiers">
        <ErrorState message={error} onRetry={fetchPlans} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Subscription Plans"
      subtitle="Configure SaaS subscription plans, limits, and pricing tiers"
      actions={
        can('plans', 'create') && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{ textTransform: 'none', fontWeight: 600, px: 2.5 }}
          >
            Create Plan
          </Button>
        )
      }
    >
      {actionSuccess && (
        <Alert severity="success" onClose={() => setActionSuccess('')} sx={{ mb: 3 }}>
          {actionSuccess}
        </Alert>
      )}

      {/* Plans Directory Card */}
      <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        {plans.length === 0 ? (
          <EmptyState
            title="No Plans Created"
            description="No subscription plans are available in the system yet. Create the first plan above."
            action={
              can('plans', 'create') ? (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreate}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Create First Plan
                </Button>
              ) : null
            }
          />
        ) : (
          <TableContainer sx={{ overflowX: 'auto', width: '100%' }}>
            <Table sx={{ minWidth: 700 }}>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Plan Tier</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Staff Limit</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Appointment Limit</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plans.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            bgcolor: p.isActive ? 'primary.light' : 'grey.200',
                            color: p.isActive ? 'primary.main' : 'text.disabled',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <LayersIcon fontSize="small" />
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={700} color="text.primary">
                            {p.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {p.description || 'Standard plan'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="primary.main">
                        ${Number(p.price).toFixed(2)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarIcon fontSize="inherit" color="action" />
                        <Typography variant="body2" fontWeight={500}>
                          {p.durationInDays} days
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PeopleIcon fontSize="inherit" color="action" />
                        <Typography variant="body2" fontWeight={600}>
                          Up to {p.maxStaff}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <EventNoteIcon fontSize="inherit" color="action" />
                        <Typography variant="body2" fontWeight={600}>
                          Up to {p.maxAppointments}
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={p.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={p.isActive ? 'success' : 'default'}
                        variant={p.isActive ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        <Tooltip title="View Plan Details">
                          <IconButton size="small" onClick={() => handleOpenView(p)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {can('plans', 'update') && (
                          <Tooltip title="Edit Plan">
                            <IconButton size="small" onClick={() => handleOpenEdit(p)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {can('plans', 'update') && (
                          <Tooltip title={p.isActive ? 'Deactivate Plan' : 'Activate Plan'}>
                            <Switch
                              size="small"
                              checked={p.isActive}
                              onChange={() => handleToggleStatus(p)}
                              color="success"
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* Modal: Create / Edit Plan */}
      <Dialog open={dialogOpen} onClose={() => !isSubmitting && setDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editingPlan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
          </DialogTitle>
          <DialogContent dividers>
            {dialogError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {dialogError}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              <TextField
                label="Plan Name"
                required
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Growth Tier, Boutique Studio, Enterprise"
              />

              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Target salon size, included features and support..."
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Price ($)"
                  type="number"
                  required
                  fullWidth
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                />

                <TextField
                  label="Duration (Days)"
                  type="number"
                  required
                  fullWidth
                  value={formData.durationInDays}
                  onChange={(e) => setFormData({ ...formData, durationInDays: e.target.value })}
                  inputProps={{ min: 1 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">days</InputAdornment>,
                  }}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Max Staff Limit"
                  type="number"
                  required
                  fullWidth
                  value={formData.maxStaff}
                  onChange={(e) => setFormData({ ...formData, maxStaff: e.target.value })}
                  inputProps={{ min: 1 }}
                  helperText="Maximum concurrent active stylists/staff"
                />

                <TextField
                  label="Max Appointments Limit"
                  type="number"
                  required
                  fullWidth
                  value={formData.maxAppointments}
                  onChange={(e) => setFormData({ ...formData, maxAppointments: e.target.value })}
                  inputProps={{ min: 1 }}
                  helperText="Max bookings allowed per billing cycle"
                />
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    color="primary"
                  />
                }
                label="Plan is active and available for salon assignment"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 2, py: 1.25 }}>
            <Button onClick={() => setDialogOpen(false)} disabled={isSubmitting} sx={{ textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting && <CircularProgress size={18} color="inherit" />}
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              {isSubmitting ? 'Saving...' : editingPlan ? 'Save Changes' : 'Create Plan'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal: View Plan Details */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="xs" fullWidth>
        {viewingPlan && (
          <>
            <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <LayersIcon color="primary" />
              Plan Details
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Plan Name
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {viewingPlan.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {viewingPlan.description || 'No description provided.'}
                  </Typography>
                </Box>

                <Divider />

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Price
                    </Typography>
                    <Typography variant="body1" fontWeight={700} color="primary.main">
                      ${Number(viewingPlan.price).toFixed(2)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Duration
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {viewingPlan.durationInDays} days
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Max Staff Limit
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {viewingPlan.maxStaff} staff
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Max Appointments
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {viewingPlan.maxAppointments} bookings
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={viewingPlan.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={viewingPlan.isActive ? 'success' : 'default'}
                      variant={viewingPlan.isActive ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 2, py: 1.25 }}>
              <Button onClick={() => setViewDialogOpen(false)} sx={{ textTransform: 'none' }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Modal: Deactivate Confirmation */}
      <Dialog open={deactivateDialogOpen} onClose={() => !isDeactivating && setDeactivateDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Deactivate Plan?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ pt: 1 }}>
            Are you sure you want to deactivate <strong>{targetPlan?.name}</strong>? It will no longer be available for salons to select.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.25 }}>
          <Button onClick={() => setDeactivateDialogOpen(false)} disabled={isDeactivating} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDeactivate}
            disabled={isDeactivating}
            startIcon={isDeactivating && <CircularProgress size={18} color="inherit" />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {isDeactivating ? 'Deactivating...' : 'Deactivate'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default Plans;
