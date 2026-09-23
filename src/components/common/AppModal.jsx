import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

/**
 * Reusable AppModal Component
 *
 * Features:
 * - Sticky modal header while scrolling
 * - Prominent Close (X) icon at the top-right
 * - Standardized responsive dialog container and footer actions
 */
const AppModal = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  disableClose = false,
  stickyHeader = true,
  contentSx = {},
  dialogSx = {},
  ...rest
}) => {
  const handleClose = (event, reason) => {
    if (disableClose && (reason === 'backdropClick' || reason === 'escapeKeyDown')) {
      return;
    }
    if (!disableClose && onClose) {
      onClose(event, reason);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: { xs: '12px', sm: '16px' },
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
        },
        ...dialogSx,
      }}
      {...rest}
    >
      {/* Sticky Header with Title and Close (X) Button */}
      {title && (
        <DialogTitle
          sx={{
            m: 0,
            px: { xs: 2, sm: 2.5 },
            py: { xs: 1.5, sm: 1.75 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            position: stickyHeader ? 'sticky' : 'static',
            top: 0,
            zIndex: 10,
          }}
        >
          <Box sx={{ pr: 1.5, overflow: 'hidden' }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.05rem', sm: '1.18rem' },
                color: 'text.primary',
                lineHeight: 1.3,
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 0.25, fontSize: '0.78rem' }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          <IconButton
            aria-label="close"
            onClick={() => !disableClose && onClose && onClose()}
            disabled={disableClose}
            size="small"
            sx={{
              color: (theme) => theme.palette.grey[500],
              '&:hover': {
                color: 'text.primary',
                bgcolor: 'action.hover',
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
      )}

      {/* Scrollable Content Body */}
      <DialogContent
        dividers
        sx={{
          p: { xs: 2, sm: 2.5 },
          overflowY: 'auto',
          ...contentSx,
        }}
      >
        {children}
      </DialogContent>

      {/* Footer Actions */}
      {actions && (
        <DialogActions
          sx={{
            px: { xs: 2, sm: 2.5 },
            py: { xs: 1.25, sm: 1.5 },
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            position: 'sticky',
            bottom: 0,
            zIndex: 9,
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default AppModal;
