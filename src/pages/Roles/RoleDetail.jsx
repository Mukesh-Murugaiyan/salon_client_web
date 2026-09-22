import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  SelectAll as SelectAllIcon,
  Deselect as DeselectIcon,
} from '@mui/icons-material';
import PageContainer from '../../components/layout/PageContainer';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { usePermission } from '../../hooks/usePermission';
import roleApi from '../../api/roleApi';

const RoleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { can } = usePermission();

  const [role, setRole] = useState(null);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());
  const [activeTab, setActiveTab] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchRoleData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await roleApi.getRole(id);
      setRole(res.role);
      setAssignedUsers(res.users || []);
      setCatalog(res.catalog || []);
      setSelectedPermissions(new Set(res.role?.permissions || []));
    } catch (err) {
      console.error('[RoleDetail] Failed to fetch role:', err);
      setError(err.response?.data?.message || 'Failed to load role details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRoleData();
  }, [fetchRoleData]);

  // Toggle single permission (e.g. 'users:create')
  const handleTogglePermission = (permissionString) => {
    const updated = new Set(selectedPermissions);
    if (updated.has(permissionString)) {
      updated.delete(permissionString);
    } else {
      updated.add(permissionString);
    }
    setSelectedPermissions(updated);
  };

  // Toggle all actions for a specific module row
  const handleToggleRow = (moduleItem) => {
    const modulePerms = moduleItem.actions.map((act) => `${moduleItem.module}:${act}`);
    const allSelected = modulePerms.every((p) => selectedPermissions.has(p));

    const updated = new Set(selectedPermissions);
    if (allSelected) {
      modulePerms.forEach((p) => updated.delete(p));
    } else {
      modulePerms.forEach((p) => updated.add(p));
    }
    setSelectedPermissions(updated);
  };

  // Global toggle: Select all permissions in catalog
  const handleSelectAll = () => {
    const all = new Set();
    catalog.forEach((item) => {
      item.actions.forEach((act) => all.add(`${item.module}:${act}`));
    });
    setSelectedPermissions(all);
  };

  // Global toggle: Deselect all
  const handleDeselectAll = () => {
    setSelectedPermissions(new Set());
  };

  // Save permissions to MongoDB
  const handleSavePermissions = async () => {
    setIsSaving(true);
    setSuccessMessage('');
    setError(null);
    try {
      const permsArray = Array.from(selectedPermissions);
      await roleApi.updateRolePermissions(id, permsArray);
      setSuccessMessage(`Permissions successfully updated (${permsArray.length} active permissions).`);
      // Update role local state
      setRole((prev) => (prev ? { ...prev, permissions: permsArray } : prev));
    } catch (err) {
      console.error('[RoleDetail] Save permissions failed:', err);
      setError(err.response?.data?.message || 'Failed to save permissions.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer title="Role Details">
        <LoadingState message="Loading role definition & permission matrix..." />
      </PageContainer>
    );
  }

  if (error && !role) {
    return (
      <PageContainer title="Role Details">
        <ErrorState message={error} onRetry={fetchRoleData} />
      </PageContainer>
    );
  }

  const allActions = Array.from(
    new Set(
      ['view', 'create', 'update', 'delete', ...catalog.flatMap((item) => item.actions || [])]
    )
  );

  return (
    <PageContainer
      title={role ? `${role.name}` : 'Role Configuration'}
      subtitle={role?.description || 'Permission boundaries & assigned users'}
      action={
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/roles')}
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              color: '#475569',
              borderColor: '#cbd5e1',
            }}
          >
            Back to Roles
          </Button>
          {can('roles', 'update') && (
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSavePermissions}
              disabled={isSaving}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: '8px',
                px: 2.5,
              }}
            >
              {isSaving ? <CircularProgress size={22} color="inherit" /> : 'Save Permissions'}
            </Button>
          )}
        </Box>
      }
    >
      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage('')} sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Role Summary Header Card */}
      <Card sx={{ mb: { xs: 2, sm: 2.5 }, borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  color: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SecurityIcon sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', fontSize: { xs: '1rem', sm: '1.15rem' } }}>
                    {role.name}
                  </Typography>
                  <Chip
                    size="small"
                    label={role.code}
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      backgroundColor: '#f1f5f9',
                      color: '#334155',
                    }}
                  />
                  <Chip
                    size="small"
                    label={role.isActive ? 'Active' : 'Inactive'}
                    color={role.isActive ? 'success' : 'default'}
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, fontSize: '0.8rem' }}>
                  {role.description || 'No description provided.'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Box sx={{ p: 1, px: 1.5, borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.65rem' }}>
                  ENABLED PERMISSIONS
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#6366f1' }}>
                  {selectedPermissions.size}
                </Typography>
              </Box>
              <Box sx={{ p: 1, px: 1.5, borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, fontSize: '0.65rem' }}>
                  ASSIGNED USERS
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  {assignedUsers.length}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs: Permission Matrix / Assigned Users */}
      <Box sx={{ borderBottom: 1, borderColor: '#e2e8f0', mb: { xs: 2, sm: 2.5 } }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0.5, px: 1.5, fontSize: '0.8125rem' } }}
        >
          <Tab label={`Permission Matrix (${selectedPermissions.size})`} sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label={`Assigned Users (${assignedUsers.length})`} sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>
      </Box>

      {/* TAB 0: Interactive Permission Matrix */}
      {activeTab === 0 && (
        <Card sx={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <Box
            sx={{
              p: { xs: 1.25, sm: 1.5 },
              px: { xs: 1.5, sm: 2 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155' }}>
              Resource & Action Matrix
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<SelectAllIcon fontSize="small" />}
                onClick={handleSelectAll}
                sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px' }}
              >
                Select All
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<DeselectIcon fontSize="small" />}
                onClick={handleDeselectAll}
                sx={{ textTransform: 'none', fontSize: '0.75rem', fontWeight: 600, borderRadius: '6px' }}
              >
                Clear All
              </Button>
            </Box>
          </Box>

          <TableContainer sx={{ overflowX: 'auto', width: '100%' }}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead sx={{ backgroundColor: '#ffffff' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#475569', minWidth: 200 }}>Module / Resource</TableCell>
                  {allActions.map((action) => (
                    <TableCell key={action} align="center" sx={{ fontWeight: 700, color: '#475569', textTransform: 'capitalize', minWidth: 100 }}>
                      {action.replace('_', ' ')}
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', width: 130 }}>
                    Row Toggle
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {catalog.map((moduleItem) => {
                  const modulePerms = moduleItem.actions.map((act) => `${moduleItem.module}:${act}`);
                  const allSelectedInRow = modulePerms.every((p) => selectedPermissions.has(p));
                  const someSelectedInRow = modulePerms.some((p) => selectedPermissions.has(p)) && !allSelectedInRow;

                  return (
                    <TableRow key={moduleItem.module} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                          {moduleItem.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {moduleItem.description}
                        </Typography>
                      </TableCell>

                      {allActions.map((action) => {
                        const permString = `${moduleItem.module}:${action}`;
                        const isActionAvailable = moduleItem.actions.includes(action);

                        if (!isActionAvailable) {
                          return (
                            <TableCell key={action} align="center" sx={{ color: '#cbd5e1' }}>
                              —
                            </TableCell>
                          );
                        }

                        const isChecked = selectedPermissions.has(permString);

                        return (
                          <TableCell key={action} align="center">
                            <Checkbox
                              checked={isChecked}
                              onChange={() => handleTogglePermission(permString)}
                              color="primary"
                              size="small"
                              sx={{
                                color: '#cbd5e1',
                                '&.Mui-checked': {
                                  color: '#6366f1',
                                },
                              }}
                            />
                          </TableCell>
                        );
                      })}

                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="text"
                          onClick={() => handleToggleRow(moduleItem)}
                          sx={{
                            fontSize: '0.75rem',
                            textTransform: 'none',
                            fontWeight: 600,
                            color: allSelectedInRow ? '#ef4444' : '#6366f1',
                          }}
                        >
                          {allSelectedInRow ? 'Clear Row' : 'Select Row'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
            {can('roles', 'update') && (
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSavePermissions}
                disabled={isSaving}
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: '8px',
                  px: 3,
                }}
              >
                {isSaving ? <CircularProgress size={22} color="inherit" /> : 'Save Permissions'}
              </Button>
            )}
          </Box>
        </Card>
      )}

      {/* TAB 1: Assigned Users */}
      {activeTab === 1 && (
        <Card sx={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          {assignedUsers.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#475569' }}>
                No users assigned to this role
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Assign this role when creating or editing users in the Users page.
              </Typography>
            </Box>
          ) : (
            <TableContainer sx={{ overflowX: 'auto', width: '100%' }}>
              <Table sx={{ minWidth: 500 }}>
                <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#475569' }}>Assigned Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignedUsers.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              backgroundColor: 'rgba(99, 102, 241, 0.1)',
                              color: '#6366f1',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 600,
                              fontSize: '0.8125rem',
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      )}
    </PageContainer>
  );
};

export default RoleDetail;
