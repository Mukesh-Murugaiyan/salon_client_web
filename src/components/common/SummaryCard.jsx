import React from 'react';
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';

/**
 * Reusable Metric Summary Card
 * Pure UI presentation component — agnostic to roles and business logic.
 *
 * @param {Object} props
 * @param {string} props.label - Card title/metric name
 * @param {string|number} props.value - Metric value
 * @param {React.ReactNode} [props.icon] - Visual icon
 * @param {string} [props.color='#6366f1'] - Theme accent color
 * @param {string} [props.subtitle] - Optional helper text or percentage
 */
const SummaryCard = ({ label, title, value, icon, color = '#6366f1', subtitle }) => {
  const displayLabel = label || title;
  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        p: 1,
        borderRadius: 3,
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: '#cbd5e1',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
        },
      }}
    >
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b' }}>
            {displayLabel}
          </Typography>
          {icon && (
            <Avatar
              sx={{
                bgcolor: `${color}15`,
                color: color,
                width: 44,
                height: 44,
                borderRadius: 2.5,
              }}
            >
              {icon}
            </Avatar>
          )}
        </Box>

        <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', mb: 0.5 }}>
          {value !== undefined && value !== null ? value : '—'}
        </Typography>

        {subtitle && (
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
