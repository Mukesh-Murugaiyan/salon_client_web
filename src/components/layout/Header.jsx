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

const DRAWER_WIDTH = 260;

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
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
        {/* Left: Mobile Toggle & Page Brand Context */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            color="inherit"
            aria-label="open navigation drawer"
            edge="start"
            onClick={onMobileMenuToggle}
            sx={{ display: { md: 'none' }, mr: 1, color: '#334155' }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" sx={{ fontWeight: 600, color: '#0f172a', display: { xs: 'none', sm: 'block' } }}>
            Salon Management Console
          </Typography>

          {user?.role && (
            <Chip
              label={formattedRole}
              size="small"
              color={getRoleChipColor(user.role)}
              sx={{ fontWeight: 600, fontSize: '0.75rem' }}
            />
          )}
        </Box>

        {/* Right: User Identity & Logout Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>
              {user?.name || 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>

          <Avatar
            sx={{
              bgcolor: '#6366f1',
              width: 36,
              height: 36,
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </Avatar>

          <Tooltip title="Log out of system">
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              disabled={isLoggingOut}
              sx={{
                borderColor: '#e2e8f0',
                color: '#64748b',
                '&:hover': { borderColor: '#cbd5e1', backgroundColor: '#f1f5f9' },
              }}
            >
              Logout
            </Button>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
