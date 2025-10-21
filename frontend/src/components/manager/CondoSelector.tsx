import React from 'react';
import { Select, MenuItem, FormControl, InputLabel, Box, Typography } from '@mui/material';
import { useManagerAuth } from '../../contexts/ManagerAuthContext';

interface CondoSelectorProps {
  onCondoChange?: (condoId: string) => void;
}

export const CondoSelector: React.FC<CondoSelectorProps> = ({ onCondoChange }) => {
  const { user, switchCondo, isLoading } = useManagerAuth();

  if (!user || !user.condos || user.condos.length === 0) {
    return null;
  }

  const handleCondoChange = async (event: any) => {
    const condoId = event.target.value;
    if (condoId && condoId !== user.activeCondo?.id) {
      const success = await switchCondo(condoId);
      if (success && onCondoChange) {
        onCondoChange(condoId);
      }
    }
  };

  return (
    <Box sx={{ minWidth: 200 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="condo-selector-label">Active Condo</InputLabel>
        <Select
          labelId="condo-selector-label"
          value={user.activeCondo?.id || ''}
          label="Active Condo"
          onChange={handleCondoChange}
          disabled={isLoading}
        >
          {user.condos.map((condo) => (
            <MenuItem key={condo.id} value={condo.id}>
              <Box>
                <Typography variant="body2" fontWeight="medium">
                  {condo.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {condo.prefix}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
