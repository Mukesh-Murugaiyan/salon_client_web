import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Inbox as InboxIcon } from '@mui/icons-material';

/**
 * Reusable Empty State Component
 *
 * @param {Object} props
 * @param {string} [props.title='No Data Found']
 * @param {string} [props.message]
 * @param {string} [props.description]
 * @param {React.ReactNode} [props.icon]
 * @param {React.ReactNode} [props.action]
 * @param {string} [props.actionLabel]
 * @param {Function} [props.onAction]
 */
const EmptyState = ({
  title = 'No Data Found',
  message,
  description = 'No records are currently available.',
  icon,
  action,
  actionLabel,
  onAction,
}) => {
  const displayMessage = message || description;

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2.5, sm: 3.5 },
        minHeight: '200px',
        textAlign: 'center',
        borderRadius: 2.5,
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
      }}
    >
      <Box sx={{ color: '#94a3b8', mb: 1.25 }}>
        {icon || <InboxIcon sx={{ fontSize: 38 }} />}
      </Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#334155', mb: 0.5, fontSize: '0.95rem' }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 400, fontSize: '0.8125rem' }}>
        {displayMessage}
      </Typography>
      {action ? (
        <Box sx={{ mt: 2 }}>{action}</Box>
      ) : actionLabel && onAction ? (
        <Button
          variant="contained"
          size="small"
          onClick={onAction}
          sx={{ mt: 2, textTransform: 'none', fontWeight: 600 }}
        >
          {actionLabel}
        </Button>
      ) : null}
    </Paper>
  );
};

export default EmptyState;
