import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  DeleteOutline as DeleteIcon,
  Search as SearchIcon,
  Spa as SpaIcon,
  AccessTime as AccessTimeIcon,
  AttachMoney as AttachMoneyIcon,
  CheckCircle as CheckCircleIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import PageContainer from '../../components/layout/PageContainer';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { usePermission } from '../../hooks/usePermission';
import { servicesApi } from '../../api/servicesApi';

const ServicesList = () => {
  const { can } = usePermission();

  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [actionSuccess, setActionSuccess] = useState('');

  // Dialog State: Create / Edit
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    durationInMinutes: 30,
    price: 0,
    isActive: true,
  });
  const [dialogError, setDialogError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog State: View Details
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingService, setViewingService] = useState(null);

  // Dialog State: Delete Confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingService, setDeletingService] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Services
  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await servicesApi.listServices();
      setServices(res.services || []);
    } catch (err) {
      console.error('[ServicesList] Load failed:', err);
      setError(err.response?.data?.message || 'Failed to load services catalog.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Search and status filtering
  const filteredServices = useMemo(() => {
    return services.filter((svc) => {
      const matchesSearch =
        !searchQuery ||
        svc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (svc.description && svc.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && svc.isActive) ||
        (statusFilter === 'inactive' && !svc.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [services, searchQuery, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = services.length;
    const active = services.filter((s) => s.isActive).length;
    const inactive = total - active;
    const avgPrice =
      total > 0
        ? (services.reduce((acc, s) => acc + (Number(s.price) || 0), 0) / total).toFixed(2)
        : '0.00';
    return { total, active, inactive, avgPrice };
  }, [services]);

  // Open Create Dialog
  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      durationInMinutes: 30,
      price: 0,
      isActive: true,
    });
    setDialogError('');
    setDialogOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (svc) => {
    setEditingService(svc);
    setFormData({
      name: svc.name,
      description: svc.description || '',
      durationInMinutes: svc.durationInMinutes || 30,
      price: svc.price !== undefined ? svc.price : 0,
      isActive: svc.isActive,
    });
    setDialogError('');
    setDialogOpen(true);
  };

  // Open View Dialog
  const handleOpenView = (svc) => {
    setViewingService(svc);
    setViewDialogOpen(true);
  };

  // Open Delete Dialog
  const handleOpenDelete = (svc) => {
    setDeletingService(svc);
    setDeleteDialogOpen(true);
  };

  // Handle Form Submit (Create / Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setDialogError('');

    if (!formData.name.trim()) {
      setDialogError('Service name is required.');
      return;
    }

    const duration = Number(formData.durationInMinutes);
    if (isNaN(duration) || duration <= 0) {
      setDialogError('Duration must be a positive number greater than 0.');
      return;
    }

    const price = Number(formData.price);
    if (isNaN(price) || price < 0) {
      setDialogError('Price must be a valid non-negative number.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingService) {
        await servicesApi.updateService(editingService.id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          durationInMinutes: duration,
          price: price,
          isActive: formData.isActive,
        });
        setActionSuccess(`Service '${formData.name.trim()}' updated successfully.`);
      } else {
        await servicesApi.createService({
          name: formData.name.trim(),
          description: formData.description.trim(),
          durationInMinutes: duration,
          price: price,
          isActive: formData.isActive,
        });
        setActionSuccess(`Service '${formData.name.trim()}' created successfully.`);
      }

      setDialogOpen(false);
      await fetchServices();
    } catch (err) {
      console.error('[ServicesList] Submit failed:', err);
      setDialogError(err.response?.data?.message || 'Failed to save service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Status Toggle (Activate / Deactivate)
  const handleToggleStatus = async (svc) => {
    try {
      await servicesApi.toggleStatus(svc.id);
      setActionSuccess(
        `Service '${svc.name}' is now ${!svc.isActive ? 'Active' : 'Inactive'}.`
      );
      await fetchServices();
    } catch (err) {
      console.error('[ServicesList] Status toggle failed:', err);
      setError(err.response?.data?.message || 'Failed to update service status.');
    }
  };

  // Handle Soft Delete
  const handleConfirmDelete = async () => {
    if (!deletingService) return;
    setIsDeleting(true);
    try {
      await servicesApi.deleteService(deletingService.id);
      setActionSuccess(`Service '${deletingService.name}' deactivated successfully.`);
      setDeleteDialogOpen(false);
      setDeletingService(null);
      await fetchServices();
    } catch (err) {
      console.error('[ServicesList] Delete failed:', err);
      setError(err.response?.data?.message || 'Failed to delete service.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading salon services catalog..." />;
  }

  if (error && services.length === 0) {
    return (
      <PageContainer title="Services" subtitle="Manage salon services catalog, durations, and pricing">
        <ErrorState message={error} onRetry={fetchServices} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Services"
      subtitle="Manage salon services catalog, durations, and pricing"
      actions={
        can('services', 'create') && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            sx={{ textTransform: 'none', fontWeight: 600, px: 2.5 }}
          >
            Add Service
          </Button>
        )
      }
    >
      {/* Action Success Alert */}
      {actionSuccess && (
        <Alert
          severity="success"
          onClose={() => setActionSuccess('')}
          sx={{ mb: 3 }}
        >
          {actionSuccess}
        </Alert>
      )}

      {/* Stats Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: 2 }}>
          <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'primary.light', color: 'primary.main', display: 'flex' }}>
            <SpaIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Total Services
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {stats.total}
            </Typography>
          </Box>
        </Card>

        <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: 2 }}>
          <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'success.light', color: 'success.main', display: 'flex' }}>
            <CheckCircleIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Active
            </Typography>
            <Typography variant="h6" fontWeight={700} color="success.main">
              {stats.active}
            </Typography>
          </Box>
        </Card>

        <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: 2 }}>
          <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'action.hover', color: 'text.secondary', display: 'flex' }}>
            <BlockIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Inactive
            </Typography>
            <Typography variant="h6" fontWeight={700} color="text.secondary">
              {stats.inactive}
            </Typography>
          </Box>
        </Card>

        <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: 2 }}>
          <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'warning.light', color: 'warning.dark', display: 'flex' }}>
            <AttachMoneyIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Avg. Price
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              ${stats.avgPrice}
            </Typography>
          </Box>
        </Card>
      </Box>

      {/* Main Table Container */}
      <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        {/* Search and Tabs Bar */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            gap: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Tabs
            value={statusFilter}
            onChange={(e, val) => setStatusFilter(val)}
            textColor="primary"
            indicatorColor="primary"
            sx={{ minHeight: 40 }}
          >
            <Tab label={`All (${stats.total})`} value="all" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40, py: 0 }} />
            <Tab label={`Active (${stats.active})`} value="active" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40, py: 0 }} />
            <Tab label={`Inactive (${stats.inactive})`} value="inactive" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40, py: 0 }} />
          </Tabs>

          <TextField
            size="small"
            placeholder="Search by name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: '100%', sm: 300 } }}
          />
        </Box>

        {/* Directory Table */}
        {filteredServices.length === 0 ? (
          <EmptyState
            title="No Services Found"
            description={
              searchQuery || statusFilter !== 'all'
                ? 'No services match your active search or filter criteria.'
                : 'Your salon service catalog is currently empty. Add your first service above.'
            }
            action={
              can('services', 'create') && !searchQuery && statusFilter === 'all' ? (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreate}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Create First Service
                </Button>
              ) : null
            }
          />
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Service</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredServices.map((svc) => (
                  <TableRow key={svc.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            bgcolor: svc.isActive ? 'primary.light' : 'grey.200',
                            color: svc.isActive ? 'primary.main' : 'text.disabled',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <SpaIcon fontSize="small" />
                        </Box>
                        <Box>
                          <Typography variant="body2" fontWeight={600} color="text.primary">
                            {svc.name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell sx={{ maxWidth: 280 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {svc.description || '—'}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon fontSize="inherit" color="action" />
                        <Typography variant="body2" fontWeight={500}>
                          {svc.durationInMinutes} mins
                        </Typography>
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="primary.main">
                        ${Number(svc.price).toFixed(2)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={svc.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={svc.isActive ? 'success' : 'default'}
                        variant={svc.isActive ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        <Tooltip title="View Service Profile">
                          <IconButton size="small" onClick={() => handleOpenView(svc)}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {can('services', 'update') && (
                          <Tooltip title="Edit Service">
                            <IconButton size="small" onClick={() => handleOpenEdit(svc)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {can('services', 'update') && (
                          <Tooltip title={svc.isActive ? 'Deactivate Service' : 'Activate Service'}>
                            <Switch
                              size="small"
                              checked={svc.isActive}
                              onChange={() => handleToggleStatus(svc)}
                              color="success"
                            />
                          </Tooltip>
                        )}

                        {can('services', 'delete') && (
                          <Tooltip title="Delete Service">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleOpenDelete(svc)}
                            >
                              <DeleteIcon fontSize="small" />
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
        )}
      </Card>

      {/* Modal: Create / Edit Service */}
      <Dialog open={dialogOpen} onClose={() => !isSubmitting && setDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editingService ? 'Edit Service' : 'Add New Service'}
          </DialogTitle>
          <DialogContent dividers>
            {dialogError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {dialogError}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              <TextField
                label="Service Name"
                required
                fullWidth
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Deluxe Haircut & Blowdry"
                helperText="Must be unique among active services in your salon"
              />

              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of treatments and styling included..."
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  label="Duration (minutes)"
                  type="number"
                  required
                  fullWidth
                  value={formData.durationInMinutes}
                  onChange={(e) => setFormData({ ...formData, durationInMinutes: e.target.value })}
                  inputProps={{ min: 1, step: 5 }}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">min</InputAdornment>,
                  }}
                />

                <TextField
                  label="Price ($)"
                  type="number"
                  required
                  fullWidth
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  inputProps={{ min: 0, step: 0.5 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
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
                label="Service is active and bookable"
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
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
              {isSubmitting ? 'Saving...' : editingService ? 'Save Changes' : 'Create Service'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal: View Service Details */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="xs" fullWidth>
        {viewingService && (
          <>
            <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <SpaIcon color="primary" />
              Service Details
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Service Name
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {viewingService.name}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body2" color="text.primary">
                    {viewingService.description || 'No description provided.'}
                  </Typography>
                </Box>

                <Divider />

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Duration
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {viewingService.durationInMinutes} minutes
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Price
                    </Typography>
                    <Typography variant="body1" fontWeight={700} color="primary.main">
                      ${Number(viewingService.price).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={viewingService.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={viewingService.isActive ? 'success' : 'default'}
                      variant={viewingService.isActive ? 'filled' : 'outlined'}
                    />
                  </Box>
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(viewingService.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Updated: {new Date(viewingService.updatedAt).toLocaleDateString()}
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 1.5 }}>
              <Button onClick={() => setViewDialogOpen(false)} sx={{ textTransform: 'none' }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Modal: Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onClose={() => !isDeleting && setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Deactivate Service?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ pt: 1 }}>
            Are you sure you want to deactivate{' '}
            <strong>{deletingService?.name}</strong>? It will no longer be available for new bookings, but historical records will be preserved.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            startIcon={isDeleting && <CircularProgress size={18} color="inherit" />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {isDeleting ? 'Deactivating...' : 'Deactivate'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default ServicesList;
