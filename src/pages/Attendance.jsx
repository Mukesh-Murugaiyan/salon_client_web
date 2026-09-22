import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from '@mui/material';
import {
  HowToReg as HowToRegIcon,
  CheckCircle as CheckCircleIcon,
  MyLocation as MyLocationIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  CalendarToday as CalendarTodayIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import PageContainer from '../components/layout/PageContainer';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import { usePermission } from '../hooks/usePermission';
import { useAuth } from '../context/AuthContext';
import attendanceApi from '../api/attendanceApi';

const Attendance = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermission();

  const canCheckIn = hasPermission('attendance:check_in');
  const canViewLogs = hasPermission('attendance:view');
  const canManageLocation = hasPermission('companies:update') || hasPermission('attendance:view');

  // Live Digital Clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // Today Status & Check-In State
  const [todayRecord, setTodayRecord] = useState(null);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false);
  const [checkInError, setCheckInError] = useState(null);
  const [checkInSuccess, setCheckInSuccess] = useState('');

  // Salon Location Configuration State
  const [salonLocation, setSalonLocation] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    latitude: '',
    longitude: '',
    allowedRadiusInMeters: 100,
  });
  const [settingsError, setSettingsError] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState('');

  // Attendance History Logs State
  const [logs, setLogs] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logFilterDate, setLogFilterDate] = useState('');
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [logsError, setLogsError] = useState(null);

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch today's check-in status
  const fetchTodayStatus = useCallback(async () => {
    if (!canCheckIn) return;
    try {
      const res = await attendanceApi.getTodayAttendance();
      setTodayRecord(res.attendance || null);
      setHasCheckedInToday(!!res.attendance);
    } catch (err) {
      console.error('[Attendance] Failed to fetch today status:', err);
    }
  }, [canCheckIn]);

  // Fetch salon location configuration
  const fetchSalonLocation = useCallback(async () => {
    try {
      const res = await attendanceApi.getLocationSettings();
      if (res.location) {
        setSalonLocation(res.location);
        setSettingsForm({
          latitude: res.location.latitude ?? '',
          longitude: res.location.longitude ?? '',
          allowedRadiusInMeters: res.location.allowedRadiusInMeters ?? 100,
        });
      }
    } catch (err) {
      console.error('[Attendance] Failed to fetch salon location:', err);
    }
  }, []);

  // Fetch attendance history logs
  const fetchLogs = useCallback(async () => {
    if (!canViewLogs) return;
    setIsLoadingLogs(true);
    setLogsError(null);
    try {
      const params = {};
      if (logFilterDate) params.date = logFilterDate;
      const res = await attendanceApi.listAttendance(params);
      setLogs(res.attendance || []);
      setTotalLogs(res.total || 0);
    } catch (err) {
      console.error('[Attendance] Failed to fetch logs:', err);
      setLogsError(err.response?.data?.message || 'Failed to load attendance logs.');
    } finally {
      setIsLoadingLogs(false);
    }
  }, [canViewLogs, logFilterDate]);

  useEffect(() => {
    fetchTodayStatus();
    fetchSalonLocation();
    if (canViewLogs) {
      fetchLogs();
    }
  }, [fetchTodayStatus, fetchSalonLocation, fetchLogs, canViewLogs]);

  // Trigger browser geolocation and submit check-in to backend
  const handleCheckIn = () => {
    setCheckInError(null);
    setCheckInSuccess('');

    if (!navigator.geolocation) {
      setCheckInError({
        error: 'GEOLOCATION_UNSUPPORTED',
        message: 'Geolocation is not supported by your web browser.',
      });
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setIsLocating(false);
        setIsSubmittingCheckIn(true);
        try {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          const res = await attendanceApi.checkIn({ latitude, longitude });
          setTodayRecord(res.attendance);
          setHasCheckedInToday(true);
          setCheckInSuccess(
            `Check-in successful! Recorded at ${new Date(res.attendance.checkInTime).toLocaleTimeString()} (${res.attendance.distanceFromSalon}m from salon).`
          );
          if (canViewLogs) {
            fetchLogs();
          }
        } catch (err) {
          console.error('[Attendance] Check-in failed:', err);
          const errData = err.response?.data || {};
          setCheckInError({
            error: errData.error || 'CHECK_IN_FAILED',
            message:
              errData.message ||
              (errData.error === 'OUT_OF_RANGE'
                ? 'You are outside the permitted salon radius for check-in.'
                : 'Check-in failed. Please try again.'),
            details: errData.details,
          });
        } finally {
          setIsSubmittingCheckIn(false);
        }
      },
      (geoError) => {
        setIsLocating(false);
        let errorMsg = 'Unable to retrieve your location.';
        if (geoError.code === geoError.PERMISSION_DENIED) {
          errorMsg = 'Location permission was denied. Please allow location access in your browser settings to check in.';
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          errorMsg = 'Location information is currently unavailable. Please check your device GPS.';
        } else if (geoError.code === geoError.TIMEOUT) {
          errorMsg = 'Acquiring GPS location timed out. Please try again.';
        }
        setCheckInError({ error: 'GPS_ERROR', message: errorMsg });
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  };

  // Calibrate salon location settings to browser's current position
  const handleUseCurrentLocationForSettings = () => {
    if (!navigator.geolocation) {
      setSettingsError('Geolocation not supported.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSettingsForm((prev) => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        }));
      },
      (err) => {
        setSettingsError('Failed to retrieve current location: ' + err.message);
      },
      { enableHighAccuracy: true }
    );
  };

  // Save updated salon geo-fence configuration
  const handleSaveLocationSettings = async () => {
    setSettingsError('');
    setSettingsSuccess('');
    setIsSavingLocation(true);
    try {
      const lat = parseFloat(settingsForm.latitude);
      const lng = parseFloat(settingsForm.longitude);
      const rad = parseInt(settingsForm.allowedRadiusInMeters, 10);

      if (Number.isNaN(lat) || lat < -90 || lat > 90) {
        throw new Error('Latitude must be a valid number between -90 and 90.');
      }
      if (Number.isNaN(lng) || lng < -180 || lng > 180) {
        throw new Error('Longitude must be a valid number between -180 and 180.');
      }
      if (Number.isNaN(rad) || rad < 1) {
        throw new Error('Allowed radius must be at least 1 meter.');
      }

      const res = await attendanceApi.updateLocationSettings({
        latitude: lat,
        longitude: lng,
        allowedRadiusInMeters: rad,
      });

      setSalonLocation(res.location);
      setSettingsSuccess('Salon geo-fence settings updated successfully.');
      setTimeout(() => {
        setIsSettingsOpen(false);
        setSettingsSuccess('');
      }, 1200);
    } catch (err) {
      setSettingsError(err.response?.data?.message || err.message || 'Failed to update location settings.');
    } finally {
      setIsSavingLocation(false);
    }
  };

  // Filter logs locally by user search
  const filteredLogs = logs.filter((log) => {
    if (!logSearchQuery) return true;
    const q = logSearchQuery.toLowerCase();
    const userName = log.userId?.name?.toLowerCase() || '';
    const userEmail = log.userId?.email?.toLowerCase() || '';
    return userName.includes(q) || userEmail.includes(q);
  });

  return (
    <PageContainer
      title="Attendance & Geo-Fencing"
      subtitle="Server-verified employee check-in with GPS proximity enforcement"
      action={
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => {
              fetchTodayStatus();
              fetchSalonLocation();
              if (canViewLogs) fetchLogs();
            }}
            sx={{ textTransform: 'none', borderRadius: '8px', color: '#475569', borderColor: '#cbd5e1' }}
          >
            Refresh
          </Button>
          {canManageLocation && (
            <Button
              variant="outlined"
              startIcon={<SettingsIcon />}
              onClick={() => setIsSettingsOpen(true)}
              sx={{ textTransform: 'none', borderRadius: '8px', color: '#6366f1', borderColor: '#6366f1' }}
            >
              Salon Geo-Fence Settings
            </Button>
          )}
        </Box>
      }
    >
      {/* Top Section: Check-In Card & Location Info */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Check-In Action Card */}
        <Grid item xs={12} md={7}>
          <Card
            sx={{
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              overflow: 'hidden',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header with live clock */}
            <Box
              sx={{
                p: 3,
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '10px',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <HowToRegIcon fontSize="medium" />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    Daily Check-In
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarTodayIcon sx={{ fontSize: 12 }} />
                    {currentTime.toLocaleDateString(undefined, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ textAlign: 'right' }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    fontFamily: 'monospace',
                  }}
                >
                  {currentTime.toLocaleTimeString()}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Live System Time
                </Typography>
              </Box>
            </Box>

            <CardContent sx={{ p: 3.5, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {/* Feedback Alerts */}
              {checkInSuccess && (
                <Alert severity="success" sx={{ mb: 2.5, borderRadius: '8px' }} onClose={() => setCheckInSuccess('')}>
                  {checkInSuccess}
                </Alert>
              )}

              {checkInError && (
                <Alert
                  severity="error"
                  icon={<WarningAmberIcon />}
                  sx={{ mb: 2.5, borderRadius: '8px' }}
                  onClose={() => setCheckInError(null)}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {checkInError.error === 'OUT_OF_RANGE'
                      ? 'Out of Permitted Range (HTTP 403)'
                      : checkInError.error === 'DUPLICATE_CHECK_IN'
                      ? 'Already Checked In'
                      : 'Check-In Verification Failed'}
                  </Typography>
                  <Typography variant="body2">{checkInError.message}</Typography>
                  {checkInError.details && (
                    <Typography variant="caption" sx={{ mt: 0.5, display: 'block', fontWeight: 600 }}>
                      Distance: {checkInError.details.distance}m (Allowed Radius: {checkInError.details.allowedRadius}m)
                    </Typography>
                  )}
                </Alert>
              )}

              {/* Already Checked-In State */}
              {hasCheckedInToday && todayRecord ? (
                <Box
                  sx={{
                    p: 3,
                    borderRadius: '12px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    textAlign: 'center',
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 52, color: '#16a34a', mb: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#15803d' }}>
                    Checked In For Today
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#166534', mt: 0.5 }}>
                    Your attendance has been recorded and verified by server geo-fencing.
                  </Typography>

                  <Divider sx={{ my: 2, borderColor: '#dcfce7' }} />

                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={4}>
                      <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600 }}>
                        CHECK-IN TIME
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#14532d' }}>
                        {new Date(todayRecord.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600 }}>
                        PROXIMITY
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 700, color: '#14532d' }}>
                        {todayRecord.distanceFromSalon} m
                      </Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="caption" sx={{ color: '#166534', fontWeight: 600 }}>
                        STATUS
                      </Typography>
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={todayRecord.status}
                          color="success"
                          size="small"
                          sx={{ fontWeight: 700, borderRadius: '6px' }}
                        />
                      </Box>
                    </Grid>
                  </Grid>

                  <Typography variant="caption" sx={{ display: 'block', color: '#4ade80', mt: 2, fontFamily: 'monospace' }}>
                    GPS: {todayRecord.latitude?.toFixed(5)}, {todayRecord.longitude?.toFixed(5)}
                  </Typography>
                </Box>
              ) : (
                /* Ready to Check-In State */
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body1" sx={{ color: '#475569', mb: 1, fontWeight: 500 }}>
                    Please enable browser GPS to record your attendance. The server verifies your location against the salon perimeter.
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mb: 3 }}>
                    Allowed radius from salon: {salonLocation?.allowedRadiusInMeters || 100} meters
                  </Typography>

                  <Button
                    variant="contained"
                    size="large"
                    startIcon={
                      isLocating || isSubmittingCheckIn ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <MyLocationIcon />
                      )
                    }
                    onClick={handleCheckIn}
                    disabled={isLocating || isSubmittingCheckIn || !canCheckIn}
                    sx={{
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                      py: 1.5,
                      px: 4,
                      borderRadius: '10px',
                      fontSize: '1rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)',
                      },
                    }}
                  >
                    {isLocating
                      ? 'Acquiring GPS Location...'
                      : isSubmittingCheckIn
                      ? 'Verifying Geo-Fence...'
                      : 'Acquire Location & Check In'}
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Salon Location & Radius Info Card */}
        <Grid item xs={12} md={5}>
          <Card
            sx={{
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
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
                  <LocationOnIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                    Salon Geo-Fence Perimeter
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Authorized check-in boundary
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 1.5 }} />

              <Box sx={{ my: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  CONFIGURATION STATUS
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={salonLocation?.isConfigured ? 'Location Configured' : 'Coordinates Not Set'}
                    color={salonLocation?.isConfigured ? 'success' : 'warning'}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Box>

              <Grid container spacing={2} sx={{ my: 1 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    SALON LATITUDE
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b', fontFamily: 'monospace' }}>
                    {salonLocation?.latitude != null ? salonLocation.latitude.toFixed(6) : '—'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    SALON LONGITUDE
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e293b', fontFamily: 'monospace' }}>
                    {salonLocation?.longitude != null ? salonLocation.longitude.toFixed(6) : '—'}
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  MAXIMUM PERMITTED RADIUS
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#6366f1' }}>
                  {salonLocation?.allowedRadiusInMeters || 100} meters
                </Typography>
              </Box>
            </CardContent>

            {canManageLocation && (
              <Box sx={{ p: 2, px: 3, backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={() => setIsSettingsOpen(true)}
                  sx={{ textTransform: 'none', borderRadius: '8px', color: '#6366f1', borderColor: '#cbd5e1' }}
                >
                  Configure Salon Coordinates
                </Button>
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Attendance History Section (Visible if user has attendance:view) */}
      {canViewLogs && (
        <Card sx={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <Box
            sx={{
              p: 2.5,
              px: 3,
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: '#ffffff',
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1e293b' }}>
                Company Attendance Logs
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Verified records ({filteredLogs.length} total)
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              <TextField
                size="small"
                type="date"
                label="Filter by Date"
                value={logFilterDate}
                onChange={(e) => setLogFilterDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 170 }}
              />

              <TextField
                size="small"
                placeholder="Search employee..."
                value={logSearchQuery}
                onChange={(e) => setLogSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 220 }}
              />

              {logFilterDate && (
                <Button
                  size="small"
                  variant="text"
                  onClick={() => setLogFilterDate('')}
                  sx={{ textTransform: 'none', color: '#64748b' }}
                >
                  Clear Date
                </Button>
              )}
            </Box>
          </Box>

          {isLoadingLogs ? (
            <LoadingState message="Loading attendance records..." />
          ) : logsError ? (
            <ErrorState message={logsError} onRetry={fetchLogs} />
          ) : filteredLogs.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <HowToRegIcon sx={{ fontSize: 48, color: '#cbd5e1', mb: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#475569' }}>
                No attendance records found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Employees can check in once per day from within the configured salon radius.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Employee / User</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Check-In Time</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Proximity</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>GPS Coordinates</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }} align="center">
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log._id} hover>
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
                              fontWeight: 700,
                              fontSize: '0.8125rem',
                            }}
                          >
                            {log.userId?.name ? log.userId.name.charAt(0).toUpperCase() : 'U'}
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                              {log.userId?.name || 'Unknown User'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {log.userId?.email || '—'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#334155' }}>{log.date}</TableCell>
                      <TableCell sx={{ color: '#475569' }}>
                        {new Date(log.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#16a34a' }}>
                          {log.distanceFromSalon} m
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: '#64748b', fontSize: '0.8125rem', fontFamily: 'monospace' }}>
                        {log.latitude?.toFixed(5)}, {log.longitude?.toFixed(5)}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={log.status}
                          size="small"
                          color={log.status === 'PRESENT' ? 'success' : 'default'}
                          sx={{ fontWeight: 600, borderRadius: '6px' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      )}

      {/* Dialog: Configure Salon Geo-Fence Coordinates */}
      <Dialog
        open={isSettingsOpen}
        onClose={() => !isSavingLocation && setIsSettingsOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#1e293b' }}>
          Salon Geo-Fence Settings
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {settingsSuccess && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: '8px' }}>
              {settingsSuccess}
            </Alert>
          )}
          {settingsError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '8px' }}>
              {settingsError}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Configure the physical GPS coordinates and allowable radius for this salon. Check-in requests beyond this radius are automatically rejected by the server Haversine formula.
          </Typography>

          <Button
            variant="outlined"
            startIcon={<MyLocationIcon />}
            onClick={handleUseCurrentLocationForSettings}
            sx={{ mb: 3, textTransform: 'none', borderRadius: '8px', color: '#6366f1', borderColor: '#cbd5e1' }}
          >
            Use My Current Device Location
          </Button>

          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Latitude (-90 to 90)"
                type="number"
                value={settingsForm.latitude}
                onChange={(e) => setSettingsForm({ ...settingsForm, latitude: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Longitude (-180 to 180)"
                type="number"
                value={settingsForm.longitude}
                onChange={(e) => setSettingsForm({ ...settingsForm, longitude: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Allowed Radius (Meters)"
                type="number"
                value={settingsForm.allowedRadiusInMeters}
                onChange={(e) => setSettingsForm({ ...settingsForm, allowedRadiusInMeters: e.target.value })}
                helperText="Maximum allowed distance between employee device and salon coordinates (e.g. 100 or 200m)."
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, px: 3 }}>
          <Button
            onClick={() => setIsSettingsOpen(false)}
            disabled={isSavingLocation}
            sx={{ textTransform: 'none', color: '#64748b' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveLocationSettings}
            disabled={isSavingLocation}
            sx={{
              textTransform: 'none',
              borderRadius: '8px',
              px: 3,
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              fontWeight: 600,
            }}
          >
            {isSavingLocation ? <CircularProgress size={20} color="inherit" /> : 'Save Geo-Fence Settings'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default Attendance;
