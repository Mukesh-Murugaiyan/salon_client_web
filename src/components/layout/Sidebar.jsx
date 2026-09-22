import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  CalendarMonth as CalendarMonthIcon,
  People as PeopleIcon,
  CreditCard as CreditCardIcon,
  Layers as LayersIcon,
  Storefront as StorefrontIcon,
  Spa as SpaIcon,
  ManageAccounts as ManageAccountsIcon,
  Security as SecurityIcon,
  Badge as BadgeIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { usePermission } from '../../hooks/usePermission';
import { NAVIGATION_ITEMS } from '../../config/navigation';

const DRAWER_WIDTH = 260;

const ICON_MAP = {
  Dashboard: <DashboardIcon />,
  Badge: <BadgeIcon />,
  Spa: <SpaIcon />,
  ManageAccounts: <ManageAccountsIcon />,
  Security: <SecurityIcon />,
  CalendarMonth: <CalendarMonthIcon />,
  People: <PeopleIcon />,
  CreditCard: <CreditCardIcon />,
  Layers: <LayersIcon />,
  Storefront: <StorefrontIcon />,
};

/**
 * Dynamic Permission-Driven Sidebar Navigation Component
 * Configuration-driven and responsive. Renders only modules permitted by the user's role.
 *
 * @param {Object} props
 * @param {boolean} props.mobileOpen - Mobile drawer open state
 * @param {Function} props.onClose - Mobile drawer close handler
 */
const Sidebar = ({ mobileOpen, onClose }) => {
  const { user } = useAuth();
  const { hasPermission } = usePermission();
  const navigate = useNavigate();
  const location = useLocation();

  // Pure filtering based on dynamic permission check
  const visibleItems = NAVIGATION_ITEMS.filter((item) =>
    !item.requiredPermission || hasPermission(item.requiredPermission)
  );

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand Header */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 42,
            height: 42,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
          }}
        >
          <SpaIcon fontSize="medium" />
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#0f172a' }}>
            Salon ERP
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
            {user?.company?.name || 'Multi-Tenant SaaS'}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: '#f1f5f9' }} />

      {/* Navigation Links */}
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {visibleItems.map((item) => {
          const isSelected = location.pathname === item.route;
          return (
            <ListItem key={item.value} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.route);
                  if (onClose) onClose();
                }}
                selected={isSelected}
                sx={{
                  borderRadius: '10px',
                  py: 1,
                  px: 1.5,
                  transition: 'all 0.15s ease-in-out',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    color: '#6366f1',
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: 'rgba(99, 102, 241, 0.15)',
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
                  {ICON_MAP[item.icon] || <DashboardIcon />}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: isSelected ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Dynamic Tenant Context Footer Badge */}
      <Box sx={{ p: 2, m: 2, borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.05em' }}>
            TENANT CONTEXT
          </Typography>
          {user?.role?.code && (
            <Chip
              size="small"
              label={user.role.name || user.role.code}
              sx={{
                height: '20px',
                fontSize: '0.6875rem',
                fontWeight: 600,
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                color: '#6366f1',
              }}
            />
          )}
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
          {user?.company?.name || 'Default Company'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          Code: {user?.company?.code || 'SYSTEM'}
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      {/* Mobile Temporary Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e2e8f0',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Permanent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            backgroundColor: '#ffffff',
            borderRight: '1px solid #e2e8f0',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
