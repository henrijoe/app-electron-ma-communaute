import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type CulteTableToolbarProps = {
  numSelected: number;
  filterName: string;
  onFilterName: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDelete?: () => void; // Ajouter cette prop
  deleteLoading?: boolean; // Ajouter pour gérer l'état de chargement
};

export function UserTableToolbar({ 
  numSelected, 
  filterName, 
  onFilterName, 
  onDelete,
  deleteLoading = false 
}: CulteTableToolbarProps) {
  return (
    <Toolbar
      sx={{
        height: 96,
        display: 'flex',
        justifyContent: 'space-between',
        p: (theme) => theme.spacing(0, 1, 0, 3),
        ...(numSelected > 0 && {
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected} sélectionné(s)
        </Typography>
      ) : (
        <OutlinedInput
          fullWidth
          value={filterName}
          onChange={onFilterName}
          placeholder="Rechercher..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify width={20} icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          }
          sx={{ maxWidth: 320 }}
        />
      )}
      
      {numSelected > 0 ? (
        <Tooltip title="Supprimer">
          <IconButton 
            onClick={onDelete} // Ajouter l'event handler
            disabled={deleteLoading} // Désactiver pendant le chargement
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Filter list">
          <IconButton>
            <Iconify icon="ic:round-filter-list" />

          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
}