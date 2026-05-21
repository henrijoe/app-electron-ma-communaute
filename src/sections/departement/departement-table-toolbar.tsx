import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type DepartementTableToolbarProps = {
  numSelected: number;
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete?: () => void;
  deleteLoading?: boolean;
  advancedFilters?: ReactNode;
};

export function UserTableToolbar({
  numSelected,
  filterName,
  onFilterName,
  onDelete,
  deleteLoading = false,
  advancedFilters,
}: DepartementTableToolbarProps) {
  return (
    <Toolbar
      sx={{
        minHeight: 96,
        display: 'flex',
        gap: 1.5,
        justifyContent: 'space-between',
        p: (theme) => ({ xs: theme.spacing(2, 2), sm: theme.spacing(0, 1, 0, 3) }),
        ...(numSelected > 0 && {
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected} département(s) sélectionné(s)
        </Typography>
      ) : (
        <Box sx={{ flex: '1 1 auto', minWidth: 0, maxWidth: { xs: 'none', sm: 320 } }}>
          <OutlinedInput
            fullWidth
            value={filterName}
            onChange={onFilterName}
            placeholder="Rechercher un departement..."
            startAdornment={
              <InputAdornment position="start">
                <Iconify width={20} icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            }
          />
        </Box>
      )}

      {numSelected > 0 ? (
        <Tooltip title="Supprimer les departements sélectionnés">
          <IconButton onClick={onDelete} disabled={deleteLoading}>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Tooltip>
      ) : (
        advancedFilters || (
          <Tooltip title="Options de filtrage">
            <IconButton>
              <Iconify icon="ic:round-filter-list" />
            </IconButton>
          </Tooltip>
        )
      )}
    </Toolbar>
  );
}
