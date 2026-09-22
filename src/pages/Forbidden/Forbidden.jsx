import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Button } from '@mui/material';
import { GppBad as ForbiddenIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { getDefaultRouteForRole } from '../../utils/route.utils';
import { getRoleLabel } from '../../utils/role.utils';

/**
 * Dedicated 403 Forbidden Access Page
 */
const Forbidden = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleReturn = () => {
    const route = getDefaultRouteForRole(user?.role);
    navigate(route, { replace: true });
  };

  const formattedRole = user?.role ? getRoleLabel(user.role) : 'Guest';

  return (
    <Box
      sx={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Card
        elevation={0}
        sx={{
          maxWidth: 480,
          width: '100%',
          border: '1px solid #fee2e2',
          backgroundColor: '#fff5f5',
          borderRadius: 3,
          p: 2,
          textAlign: 'center',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <ForbiddenIcon sx={{ fontSize: 60, color: '#ef4444', mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#991b1b', mb: 1 }}>
            403
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#991b1b', mb: 1.5 }}>
            Access Denied
          </Typography>
          <Typography variant="body1" sx={{ color: '#7f1d1d', mb: 1 }}>
            You do not have permission to access this page.
          </Typography>
          <Typography variant="body2" sx={{ color: '#991b1b', mb: 3 }}>
            Current Role: <strong>{formattedRole}</strong>
          </Typography>

          <Button
            variant="contained"
            color="error"
            startIcon={<ArrowBackIcon />}
            onClick={handleReturn}
            sx={{ borderRadius: 2, px: 3, py: 1 }}
          >
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Forbidden;
