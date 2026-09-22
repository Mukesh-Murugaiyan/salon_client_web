import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Reusable Page Container Wrapper
 * Standardizes title, subtitle, header actions, and responsive layout spacing across all views.
 *
 * @param {Object} props
 * @param {string} props.title - Main page title
 * @param {string} [props.subtitle] - Explanatory subtitle
 * @param {React.ReactNode} [props.action] - Header action button (singular alias)
 * @param {React.ReactNode} [props.actions] - Header action buttons (plural alias)
 * @param {React.ReactNode} props.children - Page content
 */
const PageContainer = ({ title, subtitle, action, actions, children }) => {
  // Support both `action` (singular) and `actions` (plural) prop names
  const headerActions = actions ?? action;
  return (
    <Box sx={{ width: '100%', maxWidth: '1400px', mx: 'auto' }}>
      {/* Header Bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 3.5,
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', mb: 0.5 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" sx={{ color: '#64748b' }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {headerActions && <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>{headerActions}</Box>}
      </Box>

      {/* Main Content Body */}
      <Box>{children}</Box>
    </Box>
  );
};

export default PageContainer;
