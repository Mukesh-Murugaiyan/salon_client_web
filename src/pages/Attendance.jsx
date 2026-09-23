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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Avatar,
  Stack,
  Pagination,
} from '@mui/material';
import {
  DeleteOutline as DeleteIcon,
  Refresh as RefreshIcon,
  HowToReg as AttendanceIcon,
  Login as CheckInIcon,
  Logout as CheckOutIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import PageContainer from '../components/layout/PageContainer';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import AppModal from '../components/common/AppModal';
import DebouncedSearchInput from '../components/common/DebouncedSearchInput';
import { usePermission } from '../hooks/usePermission';
import { useAuth } from '../context/AuthContext';
import attendanceApi from '../api/attendanceApi';
import { DateTime } from '../utils/DateTime';

const Attendance = () => {
  const { hasPermission, can } = usePermission();
  const { user } = useAuth();

  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Deletion Confirmation Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Permissions
  const canDeleteAttendance = hasPermission('attendance:delete') || can(user?.permissions, 'attendance', 'delete');

  const fetchAttendance = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: 25,
      };
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (dateFilter) {
        params.date = dateFilter;
      }

      const res = await attendanceApi.listAttendance(params);
      const attendanceList = Array.isArray(res?.attendance) ? res.attendance : [];
      setRecords(attendanceList);
      setTotalPages(res?.totalPages || 1);
      setTotalRecords(res?.total !== undefined ? res.total : attendanceList.length);
    } catch (err) {
      console.error('[Attendance] Fetch failed:', err);
      setError(err.response?.data?.message || 'Failed to load salon attendance records.');
    } finally {
      setIsLoading(false);
    }
  }, [page, searchQuery, statusFilter, dateFilter]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleDeleteClick = (record) => {
    setRecordToDelete(record);
    setDeleteModalOpen(true);
    setActionSuccess('');
    setActionError('');
  };

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;

    try {
      setIsDeleting(true);
      setActionError('');
      await attendanceApi.deleteAttendance(recordToDelete._id || recordToDelete.id);
      setActionSuccess(
        `Attendance record for ${recordToDelete.userId?.name || 'employee'
        } was deleted. The employee is now eligible to check in again.`
      );
      setDeleteModalOpen(false);
      setRecordToDelete(null);
      fetchAttendance();
    } catch (err) {
      console.error('[Attendance] Delete failed:', err);
      setActionError(
        err.response?.data?.message || 'Failed to delete attendance record. Please try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDistance = (meters) => {
    if (meters === undefined || meters === null) return '—';
    const num = Number(meters);
    if (isNaN(num)) return '—';
    if (num < 1000) {
      return `${Math.round(num)} m`;
    }
    return `${(num / 1000).toFixed(2)} km`;
  };

  return (
    <PageContainer
      title="Attendance Records"
      subtitle={`Tenant-isolated attendance and GPS verification logs for ${user?.salon?.name || 'your salon'}.`}
      actions={
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchAttendance}
          disabled={isLoading}
          size="small"
        >
          Refresh
        </Button>
      }
    >
      {/* Notifications */}
      {actionSuccess && (
        <Alert
          severity="success"
          sx={{ mb: 2.5 }}
          onClose={() => setActionSuccess('')}
        >
          {actionSuccess}
        </Alert>
      )}

      {actionError && (
        <Alert
          severity="error"
          sx={{ mb: 2.5 }}
          onClose={() => setActionError('')}
        >
          {actionError}
        </Alert>
      )}

      {/* Filter and Search Bar */}
      <Card sx={{ mb: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderRadius: 2 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
          >
            <Box sx={{ flex: 1 }}>
              <DebouncedSearchInput
                placeholder="Search by employee name or email..."
                value={searchQuery}
                onChange={(val) => {
                  setSearchQuery(val);
                  setPage(1);
                }}
              />
            </Box>

            <TextField
              type="date"
              label="Filter Date"
              size="small"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setPage(1);
              }}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 160 }}
            />

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel id="status-filter-label">Status</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Status"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="PRESENT">Present</MenuItem>
                <MenuItem value="LATE">Late</MenuItem>
                <MenuItem value="HALF_DAY">Half Day</MenuItem>
              </Select>
            </FormControl>

            {(searchQuery || dateFilter || statusFilter !== 'all') && (
              <Button
                variant="text"
                size="small"
                onClick={() => {
                  setSearchQuery('');
                  setDateFilter('');
                  setStatusFilter('all');
                  setPage(1);
                }}
              >
                Clear
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Main Content View */}
      {isLoading ? (
        <LoadingState message="Loading salon attendance records..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAttendance} />
      ) : records.length === 0 ? (
        <EmptyState
          title="No Attendance Records Found"
          description={
            searchQuery || dateFilter || statusFilter !== 'all'
              ? 'No attendance records match your active filters.'
              : 'No attendance check-ins recorded for this salon yet.'
          }
          icon={<AttendanceIcon sx={{ fontSize: 40 }} />}
        />
      ) : (
        <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderRadius: 2 }}>
          <TableContainer>
            <Table sx={{ minWidth: 750 }}>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Check-In</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Check-Out</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Distance</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  {canDeleteAttendance && (
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      Actions
                    </TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((row) => {
                  const employeeName = row.userId?.name || 'Unknown Employee';
                  const employeeEmail = row.userId?.email || '—';
                  const checkInTimeStr = DateTime.formatTime(row.checkInTime);
                  const checkOutTimeStr = row.checkOutTime
                    ? DateTime.formatTime(row.checkOutTime)
                    : null;

                  return (
                    <TableRow key={row._id || row.id} hover>
                      {/* Employee Info */}
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar
                            sx={{
                              width: 34,
                              height: 34,
                              bgcolor: 'primary.light',
                              color: 'primary.contrastText',
                              fontSize: '0.875rem',
                              fontWeight: 600,
                            }}
                          >
                            {employeeName.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                              {employeeName}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {employeeEmail}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        <Typography variant="body2">{row.date}</Typography>
                      </TableCell>

                      {/* Check-In */}
                      <TableCell>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <CheckInIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {checkInTimeStr}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* Check-Out */}
                      <TableCell>
                        {checkOutTimeStr ? (
                          <Stack direction="row" spacing={0.75} alignItems="center">
                            <CheckOutIcon sx={{ fontSize: 16, color: 'info.main' }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {checkOutTimeStr}
                            </Typography>
                          </Stack>
                        ) : (
                          <Chip
                            label="Pending Check-Out"
                            size="small"
                            variant="outlined"
                            color="warning"
                            sx={{ fontSize: '0.75rem', fontWeight: 500 }}
                          />
                        )}
                      </TableCell>

                      {/* Distance */}
                      <TableCell>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <LocationIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {formatDistance(row.distanceFromSalon)}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Chip
                          label={row.status || 'PRESENT'}
                          size="small"
                          color={
                            row.status === 'LATE'
                              ? 'error'
                              : row.status === 'HALF_DAY'
                                ? 'warning'
                                : 'success'
                          }
                          sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                        />
                      </TableCell>

                      {/* Delete Action */}
                      {canDeleteAttendance && (
                        <TableCell align="right">
                          <Tooltip title="Delete record (Resets employee check-in state)">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick(row)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid', borderColor: 'divider' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, val) => setPage(val)}
                color="primary"
                size="small"
              />
            </Box>
          )}
        </Card>
      )}

      {/* Deletion Confirmation Modal */}
      <AppModal
        open={deleteModalOpen}
        onClose={() => !isDeleting && setDeleteModalOpen(false)}
        title="Delete Attendance Record"
        subtitle="This action resets the attendance state."
        maxWidth="xs"
        actions={
          <>
            <Button
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
              color="inherit"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              color="error"
              variant="contained"
              startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
            >
              {isDeleting ? 'Deleting...' : 'Delete Record'}
            </Button>
          </>
        }
      >
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'warning.main' }}>
            <WarningIcon color="warning" />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
              Reset Attendance Confirmation
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete the attendance record for{' '}
            <strong>{recordToDelete?.userId?.name || 'this employee'}</strong> on{' '}
            <strong>{recordToDelete?.date}</strong>?
          </Typography>

          <Alert severity="info" sx={{ fontSize: '0.82rem' }}>
            Deleting this attendance record will completely clear the employee&apos;s check-in
            (and check-out, if completed), allowing them to perform a fresh check-in immediately.
          </Alert>
        </Stack>
      </AppModal>
    </PageContainer>
  );
};

export default Attendance;
