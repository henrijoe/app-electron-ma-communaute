import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import ConfirmDialog from '../../components/alert/confirmDialog';
import { IDepartement } from '../../store/departementSlice';
import { formatDepartementForDisplay } from './utils';

// -------------------------------------

type DepartementTableRowProps = {
  row: IDepartement;
  selected: boolean;
  onSelectRow: () => void;
  onEdit: (departement: IDepartement) => void;
  onDelete: (idDepartement: number) => void;
  isDeleting?: boolean;
};

export function DepartementTableRow({ 
  row, 
  selected, 
  onSelectRow, 
  onEdit, 
  onDelete, 
  isDeleting 
}: DepartementTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const navigate = useNavigate();

  const departementData = Array.isArray(row) ? row[0] : row;

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleViewDetail = useCallback(() => {
    handleClosePopover();
    navigate(`/detaildepartement/${row.idDepartement}`);
  }, [navigate, row.idDepartement, handleClosePopover]);

  const handleEdit = useCallback(() => {
    handleClosePopover();
    onEdit(row);
  }, [row, onEdit, handleClosePopover]);

  const handleDelete = useCallback(() => {
    handleClosePopover();
    setOpenConfirm(true);
  }, [handleClosePopover]);

  const handleConfirmDelete = useCallback(() => {
    onDelete(row.idDepartement);
    setOpenConfirm(false);
    handleClosePopover();
  }, [onDelete, row.idDepartement, handleClosePopover]);

  // Utiliser les données formatées
  const formattedRow = formatDepartementForDisplay(departementData);
  

  return (
    <>
      <TableRow
        hover
        tabIndex={-1}
        role="checkbox"
        selected={selected}
        onDoubleClick={handleViewDetail}
        sx={{ cursor: 'pointer' }}
      >
        <TableCell padding="checkbox">
          <Checkbox
            disableRipple
            checked={selected}
            onChange={onSelectRow}
            onClick={(event) => event.stopPropagation()}
          />
        </TableCell>

        {/* Libellé long */}
        <TableCell>
          <Tooltip title={row.libelleLongDepartement || ''} arrow>
            <Box 
              sx={{ 
                maxWidth: 200,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {row.libelleLongDepartement || ''}
            </Box>
          </Tooltip>
        </TableCell>

        {/* Libellé court */}
        <TableCell>
          <Label color="primary" variant="filled">
            {row.libelleCourtDepartement || ''}
          </Label>
        </TableCell>

        {/* Slogan */}
        <TableCell>
          <Tooltip title={row.sloganDepartement || ''} arrow>
            <Box 
              sx={{ 
                maxWidth: 150,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {row.sloganDepartement || ''}
            </Box>
          </Tooltip>
        </TableCell>

        {/* Responsable */}
        <TableCell>
          {row.responsableDepartement || ''}
        </TableCell>

        {/* Actions */}
        <TableCell align="center">
          <IconButton
            onClick={(event) => {
              event.stopPropagation();
              handleOpenPopover(event);
            }}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          <MenuItem onClick={handleViewDetail}>
            <Iconify icon="solar:eye-bold" />
            Détail
          </MenuItem>

          <MenuItem onClick={handleEdit}>
            <Iconify icon="solar:pen-bold" />
            Modifier
          </MenuItem>

          <MenuItem
            onClick={handleDelete}
            sx={{color: 'error.main'}}
            disabled={isDeleting}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            {isDeleting ? 'Suppression...' : 'Supprimer'}
          </MenuItem>
        </MenuList>
      </Popover>

      <ConfirmDialog
        open={openConfirm}
        title="Suppression du département"
        message={`Voulez-vous vraiment supprimer le département "${row.libelleLongDepartement}" (${row.libelleCourtDepartement}) ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setOpenConfirm(false)}
      />
    </>
  );
}
