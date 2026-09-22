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
        borderRadius: 2.5,
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: '#cbd5e1',
          boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.06)',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.25 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#64748b', fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}>
            {displayLabel}
          </Typography>
          {icon && (
            <Avatar
              sx={{
                bgcolor: `${color}15`,
                color: color,
                width: { xs: 34, sm: 38 },
                height: { xs: 34, sm: 38 },
                borderRadius: 2,
              }}
            >
              {React.cloneElement(icon, { sx: { fontSize: { xs: 18, sm: 20 } } })}
            </Avatar>
          )}
        </Box>

        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: '#0f172a',
            letterSpacing: '-0.02em',
            mb: 0.25,
            fontSize: { xs: '1.25rem', sm: '1.45rem' },
          }}
        >
          {value !== undefined && value !== null ? value : '—'}
        </Typography>

        {subtitle && (
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.75rem' }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
