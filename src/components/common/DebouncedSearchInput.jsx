import React, { useState, useEffect } from 'react';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { useDebounce } from '../../hooks/useDebounce';

/**
 * Reusable DebouncedSearchInput Component
 *
 * Keeps immediate local UI state for fluid typing, and calls `onSearchChange`
 * only after the user stops typing for `delay` milliseconds.
 */
const DebouncedSearchInput = ({
  value = '',
  onSearchChange,
  placeholder = 'Search...',
  delay = 400,
  size = 'small',
  fullWidth = true,
  sx = {},
  ...props
}) => {
  const [inputValue, setInputValue] = useState(value);
  const debouncedValue = useDebounce(inputValue, delay);

  // Synchronize when external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Trigger parent onSearchChange when debounced value changes
  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(debouncedValue);
    }
  }, [debouncedValue, onSearchChange]);

  const handleClear = () => {
    setInputValue('');
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  return (
    <TextField
      size={size}
      fullWidth={fullWidth}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      placeholder={placeholder}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          </InputAdornment>
        ),
        endAdornment: inputValue ? (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={handleClear}
              aria-label="clear search"
              edge="end"
              sx={{ color: 'text.secondary' }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ) : null,
      }}
      sx={{
        backgroundColor: 'background.paper',
        borderRadius: '8px',
        '& .MuiOutlinedInput-root': {
          borderRadius: '8px',
          fontSize: '0.875rem',
        },
        ...sx,
      }}
      {...props}
    />
  );
};

export default DebouncedSearchInput;
