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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import PageContainer from '../../components/layout/PageContainer';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { usePermission } from '../../hooks/usePermission';
import userApi from '../../api/userApi';
import roleApi from '../../api/roleApi';

const UserList = () => {
  const { can } = usePermission();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roleId: '',
    isActive: true,
  });
  const [dialogError, setDialogError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchUsersAndRoles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        userApi.listUsers(),
        roleApi.listRoles(),
      ]);
      setUsers(usersRes.users || []);
      setRoles(rolesRes.roles || []);
    } catch (err) {
      console.error('[UserList] Failed to load users/roles:', err);
      setError(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsersAndRoles();
  }, [fetchUsersAndRoles]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      roleId: roles.length > 0 ? roles[0].id : '',
      isActive: true,
    });
    setDialogError('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      roleId: user.roleId || (typeof user.role === 'object' ? user.role?.id : '') || '',
      isActive: user.isActive,
    });
    setDialogError('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUser(null);
    setDialogError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDialogError('');
    setIsSubmitting(true);

    try {
      if (editingUser) {
        // Update User
        const updatePayload = {
          name: formData.name,
          email: formData.email,
          roleId: formData.roleId,
          isActive: formData.isActive,
        };
        if (formData.password) {
          updatePayload.password = formData.password;
        }
        await userApi.updateUser(editingUser.id, updatePayload);
        setActionSuccess(`User '${formData.name}' updated successfully.`);
      } else {
        // Create User
        await userApi.createUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          roleId: formData.roleId,
          isActive: formData.isActive,
        });
        setActionSuccess(`User '${formData.name}' created successfully.`);
      }
      handleCloseDialog();
      fetchUsersAndRoles();
    } catch (err) {
      console.error('[UserList] Save error:', err);
      setDialogError(err.response?.data?.message || 'Failed to save user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = !user.isActive;
      await userApi.toggleStatus(user.id, newStatus);
      setActionSuccess(`User '${user.name}' is now ${newStatus ? 'active' : 'inactive'}.`);
      fetchUsersAndRoles();
    } catch (err) {
      console.error('[UserList] Status toggle failed:', err);
      setError(err.response?.data?.message || 'Failed to change user status.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const term = searchQuery.toLowerCase();
    const roleName = typeof u.role === 'object' ? u.role?.name : u.role;
    return (
      u.name?.toLowerCase().includes(term) ||
      u.email?.toLowerCase().includes(term) ||
      roleName?.toLowerCase().includes(term)
    );
  });

  return (
    <PageContainer
      title="User Management"
      subtitle="Manage company staff, assignments, and account statuses"
      action={
        can('users', 'create') && (
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
            Create User
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
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          placeholder="Search by name, email, or role..."
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: { xs: '100%', sm: 360 }, backgroundColor: '#ffffff' }}
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
        <LoadingState message="Loading company users..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchUsersAndRoles} />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          title="No users found"
          description={searchQuery ? 'No users matching your search term.' : 'Get started by creating your first company user.'}
          actionLabel={can('users', 'create') && !searchQuery ? 'Create User' : undefined}
          onAction={handleOpenCreate}
        />
      ) : (
        <Card sx={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Company</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Assigned Role</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Created Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: '#475569' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((u) => {
                  const roleObj = typeof u.role === 'object' ? u.role : null;
                  const roleLabel = roleObj?.name || roleObj?.code || u.role || 'Unassigned';
                  const companyLabel = typeof u.company === 'object' ? u.company?.name : u.company || 'Demo Company';

                  return (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 34,
                              height: 34,
                              borderRadius: '50%',
                              backgroundColor: 'rgba(99, 102, 241, 0.1)',
                              color: '#6366f1',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 600,
                              fontSize: '0.875rem',
                            }}
                          >
                            {u.name.charAt(0).toUpperCase()}
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                            {u.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: '#64748b' }}>{u.email}</TableCell>
                      <TableCell sx={{ color: '#64748b', fontSize: '0.875rem' }}>{companyLabel}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={roleLabel}
                          sx={{
                            backgroundColor: 'rgba(99, 102, 241, 0.08)',
                            color: '#6366f1',
                            fontWeight: 600,
                            borderRadius: '6px',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={u.isActive ? 'Active' : 'Inactive'}
                          color={u.isActive ? 'success' : 'default'}
                          variant="outlined"
                          sx={{ fontWeight: 600, borderRadius: '6px' }}
                        />
                      </TableCell>
                      <TableCell sx={{ color: '#94a3b8', fontSize: '0.8125rem' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          {can('users', 'update') && (
                            <Tooltip title="Edit User">
                              <IconButton size="small" onClick={() => handleOpenEdit(u)} sx={{ color: '#64748b' }}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {can('users', 'update') && (
                            <Tooltip title={u.isActive ? 'Deactivate User' : 'Activate User'}>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleStatus(u)}
                                sx={{ color: u.isActive ? '#ef4444' : '#10b981' }}
                              >
                                {u.isActive ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Create / Edit User Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
            {editingUser ? 'Edit User' : 'Create New User'}
          </DialogTitle>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
            {dialogError && <Alert severity="error">{dialogError}</Alert>}

            <TextField
              label="Full Name"
              required
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Jane Doe"
            />

            <TextField
              label="Email Address"
              type="email"
              required
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="jane@example.com"
            />

            <TextField
              label={editingUser ? 'New Password (leave blank to keep unchanged)' : 'Password'}
              type="password"
              required={!editingUser}
              fullWidth
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              helperText={!editingUser ? 'Minimum 6 characters' : undefined}
            />

            <FormControl fullWidth required>
              <InputLabel id="role-select-label">Assign Role</InputLabel>
              <Select
                labelId="role-select-label"
                label="Assign Role"
                value={formData.roleId}
                onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
              >
                {roles.map((r) => (
                  <MenuItem key={r.id} value={r.id}>
                    {r.name} ({r.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  color="primary"
                />
              }
              label={formData.isActive ? 'Account Active' : 'Account Inactive'}
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
              {isSubmitting ? <CircularProgress size={22} color="inherit" /> : editingUser ? 'Update User' : 'Create User'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </PageContainer>
  );
};

export default UserList;
