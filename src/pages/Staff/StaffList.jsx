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
  Badge as BadgeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  AutoAwesome as AutoAwesomeIcon,
  WorkOutline as WorkOutlineIcon,
} from '@mui/icons-material';
import PageContainer from '../../components/layout/PageContainer';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { usePermission } from '../../hooks/usePermission';
import { STAFF_TITLES, DEFAULT_SPECIALIZATIONS } from '../../constants/staff';
import staffApi from '../../api/staffApi';

const StaffList = () => {
  const { can } = usePermission();

  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [actionSuccess, setActionSuccess] = useState('');

  // Dialog State: Create / Edit
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    title: 'Hair Stylist',
    specialization: '',
    isActive: true,
  });
  const [dialogError, setDialogError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog State: View Profile
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingStaff, setViewingStaff] = useState(null);

  const fetchStaff = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await staffApi.listStaff();
      setStaff(res.staff || []);
    } catch (err) {
      console.error('[StaffList] Load failed:', err);
      setError(err.response?.data?.message || 'Failed to load staff directory.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleOpenCreate = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      title: 'Hair Stylist',
      specialization: '',
      isActive: true,
    });
    setDialogError('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (member) => {
    setEditingStaff(member);
    setFormData({
      name: member.name || '',
      phone: member.phone || '',
      email: member.email || '',
      title: member.title || 'Hair Stylist',
      specialization: member.specialization || '',
      isActive: member.isActive,
    });
    setDialogError('');
    setDialogOpen(true);
  };

  const handleOpenView = (member) => {
    setViewingStaff(member);
    setViewDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingStaff(null);
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
        title: formData.title.trim(),
        specialization: formData.specialization.trim(),
        isActive: formData.isActive,
      };

      if (editingStaff) {
        await staffApi.updateStaff(editingStaff.id, payload);
        setActionSuccess(`Staff member '${payload.name}' updated successfully.`);
      } else {
        await staffApi.createStaff(payload);
        setActionSuccess(`Staff member '${payload.name}' added successfully.`);
      }
      handleCloseDialog();
      fetchStaff();
    } catch (err) {
      console.error('[StaffList] Save failed:', err);
      setDialogError(err.response?.data?.message || 'Failed to save staff member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (member) => {
    try {
      const newStatus = !member.isActive;
      await staffApi.toggleStatus(member.id, newStatus);
      setActionSuccess(`Staff member '${member.name}' is now ${newStatus ? 'active' : 'inactive'}.`);
      fetchStaff();
    } catch (err) {
      console.error('[StaffList] Toggle status failed:', err);
      setError(err.response?.data?.message || 'Failed to update staff status.');
    }
  };

  // Filter & Search Logic
  const filteredStaff = staff.filter((s) => {
    if (statusFilter === 'active' && !s.isActive) return false;
    if (statusFilter === 'inactive' && s.isActive) return false;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchName = s.name?.toLowerCase().includes(query);
      const matchPhone = s.phone?.toLowerCase().includes(query);
      const matchEmail = s.email?.toLowerCase().includes(query);
      const matchTitle = s.title?.toLowerCase().includes(query);
      const matchSpec = s.specialization?.toLowerCase().includes(query);
      return matchName || matchPhone || matchEmail || matchTitle || matchSpec;
    }

    return true;
  });

  const activeCount = staff.filter((s) => s.isActive).length;
  const inactiveCount = staff.length - activeCount;

  return (
    <PageContainer
      title="Staff Directory"
      subtitle="Salon service specialists, stylists, and employee profiles"
      action={
        can('staff', 'create') && (
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
            Add Staff Member
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
          mb: 3,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <TextField
          placeholder="Search by name, phone, title, or specialization..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: { xs: '100%', sm: 380 }, backgroundColor: '#ffffff' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} />
              </InputAdornment>
            ),
          }}
        />

        <Tabs
          value={statusFilter}
          onChange={(e, val) => setStatusFilter(val)}
          sx={{
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            minHeight: '36px',
            '& .MuiTab-root': {
              minHeight: '36px',
              py: 0.5,
              px: 2,
              fontSize: '0.8125rem',
              fontWeight: 600,
              textTransform: 'none',
            },
          }}
        >
          <Tab value="all" label={`All (${staff.length})`} />
          <Tab value="active" label={`Active (${activeCount})`} />
          <Tab value="inactive" label={`Inactive (${inactiveCount})`} />
        </Tabs>
      </Box>

      {isLoading ? (
        <LoadingState message="Loading staff directory..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchStaff} />
      ) : filteredStaff.length === 0 ? (
        <EmptyState
          title="No staff members found"
          description={searchQuery ? 'No staff records matching your search.' : 'Get started by adding your first salon stylist or specialist.'}
          actionLabel={can('staff', 'create') && !searchQuery ? 'Add Staff Member' : undefined}
          onAction={handleOpenCreate}
        />
      ) : (
        <Card sx={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Staff Member</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Position / Title</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Phone</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Specialization</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Created Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: '#475569' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredStaff.map((member) => (
                  <TableRow key={member.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            fontSize: '0.875rem',
                          }}
                        >
                          {member.name.charAt(0).toUpperCase()}
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
                            onClick={() => handleOpenView(member)}
                          >
                            {member.name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        icon={<WorkOutlineIcon fontSize="small" />}
                        label={member.title}
                        sx={{
                          backgroundColor: 'rgba(99, 102, 241, 0.08)',
                          color: '#6366f1',
                          fontWeight: 600,
                          borderRadius: '6px',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#334155', fontWeight: 500, fontFamily: 'monospace' }}>
                      {member.phone}
                    </TableCell>
                    <TableCell sx={{ color: '#64748b' }}>
                      {member.email || '—'}
                    </TableCell>
                    <TableCell sx={{ color: '#475569', fontSize: '0.8125rem', maxWidth: 200 }}>
                      {member.specialization ? (
                        <Typography variant="caption" sx={{ fontWeight: 500 }}>
                          {member.specialization}
                        </Typography>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={member.isActive ? 'Active' : 'Inactive'}
                        color={member.isActive ? 'success' : 'default'}
                        variant="outlined"
                        sx={{ fontWeight: 600, borderRadius: '6px' }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#94a3b8', fontSize: '0.8125rem' }}>
                      {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '—'}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                        <Tooltip title="View Profile">
                          <IconButton size="small" onClick={() => handleOpenView(member)} sx={{ color: '#64748b' }}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {can('staff', 'update') && (
                          <Tooltip title="Edit Staff">
                            <IconButton size="small" onClick={() => handleOpenEdit(member)} sx={{ color: '#64748b' }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {(can('staff', 'update') || can('staff', 'delete')) && (
                          <Tooltip title={member.isActive ? 'Deactivate Staff' : 'Activate Staff'}>
                            <IconButton
                              size="small"
                              onClick={() => handleToggleStatus(member)}
                              sx={{ color: member.isActive ? '#ef4444' : '#10b981' }}
                            >
                              {member.isActive ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
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

      {/* Add / Edit Staff Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
            {editingStaff ? 'Edit Staff Member' : 'Register New Staff Member'}
          </DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
            {dialogError && <Alert severity="error">{dialogError}</Alert>}

            <TextField
              label="Full Name"
              required
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Marcus Vance"
              autoFocus
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Phone Number"
                required
                fullWidth
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +1-555-8888"
              />

              <TextField
                label="Email Address"
                type="email"
                fullWidth
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="marcus@salon.com"
              />
            </Box>

            <FormControl fullWidth required>
              <InputLabel id="staff-title-label">Position / Title</InputLabel>
              <Select
                labelId="staff-title-label"
                label="Position / Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              >
                {STAFF_TITLES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Specialization & Skills"
              fullWidth
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              placeholder="e.g. Fade Cuts, Beard Grooming, Balayage, Keratin"
              helperText="Key techniques, treatments, or services this staff member excels at"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  color="primary"
                />
              }
              label={formData.isActive ? 'Active Staff Member' : 'Inactive Staff Member'}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
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
              {isSubmitting ? (
                <CircularProgress size={22} color="inherit" />
              ) : editingStaff ? (
                'Save Changes'
              ) : (
                'Add Staff Member'
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* View Staff Profile Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Staff Profile</span>
          {viewingStaff && (
            <Chip
              size="small"
              label={viewingStaff.isActive ? 'Active' : 'Inactive'}
              color={viewingStaff.isActive ? 'success' : 'default'}
              variant="outlined"
            />
          )}
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2.5 }}>
          {viewingStaff && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                  sx={{
                    width: 54,
                    height: 54,
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '1.35rem',
                  }}
                >
                  {viewingStaff.name.charAt(0).toUpperCase()}
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    {viewingStaff.name}
                  </Typography>
                  <Chip
                    size="small"
                    icon={<WorkOutlineIcon fontSize="small" />}
                    label={viewingStaff.title}
                    sx={{
                      mt: 0.5,
                      backgroundColor: 'rgba(99, 102, 241, 0.08)',
                      color: '#6366f1',
                      fontWeight: 600,
                    }}
                  />
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
                      {viewingStaff.phone}
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
                      {viewingStaff.email || 'None'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ p: 2, borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AutoAwesomeIcon fontSize="small" sx={{ color: '#6366f1' }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#334155' }}>
                    Specialization & Expertise
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {viewingStaff.specialization || 'No specializations specified.'}
                </Typography>
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>
                Member since {viewingStaff.createdAt ? new Date(viewingStaff.createdAt).toLocaleDateString() : '—'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setViewDialogOpen(false)} color="inherit">
            Close
          </Button>
          {can('staff', 'update') && viewingStaff && (
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => {
                setViewDialogOpen(false);
                handleOpenEdit(viewingStaff);
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
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default StaffList;
