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

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import ConfirmDialog from '../../components/alert/confirmDialog';
import { typeCulteOptions, type ICulte } from '../../store/culteSlice'; // Importez l'interface ICulte
import { formatCulteForDisplay, getTypeCulteLabel } from './utils';

// ----------------------------------------------------------------------

type CulteTableRowProps = {
  row: ICulte;
  selected: boolean;
  onSelectRow: () => void;
  onEdit: (culte: ICulte) => void;
  onDelete: (idCulte: number) => void;
  isDeleting?: boolean;
};

export function CulteTableRow({ row, selected, onSelectRow, onEdit, onDelete, isDeleting }: CulteTableRowProps) {
  // console.log("🚀 ~ CulteTableRow ~ row:", row)
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [openConfirm, setOpenConfirm] = useState(false);

  const navigate = useNavigate();
   const culteData = Array.isArray(row) ? row[0] : row;
   console.log("🚀 ~ CulteTableRow ~ culteData:", culteData)
  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleViewDetail = useCallback(() => {
    handleClosePopover();
    navigate(`/detailcultes/${row.idCulte}`); //
  }, [navigate, row.idCulte, handleClosePopover]);

  const handleEdit = useCallback(() => {
    handleClosePopover();
    onEdit(row);
  }, [row, onEdit, handleClosePopover]);

  const handleDelete = useCallback(() => {
    handleClosePopover();
    setOpenConfirm(true);
  }, [handleClosePopover]);

  const handleConfirmDelete = useCallback(() => {
      onDelete(row.idCulte);
    setOpenConfirm(false);
    handleClosePopover();
  }, [onDelete, row.idCulte, handleClosePopover]);


    // Utiliser les données formatées
    const formattedRow = formatCulteForDisplay(culteData);
  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

    const getTypeCulte = (typeCulteValue: string) => {
    // Convertir en nombre si nécessaire
    const numericValue = parseInt(typeCulteValue, 10);
    const typeCulte = typeCulteOptions.find((x) => x.value === numericValue);
    return typeCulte ? typeCulte.label : typeCulteValue || "";
  };

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

        {/* Type de culte */}
        <TableCell>
          {getTypeCulte(culteData.typeCulte) || ""}
          {/* {culteData.typeCulte || ""} */}
        </TableCell>

        {/* Date du culte */}
        <TableCell>
          {formatDate(culteData?.dateCulte)}
        </TableCell>

        {/* Dirigeant */}
        <TableCell>{culteData?.dirigeant || ""}</TableCell>

        {/* Thème de la prédication */}
        <TableCell>
          <Box 
            sx={{ 
              maxWidth: 150,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {culteData?.themePredication || ""}
          </Box>
        </TableCell>

        {/* Passage biblique */}
        <TableCell>
          <Box 
            sx={{ 
              maxWidth: 120,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {culteData?.passageBiblique || ""}
          </Box>
        </TableCell>

        {/* Nombre d'hommes */}
        <TableCell align="center">
          <Label color="success" variant="outlined">
            {culteData?.nombreHommeCulte || 0}
          </Label>
        </TableCell>

        {/* Nombre de femmes */}
        <TableCell align="center">
          <Label color="success" variant="outlined">
            {culteData?.nombreFemmeCulte || 0}
          </Label>
        </TableCell>

        {/* Offrande culte */}
        <TableCell align="center">
          <Label color="secondary" variant="outlined">
            {`${culteData?.offrandeCulte || 0}  FCFA`}
          </Label>
        </TableCell>

        {/* Ecodim */}
        <TableCell align="center">
          <Label color="success" variant="outlined">
            {culteData?.ecodim || 0}
          </Label>
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
            sx={{ color: 'error.main' }}
            disabled={isDeleting}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            {isDeleting ? 'Suppression...' : 'Supprimer'}
          </MenuItem>
        </MenuList>
      </Popover>

      <ConfirmDialog
        open={openConfirm}
        title="Suppression du culte"
        message={`Voulez-vous vraiment supprimer le culte du ${formatDate(row.dateCulte)} (${row.typeCulte}) ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setOpenConfirm(false)}
      />
    </>
  );
}
