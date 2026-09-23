import React, { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Spa as SpaIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants/routes';
import { Validation } from '../utils/Validation';
import { StringUtils } from '../utils/StringUtils';
import { AppConfig } from '../config/AppConfig';

const Login = () => {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // If already authenticated, redirect to dashboard or intended route
  if (isAuthenticated && user) {
    const from = location.state?.from?.pathname || ROUTES.DASHBOARD.value;
    return <Navigate to={from} replace />;
  }

  const validate = () => {
    const errors = {};
    const trimmedEmail = StringUtils.trim(email);
    if (!trimmedEmail) {
      errors.email = 'Email is required';
    } else if (!Validation.isValidEmail(trimmedEmail)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage('');

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await login(email.trim(), password);
      const targetRoute = location.state?.from?.pathname || ROUTES.DASHBOARD.value;
      navigate(targetRoute, { replace: true });
    } catch (err) {
      const apiMessage =
        err.response?.data?.message ||
        (err.response?.status === 401
          ? 'Invalid email or password.'
          : err.response?.status === 403
            ? 'Your account is disabled. Please contact the administrator.'
            : 'Unable to connect to the authentication service. Please check backend server.');
      setErrorMessage(apiMessage);
    } finally {
      setIsSubmitting(false);
    }
  };



  const isFormValid = email.trim().length > 0 && password.length > 0;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        px: 2,
        py: 4,
      }}
    >
      <Card
        elevation={0}
        sx={{
          maxWidth: 400,
          width: '100%',
          borderRadius: 3,
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          {/* Header & Logo */}
          <Box sx={{ textAlign: 'center', mb: 2.5 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
                color: '#ffffff',
                mb: 1.25,
                boxShadow: '0 4px 10px rgba(99, 102, 241, 0.25)',
              }}
            >
              <SpaIcon fontSize="small" />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.15rem' }}>
              Salon ERP Portal
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
              Dynamic Multi-Tenant SaaS Platform
            </Typography>
          </Box>

          {/* Global Alert */}
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {errorMessage}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              id="login-email"
              label="Email Address"
              type="email"
              fullWidth
              margin="dense"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
              disabled={isSubmitting}
              autoComplete="email"
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#94a3b8' }} fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              id="login-password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="dense"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
              disabled={isSubmitting}
              autoComplete="current-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#94a3b8' }} fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              id="login-submit-btn"
              type="submit"
              fullWidth
              variant="contained"
              disabled={!isFormValid || isSubmitting}
              sx={{
                mt: 2,
                mb: 1.5,
                py: 0.9,
                fontSize: '0.875rem',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                },
              }}
            >
              {isSubmitting ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={18} color="inherit" />
                  <span>Signing in...</span>
                </Box>
              ) : (
                'Sign In'
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
