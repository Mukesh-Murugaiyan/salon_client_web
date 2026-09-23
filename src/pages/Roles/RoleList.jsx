import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Security as SecurityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import PageContainer from '../../components/layout/PageContainer';
import AppModal from '../../components/common/AppModal';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { usePermission } from '../../hooks/usePermission';
import roleApi from '../../api/roleApi';

const RoleList = () => {
  const navigate = useNavigate();
  const { can } = usePermission();

  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    isActive: true,
  });
  const [dialogError, setDialogError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await roleApi.listRoles();
      setRoles(res.roles || []);
    } catch (err) {
      console.error('[RoleList] Failed to load roles:', err);
      setError(err.response?.data?.message || 'Failed to load roles.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleOpenCreate = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      isActive: true,
    });
    setDialogError('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      code: role.code,
      description: role.description || '',
      isActive: role.isActive,
    });
    setDialogError('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingRole(null);
    setDialogError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDialogError('');
    setIsSubmitting(true);

    try {
      if (editingRole) {
        await roleApi.updateRole(editingRole.id, {
          name: formData.name,
          description: formData.description,
          isActive: formData.isActive,
        });
        setActionSuccess(`Role '${formData.name}' updated successfully.`);
      } else {
        await roleApi.createRole({
          name: formData.name,
          code: formData.code,
          description: formData.description,
          isActive: formData.isActive,
        });
        setActionSuccess(`Role '${formData.name}' created successfully.`);
      }
      handleCloseDialog();
      fetchRoles();
    } catch (err) {
      console.error('[RoleList] Save error:', err);
      setDialogError(err.response?.data?.message || 'Failed to save role.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async (role) => {
    if (!window.confirm(`Are you sure you want to delete role '${role.name}'?`)) return;

    try {
      await roleApi.deleteRole(role.id);
      setActionSuccess(`Role '${role.name}' deleted successfully.`);
      fetchRoles();
    } catch (err) {
      console.error('[RoleList] Delete error:', err);
      setError(err.response?.data?.message || 'Failed to delete role.');
    }
  };

  return (
    <PageContainer
      title="Roles & Permissions"
      subtitle="Define access roles, permission matrices, and user privilege boundaries"
      action={
        can('roles', 'create') && (
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
            Create Role
          </Button>
        )
      }
    >
      {actionSuccess && (
        <Alert severity="success" onClose={() => setActionSuccess('')} sx={{ mb: 3 }}>
          {actionSuccess}
        </Alert>
      )}

      {isLoading ? (
        <LoadingState message="Loading company roles..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchRoles} />
      ) : roles.length === 0 ? (
        <EmptyState
          title="No roles defined"
          description="Get started by creating dynamic roles for your company staff."
          actionLabel={can('roles', 'create') ? 'Create Role' : undefined}
          onAction={handleOpenCreate}
        />
      ) : (
        <Card sx={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <TableContainer sx={{ overflowX: 'auto', width: '100%', maxHeight: 'calc(100vh - 240px)' }}>
            <Table stickyHeader sx={{ minWidth: 700 }}>
              <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Role Name</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Active Permissions</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Assigned Users</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: '#475569' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id} hover>
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
                          <SecurityIcon fontSize="small" />
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
                            onClick={() => navigate(`/roles/${role.id}`)}
                          >
                            {role.name}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={role.code}
                        sx={{
                          fontFamily: 'monospace',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          backgroundColor: '#f1f5f9',
                          color: '#334155',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#64748b', fontSize: '0.875rem', maxWidth: 280 }}>
                      {role.description || '—'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={`${role.permissionsCount || 0} permissions`}
                        sx={{
                          backgroundColor: 'rgba(99, 102, 241, 0.08)',
                          color: '#6366f1',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b' }}>
                        <PeopleIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {role.userCount || 0}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={role.isActive ? 'Active' : 'Inactive'}
                        color={role.isActive ? 'success' : 'default'}
                        variant="outlined"
                        sx={{ fontWeight: 600, borderRadius: '6px' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                        <Tooltip title="Configure Permission Matrix">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<SecurityIcon fontSize="small" />}
                            onClick={() => navigate(`/roles/${role.id}`)}
                            sx={{
                              textTransform: 'none',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              py: 0.4,
                              borderRadius: '6px',
                              borderColor: '#cbd5e1',
                              color: '#334155',
                              '&:hover': {
                                borderColor: '#6366f1',
                                color: '#6366f1',
                                backgroundColor: 'rgba(99, 102, 241, 0.04)',
                              },
                            }}
                          >
                            Permissions
                          </Button>
                        </Tooltip>
                        {can('roles', 'update') && (
                          <Tooltip title="Edit Role Details">
                            <IconButton size="small" onClick={() => handleOpenEdit(role)} sx={{ color: '#64748b' }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {can('roles', 'delete') && role.userCount === 0 && (
                          <Tooltip title="Delete Role">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteRole(role)}
                              sx={{ color: '#ef4444' }}
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
        </Card>
      )}

      {/* Create / Edit Role Dialog */}
      <AppModal
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        title={editingRole ? 'Edit Role' : 'Create New Role'}
        disableClose={isSubmitting}
        actions={
          <>
            <Button onClick={handleCloseDialog} disabled={isSubmitting} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              form="role-form"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                fontWeight: 600,
                textTransform: 'none',
                px: 3,
              }}
            >
              {isSubmitting ? <CircularProgress size={22} color="inherit" /> : editingRole ? 'Update Role' : 'Create Role'}
            </Button>
          </>
        }
      >
        <Box component="form" id="role-form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {dialogError && <Alert severity="error">{dialogError}</Alert>}

          <TextField
            label="Role Name"
            required
            fullWidth
            value={formData.name}
            onChange={(e) => {
              const name = e.target.value;
              setFormData({
                ...formData,
                name,
                code: !editingRole ? name.trim().replace(/\s+/g, '_').toUpperCase() : formData.code,
              });
            }}
            placeholder="e.g. Front Desk Specialist"
          />

          <TextField
            label="Role Code"
            required
            disabled={!!editingRole}
            fullWidth
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="e.g. RECEPTIONIST"
            helperText={!editingRole ? 'Unique uppercase identifier for system reference' : undefined}
          />

          <TextField
            label="Description"
            multiline
            rows={3}
            fullWidth
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Responsibilities, scope and department context..."
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                color="primary"
              />
            }
            label={formData.isActive ? 'Role Active' : 'Role Inactive'}
          />
        </Box>
      </AppModal>
    </PageContainer>
  );
};

export default RoleList;
