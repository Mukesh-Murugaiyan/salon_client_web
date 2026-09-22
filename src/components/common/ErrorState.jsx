import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { ErrorOutline as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

/**
 * Reusable Error State Component with Retry Action
 *
 * @param {Object} props
 * @param {string} [props.title='Unable to load data']
 * @param {string} [props.message='An unexpected error occurred while fetching information.']
 * @param {Function} [props.onRetry]
 */
const ErrorState = ({
  title = 'Unable to load data',
  message = 'An unexpected error occurred while fetching information.',
  onRetry,
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
        minHeight: '260px',
        textAlign: 'center',
        borderRadius: 3,
        border: '1px solid #fee2e2',
        backgroundColor: '#fff5f5',
      }}
    >
      <ErrorIcon sx={{ fontSize: 48, color: '#ef4444', mb: 1.5 }} />
      <Typography variant="h6" sx={{ fontWeight: 600, color: '#991b1b', mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: '#7f1d1d', maxWidth: 440, mb: 2.5 }}>
        {message}
      </Typography>

      {onRetry && (
        <Button
          variant="outlined"
          color="error"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={onRetry}
          sx={{ borderRadius: 2 }}
        >
          Try Again
        </Button>
      )}
    </Paper>
  );
};

export default ErrorState;
