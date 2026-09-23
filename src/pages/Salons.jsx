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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  Storefront as StorefrontIcon,
  MyLocation as MyLocationIcon,
} from '@mui/icons-material';
import PageContainer from '../components/layout/PageContainer';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { usePermission } from '../hooks/usePermission';
import salonsApi from '../api/salonsApi';
import { plansApi } from '../api/plansApi';

const Salons = () => {
  const { can } = usePermission();

  const [salons, setSalons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSalon, setEditingSalon] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    email: '',
    phone: '',
    address: '',
    allowedRadiusInMeters: 100,
    openingTime: "",
    closingTime: "",
    isActive: true,
  });
  const [dialogError, setDialogError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  // Subscription Modals State
  const [availablePlans, setAvailablePlans] = useState([]);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [planStartDate, setPlanStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAssigningPlan, setIsAssigningPlan] = useState(false);
  const [planDialogError, setPlanDialogError] = useState('');

  const fetchSalons = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await salonsApi.listSalons({ search: searchQuery });
      setSalons(res.salons || []);
    } catch (err) {
      console.error('[Salons] Failed to load salons:', err);
      setError(err.response?.data?.message || 'Failed to load salons.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchSalons();

    const fetchPlans = async () => {
      try {
        const res = await plansApi.listPlans({ isActive: true });
        setAvailablePlans(res.plans || []);
      } catch (err) {
        console.error('[Salons] Failed to load plans', err);
      }
    };
    if (can('salons', 'update')) {
      fetchPlans();
    }
  }, [fetchSalons, can]);

  const handleOpenCreate = () => {
    setEditingSalon(null);
    setFormData({
      name: '',
      code: '',
      email: '',
      phone: '',
      address: '',
      latitude: '',
      longitude: '',
      allowedRadiusInMeters: 100,
      openingTime: '',
      closingTime: '',
      isActive: true,
    });
    setDialogError('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (salon) => {
    setEditingSalon(salon);
    setFormData({
      name: salon.name,
      code: salon.code,
      email: salon.email || '',
      phone: salon.phone || '',
      address: salon.address || '',
      latitude: salon.latitude != null ? salon.latitude : '',
      longitude: salon.longitude != null ? salon.longitude : '',
      allowedRadiusInMeters: salon.allowedRadiusInMeters || 100,
      openingTime: salon.openingTime || '',
      closingTime: salon.closingTime || '',
      isActive: salon.isActive,
    });
    setDialogError('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSalon(null);
    setDialogError('');
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setDialogError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: String(pos.coords.latitude.toFixed(6)),
          longitude: String(pos.coords.longitude.toFixed(6)),
        }));
      },
      (err) => {
        setDialogError('Failed to retrieve current location: ' + err.message);
      },
      { enableHighAccuracy: true }
    );
  };
  console.log("formData------", formData)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setDialogError('');
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        code: formData.code.toUpperCase(),
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        latitude: formData.latitude ? formData.latitude : null,
        longitude: formData.longitude ? formData.longitude : null,
        allowedRadiusInMeters: Number(formData.allowedRadiusInMeters),
        openingTime: formData.openingTime,
        closingTime: formData.closingTime,
        isActive: formData.isActive,
      };

      if (editingSalon) {
        await salonsApi.updateSalon(editingSalon.id || editingSalon._id, payload);
        setActionSuccess(`Salon '${formData.name}' updated successfully.`);
      } else {
        await salonsApi.createSalon(payload);
        setActionSuccess(`Salon '${formData.name}' created successfully.`);
      }
      handleCloseDialog();
      fetchSalons();
    } catch (err) {
      console.error('[Salons] Save error:', err);
      setDialogError(err.response?.data?.message || 'Failed to save salon.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;

    if (!editingSalon) {
      const generatedCode = newName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');

      setFormData({ ...formData, name: newName, code: generatedCode });
    } else {
      setFormData({ ...formData, name: newName });
    }
  };

  const handleToggleStatus = async (salon) => {
    try {
      const newStatus = !salon.isActive;
      await salonsApi.toggleStatus(salon.id || salon._id, newStatus);
      setActionSuccess(`Salon '${salon.name}' is now ${newStatus ? 'active' : 'inactive'}.`);
      fetchSalons();
    } catch (err) {
      console.error('[Salons] Status toggle failed:', err);
      setError(err.response?.data?.message || 'Failed to change salon status.');
    }
  };

  const handleOpenPlanModal = () => {
    setPlanDialogError('');
    if (editingSalon?.currentPlanId) {
      setSelectedPlanId(editingSalon.currentPlanId.id || editingSalon.currentPlanId._id);
    } else if (availablePlans.length > 0) {
      setSelectedPlanId(availablePlans[0].id || availablePlans[0]._id);
    }
    setPlanStartDate(new Date().toISOString().split('T')[0]);
    setPlanDialogOpen(true);
  };

  const handleConfirmPlanChange = async () => {
    if (!selectedPlanId) {
      setPlanDialogError('Please select a plan.');
      return;
    }
    setIsAssigningPlan(true);
    setPlanDialogError('');
    try {
      await salonsApi.manageSubscription(editingSalon.id || editingSalon._id, {
        planId: selectedPlanId,
        startDate: planStartDate,
      });
      setActionSuccess('Subscription plan assigned successfully.');
      setPlanDialogOpen(false);

      const updated = await salonsApi.getSalon(editingSalon.id || editingSalon._id);
      setEditingSalon(updated.salon);
      fetchSalons();
    } catch (err) {
      console.error('[Salons] Plan assignment error:', err);
      setPlanDialogError(err.response?.data?.message || 'Failed to update plan.');
    } finally {
      setIsAssigningPlan(false);
    }
  };

  const handleRenewPlan = async () => {
    if (!window.confirm('Are you sure you want to renew this subscription?')) return;

    setIsAssigningPlan(true);
    setPlanDialogError('');
    try {
      await salonsApi.renewSubscription(editingSalon.id || editingSalon._id, {});
      setActionSuccess('Subscription renewed successfully.');

      const updated = await salonsApi.getSalon(editingSalon.id || editingSalon._id);
      setEditingSalon(updated.salon);
      fetchSalons();
    } catch (err) {
      console.error('[Salons] Plan renewal error:', err);
      setPlanDialogError(err.response?.data?.message || 'Failed to renew plan.');
    } finally {
      setIsAssigningPlan(false);
    }
  };

  const handleRemovePlan = async () => {
    if (!window.confirm('Are you sure you want to completely remove this salon\'s subscription plan? This will immediately revoke their access and expire their status.')) return;

    setIsSubmitting(true);
    setDialogError('');
    try {
      await salonsApi.removeSubscription(editingSalon.id || editingSalon._id);
      setActionSuccess('Subscription plan removed successfully.');

      const updated = await salonsApi.getSalon(editingSalon.id || editingSalon._id);
      setEditingSalon(updated.salon);
      fetchSalons();
    } catch (err) {
      console.error('[Salons] Plan removal error:', err);
      setDialogError(err.response?.data?.message || 'Failed to remove plan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer
      title="Salons Management"
      subtitle="Onboard, configure, and inspect salon tenants across the platform"
      action={
        can('salons', 'create') && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '8px',
              px: 2.5,
              py: 1,
            }}
          >
            Create Salon
          </Button>
        )
      }
    >

      {actionSuccess && (
        <Alert severity="success" onClose={() => setActionSuccess('')} sx={{ mb: 3 }}>
          {actionSuccess}
        </Alert>
      )}

      {/* Search Bar */}
      <Box sx={{ mb: { xs: 2, sm: 2.5 }, display: 'flex', gap: 1.5 }}>
        <TextField
          placeholder="Search by name, code, or email..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: { xs: '100%', sm: 340 }, backgroundColor: '#ffffff' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {isLoading ? (
        <LoadingState message="Loading salons..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSalons} />
      ) : salons.length === 0 ? (
        <EmptyState
          title="No salons found"
          description={searchQuery ? 'No salons matching your search term.' : 'Get started by provisioning your first salon tenant.'}
          actionLabel={can('salons', 'create') && !searchQuery ? 'Create Salon' : undefined}
          onAction={handleOpenCreate}
        />
      ) : (
        <Card sx={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <TableContainer sx={{ overflowX: 'auto', width: '100%' }}>
            <Table sx={{ minWidth: 700 }}>
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Salon Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Created Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: '#475569' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salons.map((s) => (
                  <TableRow key={s.id || s._id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius: '8px',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            color: '#6366f1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <StorefrontIcon fontSize="small" />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {s.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#64748b', fontWeight: 600 }}>{s.code}</TableCell>
                    <TableCell sx={{ color: '#64748b' }}>{s.email || '—'}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={s.isActive ? 'Active' : 'Inactive'}
                        color={s.isActive ? 'success' : 'default'}
                        variant="outlined"
                        sx={{ fontWeight: 600, borderRadius: '6px' }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontSize: '0.8125rem' }}>
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                        {can('salons', 'update') && (
                          <Tooltip title="Edit Salon">
                            <IconButton size="small" onClick={() => handleOpenEdit(s)} sx={{ color: '#64748b' }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {can('salons', 'update') && (
                          <Tooltip title={s.isActive ? 'Deactivate Salon' : 'Activate Salon'}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleStatus(s)}
                              sx={{ color: s.isActive ? '#ef4444' : '#10b981' }}
                            >
                              {s.isActive ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Create / Edit Salon Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
            {editingSalon ? 'Edit Salon' : 'Provision New Salon Tenant'}
          </DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
            {dialogError && <Alert severity="error">{dialogError}</Alert>}

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Salon Name"
                required
                fullWidth
                value={formData.name}
                onChange={handleNameChange}
                placeholder="e.g. Elegance Studio"
              />
              <TextField
                label="Salon Code"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. ELEGANCE"
                helperText="Must be unique. Used for quick reference."
              />
            </Box>

            <TextField
              label="Contact Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="hello@elegance.com"
            />

            <TextField
              label="Contact Phone"
              fullWidth
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 000-0000"
            />

            <TextField
              label="Address"
              fullWidth
              multiline
              rows={2}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Salon Avenue, Suite 100"
            />

            <Box sx={{ p: 2, borderRadius: 2, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  Salon Geo-Fence Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.8125rem' }}>
                  Configure the physical GPS coordinates and allowable radius for this salon. Check-in requests beyond this radius are automatically rejected by the server Haversine formula.
                </Typography>
              </Box>

              <Button
                variant="outlined"
                size="small"
                startIcon={<MyLocationIcon />}
                onClick={handleUseCurrentLocation}
                sx={{ alignSelf: 'flex-start', textTransform: 'none', borderRadius: '8px', color: '#6366f1', borderColor: '#cbd5e1' }}
              >
                Use My Current Device Location
              </Button>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <TextField
                  label="Latitude (-90 to 90)"
                  required
                  fullWidth
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  inputProps={{ inputMode: 'decimal' }}
                  placeholder="e.g. 37.7749"
                />
                <TextField
                  label="Longitude (-180 to 180)"
                  required
                  fullWidth
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  inputProps={{ inputMode: 'decimal' }}
                  placeholder="e.g. -122.4194"
                />
              </Box>

              <TextField
                label="Allowed Radius (Meters)"
                type="number"
                required
                fullWidth
                value={formData.allowedRadiusInMeters}
                onChange={(e) => setFormData({ ...formData, allowedRadiusInMeters: e.target.value })}
                helperText="Maximum allowed distance between employee device and salon coordinates (e.g. 100 or 200m)."
                inputProps={{ min: 1 }}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField
                label="Opening Time"
                type="time"
                required
                fullWidth
                value={formData.openingTime}
                onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                helperText="Salon opens at this time"
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
              />
              <TextField
                label="Closing Time"
                type="time"
                required
                fullWidth
                value={formData.closingTime}
                onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                helperText="Salon closes at this time"
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
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
              label={formData.isActive ? 'Tenant Active' : 'Tenant Inactive'}
            />

            {editingSalon && (
              <Box sx={{ mt: 2, p: 2, borderRadius: 2, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#475569' }}>
                  Subscription Context
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Current Plan</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {editingSalon.currentPlanId?.name || 'NOT ASSIGNED'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Status</Typography>
                    <Typography variant="body2">
                      <Chip
                        size="small"
                        label={editingSalon.subscriptionStatus || 'EXPIRED'}
                        color={editingSalon.subscriptionStatus === 'ACTIVE' ? 'success' : 'error'}
                        sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                      />
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Start Date</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {editingSalon.subscriptionStartDate ? new Date(editingSalon.subscriptionStartDate).toLocaleDateString() : '—'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Expiry Date</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {editingSalon.subscriptionEndDate ? new Date(editingSalon.subscriptionEndDate).toLocaleDateString() : '—'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Days Remaining</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: editingSalon.subscriptionStatus === 'ACTIVE' ? '#10b981' : '#ef4444' }}>
                      {editingSalon.subscriptionEndDate && editingSalon.subscriptionStatus === 'ACTIVE'
                        ? Math.max(0, Math.ceil((new Date(editingSalon.subscriptionEndDate) - new Date()) / (1000 * 60 * 60 * 24)))
                        : 0} days
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  {!editingSalon.currentPlanId && (
                    <Button variant="outlined" size="small" onClick={handleOpenPlanModal}>
                      Assign Plan
                    </Button>
                  )}
                  {editingSalon.currentPlanId && (
                    <Button variant="outlined" size="small" onClick={handleOpenPlanModal}>
                      Change Plan
                    </Button>
                  )}
                  {editingSalon.currentPlanId && editingSalon.subscriptionStatus !== 'ACTIVE' && (
                    <Button variant="contained" color="primary" size="small" onClick={handleRenewPlan}>
                      Renew Plan
                    </Button>
                  )}
                  {editingSalon.currentPlanId && (
                    <Button variant="outlined" color="error" size="small" onClick={handleRemovePlan}>
                      Remove Plan
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 2, py: 1.25 }}>
            <Button onClick={handleCloseDialog} disabled={isSubmitting} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                fontWeight: 600,
                textTransform: 'none',
                px: 3,
              }}
            >
              {isSubmitting ? <CircularProgress size={22} color="inherit" /> : editingSalon ? 'Save Changes' : 'Provision Salon'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Assign / Change Plan Modal */}
      <Dialog open={planDialogOpen} onClose={() => !isAssigningPlan && setPlanDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingSalon?.currentPlanId ? 'Change Subscription Plan' : 'Assign Subscription Plan'}
        </DialogTitle>
        <DialogContent dividers>
          {planDialogError && <Alert severity="error" sx={{ mb: 2 }}>{planDialogError}</Alert>}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              select
              label="Plan *"
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              SelectProps={{ native: true }}
              fullWidth
            >
              <option value="" disabled>Select Plan ▼</option>
              {availablePlans.map((p) => (
                <option key={p.id || p._id} value={p.id || p._id}>
                  {p.name} - ₹{Number(p.price).toFixed(2)} / {p.durationInDays} Days
                </option>
              ))}
            </TextField>

            <TextField
              type="date"
              label="Start Date *"
              value={planStartDate}
              onChange={(e) => setPlanStartDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            {/* Live Preview */}
            {selectedPlanId && (
              <Box sx={{ mt: 1, p: 2, bgcolor: '#f1f5f9', borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Plan Preview</Typography>
                {(() => {
                  const p = availablePlans.find(plan => (plan.id || plan._id) === selectedPlanId);
                  if (!p) return null;

                  const sDate = planStartDate ? new Date(planStartDate) : new Date();
                  let eDateStr = '—';
                  if (!isNaN(sDate.getTime())) {
                    const eDate = new Date(sDate.getTime() + p.durationInDays * 24 * 60 * 60 * 1000);
                    eDateStr = eDate.toLocaleDateString();
                  }

                  return (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                      <Typography variant="body2"><strong>Plan:</strong> {p.name}</Typography>
                      <Typography variant="body2"><strong>Price:</strong> ₹{Number(p.price).toFixed(2)}</Typography>
                      <Typography variant="body2"><strong>Duration:</strong> {p.durationInDays} Days</Typography>
                      <Typography variant="body2"><strong>End Date:</strong> {eDateStr}</Typography>
                    </Box>
                  );
                })()}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2, py: 1.25 }}>
          <Button onClick={() => setPlanDialogOpen(false)} disabled={isAssigningPlan} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleConfirmPlanChange}
            disabled={isAssigningPlan || !selectedPlanId || !planStartDate}
            startIcon={isAssigningPlan && <CircularProgress size={18} color="inherit" />}
          >
            {isAssigningPlan ? 'Processing...' : 'Assign Plan'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default Salons;
