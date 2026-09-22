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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  InputAdornment,
  Tabs,
  Tab,
  Divider,
  Menu,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  CancelOutlined as CancelIcon,
  CheckCircleOutline as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  CalendarMonth as CalendarMonthIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  Spa as SpaIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  PendingActions as PendingIcon,
} from '@mui/icons-material';
import PageContainer from '../components/layout/PageContainer';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { usePermission } from '../hooks/usePermission';
import { appointmentsApi } from '../api/appointmentsApi';
import {
  APPOINTMENT_STATUS,
  STATUS_CONFIG,
  BUSINESS_HOURS,
  calculateEndTime,
} from '../constants/appointment';

const getTodayString = () => new Date().toISOString().split('T')[0];

const Appointments = () => {
  const { can } = usePermission();

  const [appointments, setAppointments] = useState([]);
  // Readiness: DB-level counts via /appointments/readiness (no full list fetched)
  const [readiness, setReadiness] = useState({ canBook: false, clientsCount: 0, staffCount: 0, servicesCount: 0 });
  const [readinessError, setReadinessError] = useState(null);
  // Form data: minimal id+name lists for dropdowns, loaded only when dialog opens
  const [clients, setClients] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [services, setServices] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  // Filters
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [selectedStaffId, setSelectedStaffId] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog State: Book / Edit
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [formData, setFormData] = useState({
    clientId: '',
    staffId: '',
    serviceId: '',
    date: getTodayString(),
    startTime: '10:00',
    notes: '',
    status: APPOINTMENT_STATUS.CONFIRMED,
  });
  const [dialogError, setDialogError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dialog State: View Details
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingAppointment, setViewingAppointment] = useState(null);

  // Dialog State: Cancel Confirmation
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellingAppointment, setCancellingAppointment] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Status Action Menu
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuAppointment, setMenuAppointment] = useState(null);

  /**
   * Fetch readiness: uses DB-level countDocuments via /appointments/readiness.
   * Does NOT call clients/staff/services list APIs.
   */
  const fetchReadiness = useCallback(async () => {
    setReadinessError(null);
    try {
      const res = await appointmentsApi.getReadiness();
      setReadiness({
        canBook: res.canBook,
        clientsCount: res.clientsCount,
        staffCount: res.staffCount,
        servicesCount: res.servicesCount,
      });
    } catch (err) {
      // 403 stays as a permission error — not silently converted to canBook=false
      console.error('[Appointments] Readiness check failed:', err);
      setReadinessError(err.response?.data?.message || 'Could not load booking readiness.');
    }
  }, []);

  /**
   * Load minimal form data (id+name only) for dropdowns.
   * Called lazily only when the booking dialog is opened.
   */
  const loadFormData = useCallback(async () => {
    try {
      const res = await appointmentsApi.getFormData();
      setClients(res.clients || []);
      setStaffMembers(res.staff || []);
      setServices(res.services || []);
    } catch (err) {
      console.error('[Appointments] Form data load failed:', err);
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedDate) params.date = selectedDate;
      if (selectedStaffId && selectedStaffId !== 'all') params.staffId = selectedStaffId;
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;

      const res = await appointmentsApi.listAppointments(params);
      setAppointments(res.appointments || []);
    } catch (err) {
      console.error('[Appointments] Load failed:', err);
      setError(err.response?.data?.message || 'Failed to load appointments.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, selectedStaffId, statusFilter]);

  useEffect(() => {
    fetchReadiness();
  }, [fetchReadiness]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Selected Service in Form (to calculate and display end time dynamically)
  const selectedService = useMemo(() => {
    return services.find((s) => s.id === formData.serviceId || s._id === formData.serviceId);
  }, [services, formData.serviceId]);

  const computedEndTime = useMemo(() => {
    if (!formData.startTime || !selectedService?.durationInMinutes) return '';
    return calculateEndTime(formData.startTime, selectedService.durationInMinutes);
  }, [formData.startTime, selectedService]);

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((app) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      const clientName = app.client?.name?.toLowerCase() || '';
      const clientPhone = app.client?.phone?.toLowerCase() || '';
      const staffName = app.staff?.name?.toLowerCase() || '';
      const serviceName = app.service?.name?.toLowerCase() || '';
      return (
        clientName.includes(q) ||
        clientPhone.includes(q) ||
        staffName.includes(q) ||
        serviceName.includes(q)
      );
    });
  }, [appointments, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = appointments.length;
    const confirmed = appointments.filter((a) => a.status === APPOINTMENT_STATUS.CONFIRMED).length;
    const completed = appointments.filter((a) => a.status === APPOINTMENT_STATUS.COMPLETED).length;
    const cancelled = appointments.filter((a) => a.status === APPOINTMENT_STATUS.CANCELLED).length;
    return { total, confirmed, completed, cancelled };
  }, [appointments]);

  // Open Book Dialog — load form data lazily on first open
  const handleOpenCreate = async () => {
    setEditingAppointment(null);
    setFormData({
      clientId: '',
      staffId: '',
      serviceId: '',
      date: selectedDate || getTodayString(),
      startTime: '10:00',
      notes: '',
      status: APPOINTMENT_STATUS.CONFIRMED,
    });
    setDialogError('');
    setDialogOpen(true);
    // Load dropdown data only when dialog is opened
    await loadFormData();
  };

  // Open Edit Dialog
  const handleOpenEdit = async (app) => {
    setEditingAppointment(app);
    setFormData({
      clientId: app.client?.id || app.client?._id || '',
      staffId: app.staff?.id || app.staff?._id || '',
      serviceId: app.service?.id || app.service?._id || '',
      date: app.date,
      startTime: app.startTime,
      notes: app.notes || '',
      status: app.status,
    });
    setDialogError('');
    setDialogOpen(true);
    // Load dropdown data lazily when dialog opens
    await loadFormData();
  };

  // Open View Dialog
  const handleOpenView = (app) => {
    setViewingAppointment(app);
    setViewDialogOpen(true);
  };

  // Open Cancel Dialog
  const handleOpenCancel = (app) => {
    setCancellingAppointment(app);
    setCancelDialogOpen(true);
    setMenuAnchorEl(null);
  };

  // Submit Book/Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setDialogError('');

    if (!formData.clientId) {
      setDialogError('Please select a client.');
      return;
    }
    if (!formData.staffId) {
      setDialogError('Please select a staff member.');
      return;
    }
    if (!formData.serviceId) {
      setDialogError('Please select a salon service.');
      return;
    }
    if (!formData.date) {
      setDialogError('Please choose a date.');
      return;
    }
    if (!formData.startTime) {
      setDialogError('Please specify start time.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        clientId: formData.clientId,
        staffId: formData.staffId,
        serviceId: formData.serviceId,
        date: formData.date,
        startTime: formData.startTime,
        notes: formData.notes.trim(),
        status: formData.status,
      };

      if (editingAppointment) {
        await appointmentsApi.updateAppointment(editingAppointment.id, payload);
        setActionSuccess('Appointment updated successfully.');
      } else {
        await appointmentsApi.createAppointment(payload);
        setActionSuccess('Appointment booked successfully.');
      }

      setDialogOpen(false);
      await fetchAppointments();
    } catch (err) {
      console.error('[Appointments] Submit failed:', err);
      setDialogError(err.response?.data?.message || 'Failed to save appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Status Update
  const handleUpdateStatus = async (app, newStatus) => {
    try {
      await appointmentsApi.updateStatus(app.id, newStatus);
      setActionSuccess(`Appointment status updated to ${newStatus}.`);
      setMenuAnchorEl(null);
      await fetchAppointments();
    } catch (err) {
      console.error('[Appointments] Status update error:', err);
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  // Confirm Cancel
  const handleConfirmCancel = async () => {
    if (!cancellingAppointment) return;
    setIsCancelling(true);
    try {
      await appointmentsApi.deleteAppointment(cancellingAppointment.id);
      setActionSuccess('Appointment cancelled successfully.');
      setCancelDialogOpen(false);
      setCancellingAppointment(null);
      await fetchAppointments();
    } catch (err) {
      console.error('[Appointments] Cancel failed:', err);
      setError(err.response?.data?.message || 'Failed to cancel appointment.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <PageContainer
      title="Appointments"
      subtitle="Salon booking schedule, staff assignments, and calendar management"
      action={
        can('appointments', 'create') && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            disabled={!readiness.canBook}
            title={!readiness.canBook ? 'Add active clients, staff, and services first' : undefined}
            sx={{ textTransform: 'none', fontWeight: 600, px: 2.5 }}
          >
            Book Appointment
          </Button>
        )
      }
    >
      {/* Readiness error — 403 shown as error, not swallowed as canBook=false */}
      {readinessError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {readinessError}
        </Alert>
      )}

      {/* Prerequisite Alert if salon has no active clients/staff/services */}
      {!readinessError && !readiness.canBook && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          To book appointments, your salon must have active <strong>Clients</strong>, <strong>Staff members</strong>, and <strong>Services</strong> in the system.
          {readiness.clientsCount === 0 && <span> &mdash; No active clients.</span>}
          {readiness.staffCount === 0 && <span> &mdash; No active staff.</span>}
          {readiness.servicesCount === 0 && <span> &mdash; No active services.</span>}
        </Alert>
      )}

      {/* Action Success Alert */}
      {actionSuccess && (
        <Alert severity="success" onClose={() => setActionSuccess('')} sx={{ mb: 3 }}>
          {actionSuccess}
        </Alert>
      )}

      {/* Metric Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
        <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: 2 }}>
          <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'primary.light', color: 'primary.main', display: 'flex' }}>
            <CalendarMonthIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Total Bookings
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {stats.total}
            </Typography>
          </Box>
        </Card>

        <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: 2 }}>
          <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: '#eff6ff', color: '#1d4ed8', display: 'flex' }}>
            <CheckCircleIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Confirmed
            </Typography>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#1d4ed8' }}>
              {stats.confirmed}
            </Typography>
          </Box>
        </Card>

        <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: 2 }}>
          <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: '#f0fdf4', color: '#15803d', display: 'flex' }}>
            <CheckCircleIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Completed
            </Typography>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#15803d' }}>
              {stats.completed}
            </Typography>
          </Box>
        </Card>

        <Card sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: 2 }}>
          <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: '#fef2f2', color: '#b91c1c', display: 'flex' }}>
            <CancelIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              Cancelled
            </Typography>
            <Typography variant="h6" fontWeight={700} sx={{ color: '#b91c1c' }}>
              {stats.cancelled}
            </Typography>
          </Box>
        </Card>
      </Box>

      {/* Main Table Card */}
      <Card sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        {/* Filter Toolbar */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', lg: 'center' },
            gap: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* Status Tabs */}
          <Tabs
            value={statusFilter}
            onChange={(e, val) => setStatusFilter(val)}
            textColor="primary"
            indicatorColor="primary"
            variant="scrollable"
            scrollButtons="auto"
            sx={{ minHeight: 40 }}
          >
            <Tab label="All" value="all" sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40, py: 0 }} />
            <Tab label="Confirmed" value={APPOINTMENT_STATUS.CONFIRMED} sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40, py: 0 }} />
            <Tab label="Pending" value={APPOINTMENT_STATUS.PENDING} sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40, py: 0 }} />
            <Tab label="Completed" value={APPOINTMENT_STATUS.COMPLETED} sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40, py: 0 }} />
            <Tab label="Cancelled" value={APPOINTMENT_STATUS.CANCELLED} sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40, py: 0 }} />
          </Tabs>

          {/* Date, Staff, and Search Filter */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
            <TextField
              size="small"
              type="date"
              label="Date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 160 }}
            />

            <Button
              size="small"
              variant="outlined"
              onClick={() => setSelectedDate(selectedDate ? '' : getTodayString())}
              sx={{ textTransform: 'none', fontSize: '0.8rem', height: 40 }}
            >
              {selectedDate ? 'All Dates' : 'Today'}
            </Button>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Staff</InputLabel>
              <Select
                value={selectedStaffId}
                label="Staff"
                onChange={(e) => setSelectedStaffId(e.target.value)}
              >
                <MenuItem value="all">All Staff</MenuItem>
                {staffMembers.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name} ({s.title})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 220 }}
            />
          </Box>
        </Box>

        {/* Content Body */}
        {isLoading ? (
          <LoadingState message="Loading salon schedule..." />
        ) : error && appointments.length === 0 ? (
          <ErrorState message={error} onRetry={fetchAppointments} />
        ) : filteredAppointments.length === 0 ? (
          <EmptyState
            title="No Appointments Found"
            description={
              searchQuery || selectedDate || selectedStaffId !== 'all' || statusFilter !== 'all'
                ? 'No appointments match your active schedule filter criteria.'
                : 'No appointments are booked for this period. Click Book Appointment above.'
            }
            action={
              can('appointments', 'create') && !searchQuery ? (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleOpenCreate}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                  Book First Appointment
                </Button>
              ) : null
            }
          />
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 800 }}>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Date & Time</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Client</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Service</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Staff Specialist</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAppointments.map((app) => {
                  const statusConf = STATUS_CONFIG[app.status] || {
                    label: app.status,
                    bg: '#f1f5f9',
                    textColor: '#475569',
                  };

                  return (
                    <TableRow key={app.id} hover>
                      {/* Date & Time */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTimeIcon fontSize="small" color="primary" />
                          <Box>
                            <Typography variant="body2" fontWeight={700} color="text.primary">
                              {app.startTime} – {app.endTime}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {app.date}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Client */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon fontSize="small" color="action" />
                          <Box>
                            <Typography variant="body2" fontWeight={600} color="text.primary">
                              {app.client?.name || 'Unknown Client'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {app.client?.phone || 'No phone'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Service */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SpaIcon fontSize="small" color="secondary" />
                          <Box>
                            <Typography variant="body2" fontWeight={600} color="text.primary">
                              {app.service?.name || 'Unknown Service'}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.25 }}>
                              <Chip
                                label={`${app.service?.durationInMinutes || 0}m`}
                                size="small"
                                sx={{ height: 20, fontSize: '0.7rem' }}
                              />
                              <Chip
                                label={`$${Number(app.service?.price || 0).toFixed(2)}`}
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }}
                              />
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Staff */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BadgeIcon fontSize="small" color="action" />
                          <Box>
                            <Typography variant="body2" fontWeight={600} color="text.primary">
                              {app.staff?.name || 'Unassigned'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {app.staff?.title || 'Staff'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Chip
                          label={statusConf.label}
                          size="small"
                          sx={{
                            bgcolor: statusConf.bg,
                            color: statusConf.textColor,
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          }}
                        />
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => handleOpenView(app)}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {can('appointments', 'update') && app.status !== APPOINTMENT_STATUS.CANCELLED && (
                            <Tooltip title="Edit Appointment">
                              <IconButton size="small" onClick={() => handleOpenEdit(app)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          {can('appointments', 'update') && (
                            <Tooltip title="Change Status">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  setMenuAnchorEl(e.currentTarget);
                                  setMenuAppointment(app);
                                }}
                              >
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}

                          {(can('appointments', 'update') || can('appointments', 'delete')) &&
                            app.status !== APPOINTMENT_STATUS.CANCELLED && (
                              <Tooltip title="Cancel Booking">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleOpenCancel(app)}
                                >
                                  <CancelIcon fontSize="small" />
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
        )}
      </Card>

      {/* Menu: Status Quick Transition */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}
      >
        <MenuItem
          onClick={() => handleUpdateStatus(menuAppointment, APPOINTMENT_STATUS.CONFIRMED)}
          disabled={menuAppointment?.status === APPOINTMENT_STATUS.CONFIRMED}
        >
          <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: '#1d4ed8' }} /> Mark as Confirmed
        </MenuItem>
        <MenuItem
          onClick={() => handleUpdateStatus(menuAppointment, APPOINTMENT_STATUS.PENDING)}
          disabled={menuAppointment?.status === APPOINTMENT_STATUS.PENDING}
        >
          <PendingIcon fontSize="small" sx={{ mr: 1, color: '#b45309' }} /> Mark as Pending
        </MenuItem>
        <MenuItem
          onClick={() => handleUpdateStatus(menuAppointment, APPOINTMENT_STATUS.COMPLETED)}
          disabled={menuAppointment?.status === APPOINTMENT_STATUS.COMPLETED}
        >
          <CheckCircleIcon fontSize="small" sx={{ mr: 1, color: '#15803d' }} /> Mark as Completed
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => handleOpenCancel(menuAppointment)}
          disabled={menuAppointment?.status === APPOINTMENT_STATUS.CANCELLED}
          sx={{ color: 'error.main' }}
        >
          <CancelIcon fontSize="small" sx={{ mr: 1 }} /> Cancel Appointment
        </MenuItem>
      </Menu>

      {/* Modal: Book / Edit Appointment */}
      <Dialog open={dialogOpen} onClose={() => !isSubmitting && setDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editingAppointment ? 'Edit Appointment' : 'Book Salon Appointment'}
          </DialogTitle>
          <DialogContent dividers>
            {dialogError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {dialogError}
              </Alert>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
              {/* Client Selector */}
              <FormControl fullWidth required>
                <InputLabel>Client</InputLabel>
                <Select
                  value={formData.clientId}
                  label="Client"
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                >
                  {clients.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name} — {c.phone}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Service Selector */}
              <FormControl fullWidth required>
                <InputLabel>Service</InputLabel>
                <Select
                  value={formData.serviceId}
                  label="Service"
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                >
                  {services.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name} ({s.durationInMinutes} mins — ${Number(s.price).toFixed(2)})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Staff Member Selector */}
              <FormControl fullWidth required>
                <InputLabel>Staff Specialist</InputLabel>
                <Select
                  value={formData.staffId}
                  label="Staff Specialist"
                  onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                >
                  {staffMembers.map((st) => (
                    <MenuItem key={st.id} value={st.id}>
                      {st.name} — {st.title} {st.specialization ? `(${st.specialization})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Date & Start Time */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  label="Appointment Date"
                  type="date"
                  required
                  fullWidth
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  label="Start Time"
                  type="time"
                  required
                  fullWidth
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  helperText={`Hours: ${BUSINESS_HOURS.START}–${BUSINESS_HOURS.END}`}
                />
              </Box>

              {/* Dynamic Duration and End Time Notice */}
              {selectedService && computedEndTime && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'primary.light',
                    color: 'primary.dark',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <Typography variant="body2" fontWeight={600}>
                    Service Duration: {selectedService.durationInMinutes} minutes
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    Estimated End Time: {computedEndTime}
                  </Typography>
                </Box>
              )}

              {/* Initial Status Selector */}
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value={APPOINTMENT_STATUS.CONFIRMED}>Confirmed</MenuItem>
                  <MenuItem value={APPOINTMENT_STATUS.PENDING}>Pending</MenuItem>
                  <MenuItem value={APPOINTMENT_STATUS.COMPLETED}>Completed</MenuItem>
                  <MenuItem value={APPOINTMENT_STATUS.CANCELLED}>Cancelled</MenuItem>
                </Select>
              </FormControl>

              {/* Notes */}
              <TextField
                label="Appointment Notes (Optional)"
                fullWidth
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Special requests, treatment preferences, client allergies..."
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
              {isSubmitting ? 'Saving...' : editingAppointment ? 'Save Changes' : 'Confirm Booking'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal: View Appointment Details */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="xs" fullWidth>
        {viewingAppointment && (
          <>
            <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CalendarMonthIcon color="primary" />
              Appointment Overview
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                {/* Time & Status Banner */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Date & Schedule
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {viewingAppointment.startTime} – {viewingAppointment.endTime}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {viewingAppointment.date}
                    </Typography>
                  </Box>
                  <Chip
                    label={viewingAppointment.status}
                    sx={{
                      bgcolor: STATUS_CONFIG[viewingAppointment.status]?.bg || '#f1f5f9',
                      color: STATUS_CONFIG[viewingAppointment.status]?.textColor || '#475569',
                      fontWeight: 700,
                    }}
                  />
                </Box>

                <Divider />

                {/* Client Info */}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Client
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {viewingAppointment.client?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {viewingAppointment.client?.phone} • {viewingAppointment.client?.email || 'No email'}
                  </Typography>
                </Box>

                {/* Service Info */}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Service
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {viewingAppointment.service?.name}
                  </Typography>
                  <Typography variant="body2" color="primary.main" fontWeight={600}>
                    {viewingAppointment.service?.durationInMinutes} mins • ${Number(viewingAppointment.service?.price || 0).toFixed(2)}
                  </Typography>
                </Box>

                {/* Staff Info */}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Staff Specialist
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {viewingAppointment.staff?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {viewingAppointment.staff?.title}
                  </Typography>
                </Box>

                {viewingAppointment.notes && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Notes
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      {viewingAppointment.notes}
                    </Typography>
                  </Box>
                )}

                <Divider />

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    Booked: {new Date(viewingAppointment.createdAt).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Updated: {new Date(viewingAppointment.updatedAt).toLocaleDateString()}
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

      {/* Modal: Cancel Booking Confirmation */}
      <Dialog open={cancelDialogOpen} onClose={() => !isCancelling && setCancelDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Cancel Appointment?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ pt: 1 }}>
            Are you sure you want to cancel the booking for{' '}
            <strong>{cancellingAppointment?.client?.name}</strong> with{' '}
            <strong>{cancellingAppointment?.staff?.name}</strong> on{' '}
            <strong>{cancellingAppointment?.date}</strong> at{' '}
            <strong>{cancellingAppointment?.startTime}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setCancelDialogOpen(false)} disabled={isCancelling} sx={{ textTransform: 'none' }}>
            Back
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmCancel}
            disabled={isCancelling}
            startIcon={isCancelling && <CircularProgress size={18} color="inherit" />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Appointment'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default Appointments;
