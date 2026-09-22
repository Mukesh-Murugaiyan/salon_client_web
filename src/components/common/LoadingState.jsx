import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Reusable Loading State Component
 *
 * @param {Object} props
 * @param {string} [props.message='Loading data...']
 * @param {string} [props.minHeight='280px']
 */
const LoadingState = ({ message = 'Loading data...', minHeight = '280px' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        gap: 2,
        p: 4,
        backgroundColor: '#ffffff',
        borderRadius: 3,
        border: '1px solid #e2e8f0',
      }}
    >
      <CircularProgress size={36} sx={{ color: '#6366f1' }} />
      <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingState;
