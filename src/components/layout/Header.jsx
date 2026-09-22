import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Button,
  Chip,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getRoleLabel } from '../../utils/role.utils';
import { ROUTES } from '../../constants/routes';

const DRAWER_WIDTH = 240;

const getRoleChipColor = (role) => {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'error';
    case 'OWNER':
      return 'primary';
    case 'RECEPTIONIST':
      return 'secondary';
    default:
      return 'default';
  }
};

/**
 * Reusable Header Component
 * Displays user identity, human-readable role label, and logout action.
 *
 * @param {Object} props
 * @param {Function} [props.onMobileMenuToggle] - Handler to toggle mobile drawer
 */
const Header = ({ onMobileMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    navigate(ROUTES.LOGIN.value, { replace: true });
  };

  const formattedRole = user?.role ? getRoleLabel(user.role) : 'Guest';

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        ml: { md: `${DRAWER_WIDTH}px` },
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        color: '#0f172a',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar
        sx={{
          justifyContent: 'space-between',
          minHeight: { xs: 52, sm: 58 },
          px: { xs: 1.5, sm: 2.5 },
        }}
      >
        {/* Left: Mobile Toggle & Page Brand Context */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            color="inherit"
            aria-label="open navigation drawer"
            edge="start"
            onClick={onMobileMenuToggle}
            sx={{ display: { md: 'none' }, mr: 0.5, color: '#334155', p: 0.75 }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              color: '#0f172a',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            Salon Management Console
          </Typography>

          {user?.role && (
            <Chip
              label={formattedRole}
              size="small"
              color={getRoleChipColor(user.role)}
              sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }}
            />
          )}
        </Box>

        {/* Right: User Identity & Logout Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          <Box sx={{ textAlign: 'right', display: { xs: 'none', md: 'block' } }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0f172a', lineHeight: 1.1, fontSize: '0.8125rem' }}>
              {user?.name || 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              {user?.email}
            </Typography>
          </Box>

          <Avatar
            sx={{
              bgcolor: '#6366f1',
              width: 32,
              height: 32,
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Avatar>

          <Tooltip title="Log out of system">
            <Box>
              {/* Desktop Logout Button */}
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                startIcon={<LogoutIcon fontSize="small" />}
                onClick={handleLogout}
                disabled={isLoggingOut}
                sx={{
                  display: { xs: 'none', sm: 'inline-flex' },
                  borderColor: '#e2e8f0',
                  color: '#64748b',
                  fontSize: '0.8125rem',
                  py: 0.5,
                  px: 1.25,
                  '&:hover': { borderColor: '#cbd5e1', backgroundColor: '#f1f5f9' },
                }}
              >
                Logout
              </Button>

              {/* Mobile Icon Button */}
              <IconButton
                size="small"
                onClick={handleLogout}
                disabled={isLoggingOut}
                sx={{
                  display: { xs: 'inline-flex', sm: 'none' },
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  p: 0.75,
                }}
                aria-label="Logout"
              >
                <LogoutIcon fontSize="small" />
              </IconButton>
            </Box>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
