import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar } from '@mui/material';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';

/**
 * Authenticated Application Shell Layout
 * Integrates responsive Sidebar, Header, and page content Outlet.
 */
const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Top Navigation Header */}
      <Header onMobileMenuToggle={handleDrawerToggle} />

      {/* Navigation Drawer (Sidebar) */}
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main Page Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, sm: 3.5, md: 4 },
          width: { md: `calc(100% - 260px)` },
          minHeight: '100vh',
          backgroundColor: '#f8fafc',
        }}
      >
        {/* Spacer for fixed AppBar */}
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
