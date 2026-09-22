import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  Avatar,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  CalendarMonth as CalendarMonthIcon,
  People as PeopleIcon,
  Layers as LayersIcon,
  Storefront as StorefrontIcon,
  CreditCard as CreditCardIcon,
  Logout as LogoutIcon,
  Spa as SpaIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { getAuthorizedNavItems } from '../routes/navigation';

const DRAWER_WIDTH = 260;

const iconMap = {
  Dashboard: <DashboardIcon />,
  CalendarMonth: <CalendarMonthIcon />,
  People: <PeopleIcon />,
  Layers: <LayersIcon />,
  Storefront: <StorefrontIcon />,
  CreditCard: <CreditCardIcon />,
};

const getRoleColor = (role) => {
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

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const authorizedNavItems = getAuthorizedNavItems(user?.role);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Top Application Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          ml: `${DRAWER_WIDTH}px`,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          color: '#0f172a',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#0f172a' }}>
              Salon Management Console
            </Typography>
            {user?.role && (
              <Chip
                label={user.role.replace('_', ' ')}
                size="small"
                color={getRoleColor(user.role)}
                sx={{ fontWeight: 600, fontSize: '0.75rem' }}
              />
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>

            <Avatar sx={{ bgcolor: '#6366f1', width: 36, height: 36, fontSize: '0.9rem', fontWeight: 600 }}>
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

      {/* Navigation Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e2e8f0',
          },
        }}
      >
        {/* Brand Header */}
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              color: '#ffffff',
            }}
          >
            <SpaIcon fontSize="medium" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#0f172a' }}>
              Salon ERP
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Multi-Tenant Cloud
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: '#f1f5f9' }} />

        {/* Navigation List */}
        <List sx={{ px: 2, py: 2 }}>
          {authorizedNavItems.map((item) => {
            const isSelected = location.pathname === item.path;
            return (
              <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  selected={isSelected}
                  sx={{
                    borderRadius: '8px',
                    py: 1,
                    px: 1.5,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(99, 102, 241, 0.08)',
                      color: '#6366f1',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: 'rgba(99, 102, 241, 0.12)',
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 38,
                      color: isSelected ? '#6366f1' : '#64748b',
                    }}
                  >
                    {iconMap[item.icon] || <DashboardIcon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{
                      fontSize: '0.9rem',
                      fontWeight: isSelected ? 600 : 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        {/* Tenant Scope indicator */}
        <Box sx={{ mt: 'auto', p: 2, m: 2, borderRadius: 2, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 600 }}>
            TENANT CONTEXT
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155', wordBreak: 'break-all' }}>
            {user?.salonId ? `Salon: ${user.salonId.substring(0, 10)}...` : 'Platform Admin (Global)'}
          </Typography>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          mt: 8,
          backgroundColor: '#f8fafc',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
