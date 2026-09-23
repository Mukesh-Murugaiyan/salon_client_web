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
  HowToReg as HowToRegIcon,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { usePermission } from '../../hooks/usePermission';
import { NAVIGATION_ITEMS } from '../../config/navigation';

const DRAWER_WIDTH = 240;

const ICON_MAP = {
  Dashboard: <DashboardIcon fontSize="small" />,
  Badge: <BadgeIcon fontSize="small" />,
  Spa: <SpaIcon fontSize="small" />,
  ManageAccounts: <ManageAccountsIcon fontSize="small" />,
  Security: <SecurityIcon fontSize="small" />,
  CalendarMonth: <CalendarMonthIcon fontSize="small" />,
  HowToReg: <HowToRegIcon fontSize="small" />,
  People: <PeopleIcon fontSize="small" />,
  CreditCard: <CreditCardIcon fontSize="small" />,
  Layers: <LayersIcon fontSize="small" />,
  Storefront: <StorefrontIcon fontSize="small" />,
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

  // Pure filtering based on dynamic permission check (handles single string or array of acceptable permissions)
  const visibleItems = NAVIGATION_ITEMS.filter((item) => {
    if (!item.requiredPermission) return true;
    if (Array.isArray(item.requiredPermission)) {
      return item.requiredPermission.some((perm) => hasPermission(perm));
    }
    return hasPermission(item.requiredPermission);
  });

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.25 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            color: '#ffffff',
            boxShadow: '0 4px 10px rgba(99, 102, 241, 0.25)',
          }}
        >
          <SpaIcon sx={{ fontSize: 20 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2, color: '#0f172a', fontSize: '0.95rem' }}>
            Salon ERP
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', display: 'block', fontWeight: 500 }} noWrap>
            {user?.salon?.name || 'Multi-Tenant SaaS'}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: '#f1f5f9' }} />

      {/* Navigation Links */}
      <List sx={{ px: 1.25, py: 1.25, flexGrow: 1 }}>
        {visibleItems.map((item) => {
          const isSelected = location.pathname === item.route;
          return (
            <ListItem key={item.value} disablePadding sx={{ mb: 0.35 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.route);
                  if (onClose) onClose();
                }}
                selected={isSelected}
                sx={{
                  borderRadius: '8px',
                  py: 0.65,
                  px: 1.25,
                  minHeight: 36,
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
                    minWidth: 32,
                    color: isSelected ? '#6366f1' : '#64748b',
                  }}
                >
                  {ICON_MAP[item.icon] || <DashboardIcon fontSize="small" />}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.8125rem',
                    fontWeight: isSelected ? 600 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

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
