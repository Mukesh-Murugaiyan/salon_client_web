import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Inbox as InboxIcon } from '@mui/icons-material';

/**
 * Reusable Empty State Component
 *
 * @param {Object} props
 * @param {string} [props.title='No Data Found']
 * @param {string} [props.message='No records are currently available.']
 * @param {React.ReactNode} [props.icon]
 */
const EmptyState = ({
  title = 'No Data Found',
  message = 'No records are currently available.',
  icon,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        minHeight: '240px',
        textAlign: 'center',
        borderRadius: 3,
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
      }}
    >
      <Box sx={{ color: '#94a3b8', mb: 1.5 }}>
        {icon || <InboxIcon sx={{ fontSize: 44 }} />}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 600, color: '#334155', mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 400 }}>
        {message}
      </Typography>
    </Paper>
  );
};

export default EmptyState;
