import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';

/**
 * Authenticated Application Shell Layout
 * Integrates responsive Sidebar, Header, and page content Outlet.
 * Enforces strict viewport width limits to eliminate horizontal scroll.
 */
const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100vw',
        overflowX: 'hidden',
        backgroundColor: '#f8fafc',
      }}
    >
      {/* Top Navigation Header */}
      <Header onMobileMenuToggle={handleDrawerToggle} />

      {/* Navigation Drawer (Sidebar) */}
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main Page Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 2, md: 3 },
          width: { xs: '100%', md: 'calc(100% - 240px)' },
          maxWidth: { xs: '100%', md: 'calc(100% - 240px)' },
          minHeight: '100vh',
          boxSizing: 'border-box',
          overflowX: 'hidden',
          backgroundColor: '#f8fafc',
        }}
      >
        {/* Spacer matching fixed AppBar height */}
        <Toolbar sx={{ minHeight: { xs: 52, sm: 58 } }} />
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
