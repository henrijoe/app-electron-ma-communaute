import { useMemo, useState } from 'react';

import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { Box, Button, Menu, MenuItem, TextField, Typography } from '@mui/material';

import { normalizeText } from 'src/utils/text';

export type AdvancedFilterOption = {
  label: string;
  value: string;
};

export type AdvancedFilterField = {
  key: string;
  label: string;
  type?: 'text' | 'select' | 'date';
  options?: AdvancedFilterOption[];
  placeholder?: string;
};

type AdvancedFilterMenuProps = {
  fields: AdvancedFilterField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onApply: () => void;
  onReset: () => void;
  buttonLabel?: string;
};

export function AdvancedFilterMenu({
  fields,
  values,
  onChange,
  onApply,
  onReset,
  buttonLabel = 'Filtres avances',
}: AdvancedFilterMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Nombre de filtres actifs pour feedback utilisateur direct.
  const activeCount = useMemo(
    () => Object.values(values).filter((value) => String(value || '').trim() !== '').length,
    [values]
  );

  return (
    <>
      <Button
        aria-controls="advanced-filter-menu"
        aria-haspopup="true"
        color="inherit"
        endIcon={<FilterAltIcon />}
        size="small"
        variant={activeCount > 0 ? 'contained' : 'outlined'}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        {activeCount > 0 ? `${buttonLabel} (${activeCount})` : buttonLabel}
      </Button>

      <Menu
        anchorEl={anchorEl}
        id="advanced-filter-menu"
        keepMounted
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <Box sx={{ p: 2, width: 320 }}>
          <Typography gutterBottom variant="h6">
            Filtrer
          </Typography>

          {fields.map((field) => (
            <TextField
              key={field.key}
              fullWidth
              margin="dense"
              placeholder={normalizeText(field.placeholder || '')}
              select={field.type === 'select'}
              size="small"
              type={field.type === 'date' ? 'date' : 'text'}
              value={values[field.key] || ''}
              label={normalizeText(field.label)}
              onChange={(event) => onChange(field.key, event.target.value)}
              InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
            >
              {field.type === 'select' && [
                <MenuItem key={`${field.key}-empty`} value="">
                  <em>Tous</em>
                </MenuItem>,
                ...((field.options || []).map((option) => (
                  <MenuItem key={`${field.key}-${option.value}`} value={option.value}>
                    {normalizeText(option.label)}
                  </MenuItem>
                ))),
              ]}
            </TextField>
          ))}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => {
                onReset();
                setAnchorEl(null);
              }}
            >
              Reinitialiser
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                onApply();
                setAnchorEl(null);
              }}
            >
              Appliquer
            </Button>
          </Box>
        </Box>
      </Menu>
    </>
  );
}
