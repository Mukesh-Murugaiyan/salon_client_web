import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Notes as NotesIcon,
  Cake as CakeIcon,
  Wc as WcIcon,
} from '@mui/icons-material';
import PageContainer from '../components/layout/PageContainer';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import AppModal from '../components/common/AppModal';
import DebouncedSearchInput from '../components/common/DebouncedSearchInput';
import { usePermission } from '../hooks/usePermission';
import { GENDER_OPTIONS, GENDER_MAP } from '../constants/client';
import clientApi from '../api/clientApi';

const Clients = () => {
  const { can } = usePermission();

  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [actionSuccess, setActionSuccess] = useState('');

  // Dialog State: Create / Edit
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'PREFER_NOT_TO_SAY',
    dateOfBirth: '',
    notes: '',
    isActive: true,
  });
  const [dialogError, setDialogError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog State: View Profile
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingClient, setViewingClient] = useState(null);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const res = await clientApi.listClients(params);
      setClients(res.clients || []);
    } catch (err) {
      console.error('[Clients] Load failed:', err);
      setError(err.response?.data?.message || 'Failed to load clients directory.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handleOpenCreate = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      gender: 'PREFER_NOT_TO_SAY',
      dateOfBirth: '',
      notes: '',
      isActive: true,
    });
    setDialogError('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name || '',
      phone: client.phone || '',
      email: client.email || '',
      gender: client.gender || 'PREFER_NOT_TO_SAY',
      dateOfBirth: client.dateOfBirth ? client.dateOfBirth.substring(0, 10) : '',
      notes: client.notes || '',
      isActive: client.isActive,
    });
    setDialogError('');
    setDialogOpen(true);
  };

  const handleOpenView = (client) => {
    setViewingClient(client);
    setViewDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingClient(null);
    setDialogError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDialogError('');
    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
        notes: formData.notes.trim(),
        isActive: formData.isActive,
      };

      if (editingClient) {
        await clientApi.updateClient(editingClient.id, payload);
        setActionSuccess(`Client '${payload.name}' updated successfully.`);
      } else {
        await clientApi.createClient(payload);
        setActionSuccess(`Client '${payload.name}' created successfully.`);
      }
      handleCloseDialog();
      fetchClients();
    } catch (err) {
      console.error('[Clients] Save failed:', err);
      setDialogError(err.response?.data?.message || 'Failed to save client.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (client) => {
    try {
      const newStatus = !client.isActive;
      await clientApi.toggleStatus(client.id, newStatus);
      setActionSuccess(`Client '${client.name}' is now ${newStatus ? 'active' : 'inactive'}.`);
      fetchClients();
    } catch (err) {
      console.error('[Clients] Toggle status failed:', err);
      setError(err.response?.data?.message || 'Failed to update client status.');
    }
  };

  // Filter by status tab (search is handled on backend)
  const filteredClients = clients.filter((c) => {
    if (statusFilter === 'active' && !c.isActive) return false;
    if (statusFilter === 'inactive' && c.isActive) return false;
    return true;
  });

  const activeCount = clients.filter((c) => c.isActive).length;
  const inactiveCount = clients.length - activeCount;

  return (
    <PageContainer
      title="Client Directory"
      subtitle="Client relationships, profile history, and contact records"
      action={
        can('clients', 'create') && (
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
            Add Client
          </Button>
        )
      }
    >
      {actionSuccess && (
        <Alert severity="success" onClose={() => setActionSuccess('')} sx={{ mb: 3 }}>
          {actionSuccess}
        </Alert>
      )}

      {/* Search Bar & Status Tabs */}
      <Box
        sx={{
          mb: { xs: 2, sm: 2.5 },
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1.5,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ width: { xs: '100%', sm: 320 } }}>
          <DebouncedSearchInput
            placeholder="Search by name, phone, or email..."
            value={searchQuery}
            onSearchChange={(val) => setSearchQuery(val)}
          />
        </Box>

        <Tabs
          value={statusFilter}
          onChange={(e, val) => setStatusFilter(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            minHeight: '34px',
            width: { xs: '100%', sm: 'auto' },
            '& .MuiTab-root': {
              minHeight: '34px',
              py: 0.25,
              px: 1.5,
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'none',
            },
          }}
        >
          <Tab value="all" label={`All (${clients.length})`} />
          <Tab value="active" label={`Active (${activeCount})`} />
          <Tab value="inactive" label={`Inactive (${inactiveCount})`} />
        </Tabs>
      </Box>

      {isLoading ? (
        <LoadingState message="Loading clients directory..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchClients} />
      ) : filteredClients.length === 0 ? (
        <EmptyState
          title="No clients found"
          description={searchQuery ? 'No client records matching your search.' : 'Get started by registering your first salon client.'}
          actionLabel={can('clients', 'create') && !searchQuery ? 'Add Client' : undefined}
          onAction={handleOpenCreate}
        />
      ) : (
        <Card sx={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <TableContainer sx={{ overflowX: 'auto', width: '100%', maxHeight: 'calc(100vh - 280px)' }}>
            <Table stickyHeader sx={{ minWidth: 650 }}>
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Client</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Gender</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Created Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: '#475569' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            color: '#6366f1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                          }}
                        >
                          {client.name.charAt(0).toUpperCase()}
                        </Box>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: '#1e293b',
                              cursor: 'pointer',
                              '&:hover': { color: '#6366f1' },
                            }}
                            onClick={() => handleOpenView(client)}
                          >
                            {client.name}
                          </Typography>
                          {client.notes && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: 'block',
                                maxWidth: 220,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {client.notes}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#334155', fontWeight: 500, fontFamily: 'monospace' }}>
                      {client.phone}
                    </TableCell>
                    <TableCell sx={{ color: '#64748b' }}>
                      {client.email || '—'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={GENDER_MAP[client.gender] || client.gender || 'Not specified'}
                        sx={{
                          fontSize: '0.75rem',
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={client.isActive ? 'Active' : 'Inactive'}
                        color={client.isActive ? 'success' : 'default'}
                        variant="outlined"
                        sx={{ fontWeight: 600, borderRadius: '6px' }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontSize: '0.8125rem' }}>
                      {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                        <Tooltip title="View Profile">
                          <IconButton size="small" onClick={() => handleOpenView(client)} sx={{ color: '#64748b' }}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {can('clients', 'update') && (
                          <Tooltip title="Edit Client">
                            <IconButton size="small" onClick={() => handleOpenEdit(client)} sx={{ color: '#64748b' }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {(can('clients', 'update') || can('clients', 'delete')) && (
                          <Tooltip title={client.isActive ? 'Deactivate Client' : 'Activate Client'}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleStatus(client)}
                              sx={{ color: client.isActive ? '#ef4444' : '#10b981' }}
                            >
                              {client.isActive ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
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

      {/* Add / Edit Client Dialog */}
      <AppModal
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        title={editingClient ? 'Edit Client Record' : 'Register New Client'}
        disableClose={isSubmitting}
        actions={
          <>
            <Button onClick={handleCloseDialog} disabled={isSubmitting} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              form="client-form"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                fontWeight: 600,
                textTransform: 'none',
                px: 3,
              }}
            >
              {isSubmitting ? (
                <CircularProgress size={22} color="inherit" />
              ) : editingClient ? (
                'Save Changes'
              ) : (
                'Register Client'
              )}
            </Button>
          </>
        }
      >
        <Box component="form" id="client-form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {dialogError && <Alert severity="error">{dialogError}</Alert>}

          <TextField
            label="Full Name"
            required
            fullWidth
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Olivia Wilde"
            autoFocus
          />

          <TextField
            label="Phone Number"
            required
            fullWidth
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="e.g. +1-555-0199"
            helperText="Unique identifier used for appointment lookup"
          />

          <TextField
            label="Email Address (Optional)"
            type="email"
            fullWidth
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="olivia@example.com"
          />

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="client-gender-label">Gender</InputLabel>
              <Select
                labelId="client-gender-label"
                label="Gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                {GENDER_OPTIONS.map((g) => (
                  <MenuItem key={g.value} value={g.value}>
                    {g.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Date of Birth"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
          </Box>

          <TextField
            label="Client Preferences & Notes"
            multiline
            rows={3}
            fullWidth
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Color formulas, hair type, sensitivities, allergies, preferred stylists..."
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                color="primary"
              />
            }
            label={formData.isActive ? 'Active Client' : 'Inactive Client'}
          />
        </Box>
      </AppModal>

      {/* View Client Profile Dialog */}
      <AppModal
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="sm"
        title="Client Profile"
        actions={
          <>
            <Button onClick={() => setViewDialogOpen(false)} color="inherit">
              Close
            </Button>
            {can('clients', 'update') && viewingClient && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => {
                  setViewDialogOpen(false);
                  handleOpenEdit(viewingClient);
                }}
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                Edit Profile
              </Button>
            )}
          </>
        }
      >
        {viewingClient && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  color: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1.25rem',
                }}
              >
                {viewingClient.name.charAt(0).toUpperCase()}
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  {viewingClient.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Registered: {viewingClient.createdAt ? new Date(viewingClient.createdAt).toLocaleDateString() : '—'}
                </Typography>
              </Box>
            </Box>

            <Divider />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon fontSize="small" sx={{ color: '#6366f1' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Phone
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {viewingClient.phone}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmailIcon fontSize="small" sx={{ color: '#6366f1' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Email
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {viewingClient.email || 'None'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WcIcon fontSize="small" sx={{ color: '#6366f1' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Gender
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {GENDER_MAP[viewingClient.gender] || viewingClient.gender}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CakeIcon fontSize="small" sx={{ color: '#6366f1' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Date of Birth
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {viewingClient.dateOfBirth ? new Date(viewingClient.dateOfBirth).toLocaleDateString() : 'Not provided'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ p: 2, borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <NotesIcon fontSize="small" sx={{ color: '#64748b' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#334155' }}>
                  Preferences & Notes
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                {viewingClient.notes || 'No special notes recorded.'}
              </Typography>
            </Box>
          </Box>
        )}
      </AppModal>
    </PageContainer>
  );
};

export default Clients;
