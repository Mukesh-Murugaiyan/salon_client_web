import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress,
} from '@mui/material';
import EmptyState from './EmptyState';

/**
 * Reusable DataTable Component
 *
 * Provides a standardized table with sticky header support, declarative column definitions,
 * loading states, responsive horizontal scrolling, and integrated empty states.
 */
const DataTable = ({
  columns = [],
  data = [],
  keyExtractor = (row, index) => row.id || row._id || index,
  stickyHeader = true,
  isLoading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no records matching the selected criteria.',
  emptyActionLabel,
  onEmptyAction,
  onRowClick,
  hover = true,
  minWidth = 650,
  maxHeight,
  containerSx = {},
  tableSx = {},
  headSx = {},
}) => {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        width: '100%',
        overflowX: 'auto',
        borderRadius: '12px',
        border: '1px solid',
        borderColor: 'divider',
        maxHeight: maxHeight || undefined,
        ...containerSx,
      }}
    >
      <Table stickyHeader={stickyHeader} sx={{ minWidth, ...tableSx }}>
        <TableHead
          sx={{
            bgcolor: 'grey.50',
            '& th': {
              fontWeight: 600,
              fontSize: '0.8125rem',
              color: 'text.secondary',
              backgroundColor: 'grey.50',
              py: 1.25,
            },
            ...headSx,
          }}
        >
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.id}
                align={col.align || 'left'}
                sx={{
                  minWidth: col.minWidth,
                  width: col.width,
                  fontWeight: 600,
                  ...col.headerSx,
                }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                <CircularProgress size={32} color="primary" />
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} sx={{ p: 0, borderBottom: 'none' }}>
                <Box sx={{ py: 4, px: 2 }}>
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    actionLabel={emptyActionLabel}
                    onAction={onEmptyAction}
                  />
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, index) => {
              const rowKey = keyExtractor(row, index);
              return (
                <TableRow
                  key={rowKey}
                  hover={hover}
                  onClick={() => onRowClick && onRowClick(row)}
                  sx={{
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:last-child td, &:last-child th': { border: 0 },
                    '& td': { py: 1.25, fontSize: '0.84rem' },
                  }}
                >
                  {columns.map((col) => {
                    const content = col.render
                      ? col.render(row, index)
                      : row[col.id] !== undefined
                      ? row[col.id]
                      : '—';

                    return (
                      <TableCell
                        key={col.id}
                        align={col.align || 'left'}
                        sx={{
                          maxWidth: col.maxWidth,
                          ...col.cellSx,
                        }}
                      >
                        {content}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DataTable;
