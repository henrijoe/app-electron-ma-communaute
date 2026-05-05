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
import { ICellule } from '../../store/celluleSlice';


type CelluleTableRowProps = {
  row: ICellule;
  selected: boolean;
  onSelectRow: () => void;
  onEdit: (cellule: ICellule) => void;
  onDelete: (idCellule: number) => void;
  isDeleting?: boolean;
  responsableContact?: string;
  responsableVisiteContact?: string;
};

export function CelluleTableRow({
  row,
  selected,
  onSelectRow,
  onEdit,
  onDelete,
  isDeleting,
  responsableContact = '',
  responsableVisiteContact = '',
}: CelluleTableRowProps) {
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
    navigate(`/detailcellule/${row.idCellule}`);
  }, [navigate, row.idCellule, handleClosePopover]);

  const handleEdit = useCallback(() => {
    handleClosePopover();
    onEdit(row);
  }, [handleClosePopover, onEdit, row]);

  const handleDelete = useCallback(() => {
    handleClosePopover();
    setOpenConfirm(true);
  }, [handleClosePopover]);

  const handleConfirmDelete = useCallback(() => {
    onDelete(row.idCellule);
    setOpenConfirm(false);
    handleClosePopover();
  }, [handleClosePopover, onDelete, row.idCellule]);

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected} onDoubleClick={handleViewDetail} sx={{ cursor: 'pointer' }}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} onClick={(event) => event.stopPropagation()} />
        </TableCell>

        <TableCell>
          <Tooltip title={row.nomCellule || ''} arrow>
            <Box sx={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {row.nomCellule || ''}
            </Box>
          </Tooltip>
        </TableCell>

        <TableCell>{row.lieuCellule || ''}</TableCell>

        <TableCell>
          <Label color="primary" variant="outlined">{row.nombreMembreCellule || '0'}</Label>
        </TableCell>

        <TableCell>{row.responsableCellule || ''}</TableCell>

        <TableCell>{responsableContact || ''}</TableCell>

        <TableCell>{row.responsableVisiteCellule || ''}</TableCell>

        <TableCell>{responsableVisiteContact || ''}</TableCell>

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
        title="Suppression de la cellule"
        message={`Voulez-vous vraiment supprimer la cellule "${row.nomCellule}" ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setOpenConfirm(false)}
      />
    </>
  );
}
