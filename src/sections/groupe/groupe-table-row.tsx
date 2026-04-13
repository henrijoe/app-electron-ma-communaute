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

import { Iconify } from 'src/components/iconify';

import ConfirmDialog from '../../components/alert/confirmDialog';
import { IGroupe } from '../../store/groupeSlice';


type GroupeTableRowProps = {
  row: IGroupe;
  selected: boolean;
  onSelectRow: () => void;
  onEdit: (groupe: IGroupe) => void;
  onDelete: (idGroupe: number) => void;
  isDeleting?: boolean;
};

export function GroupeTableRow({ row, selected, onSelectRow, onEdit, onDelete, isDeleting }: GroupeTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const navigate = useNavigate();

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleViewDetail = useCallback(() => {
    handleClosePopover();
    navigate(`/detailgroupe/${row.idGroupe}`);
  }, [navigate, row.idGroupe, handleClosePopover]);

  const handleEdit = useCallback(() => {
    handleClosePopover();
    onEdit(row);
  }, [handleClosePopover, onEdit, row]);

  const handleDelete = useCallback(() => {
    handleClosePopover();
    setOpenConfirm(true);
  }, [handleClosePopover]);

  const handleConfirmDelete = useCallback(() => {
    onDelete(row.idGroupe);
    setOpenConfirm(false);
    handleClosePopover();
  }, [handleClosePopover, onDelete, row.idGroupe]);

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected} onDoubleClick={handleViewDetail} sx={{ cursor: 'pointer' }}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} onClick={(event) => event.stopPropagation()} />
        </TableCell>

        <TableCell>
          <Tooltip title={row.libelleGroupe || ''} arrow>
            <Box sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {row.libelleGroupe || ''}
            </Box>
          </Tooltip>
        </TableCell>

        <TableCell>
          <Tooltip title={row.descriptionGroupe || ''} arrow>
            <Box sx={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {row.descriptionGroupe || ''}
            </Box>
          </Tooltip>
        </TableCell>

        <TableCell>{row.responsableGroupe || ''}</TableCell>

        <TableCell align="center">
          <IconButton onClick={(event) => { event.stopPropagation(); handleOpenPopover(event); }}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover open={!!openPopover} anchorEl={openPopover} onClose={handleClosePopover} anchorOrigin={{ vertical: 'top', horizontal: 'left' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MenuList disablePadding sx={{ p: 0.5, gap: 0.5, width: 140, display: 'flex', flexDirection: 'column', [`& .${menuItemClasses.root}`]: { px: 1, gap: 2, borderRadius: 0.75 } }}>
          <MenuItem onClick={handleViewDetail}><Iconify icon="solar:eye-bold" />Détail</MenuItem>
          <MenuItem onClick={handleEdit}><Iconify icon="solar:pen-bold" />Modifier</MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }} disabled={isDeleting}><Iconify icon="solar:trash-bin-trash-bold" />{isDeleting ? 'Suppression...' : 'Supprimer'}</MenuItem>
        </MenuList>
      </Popover>

      <ConfirmDialog
        open={openConfirm}
        title="Suppression du groupe"
        message={`Voulez-vous vraiment supprimer le groupe "${row.libelleGroupe}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setOpenConfirm(false)}
      />
    </>
  );
}
