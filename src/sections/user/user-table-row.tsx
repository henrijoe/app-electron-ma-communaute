import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popover from '@mui/material/Popover';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import { Iconify } from 'src/components/iconify';
import { Label } from 'src/components/label';

import ConfirmDialog from '../../components/alert/confirmDialog';
import type { IMembre } from '../../store/membreSlice';

import { formatMembreForDisplay, getPhotoUrl } from './utils';

// ----------------------------------------------------------------------

export type UserProps = {
  id: string;
  name: string;
  role: string;
  status: string;
  company: string;
  avatarUrl: string;
  isVerified: boolean;
};

type UserTableRowProps = {
  row: IMembre;
  selected: boolean;
  onSelectRow: () => void;
  onEdit: (membre: IMembre) => void;
  onDelete: (idMembre: number) => void;
  isDeleting?: boolean;
};

export function UserTableRow({ row, selected, onSelectRow, onEdit, onDelete, isDeleting }: UserTableRowProps) {
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
    navigate(`/details/${row.idMembre}`);
  }, [handleClosePopover, navigate, row.idMembre]);

  const handleEdit = useCallback(() => {
    handleClosePopover();
    onEdit(row);
  }, [handleClosePopover, onEdit, row]);

  const handleDelete = useCallback(() => {
    handleClosePopover();
    setOpenConfirm(true);
  }, [handleClosePopover]);

  const handleConfirmDelete = useCallback(() => {
    onDelete(row.idMembre);
    setOpenConfirm(false);
    handleClosePopover();
  }, [handleClosePopover, onDelete, row.idMembre]);

  const formattedRow = formatMembreForDisplay(row);

  const getSituationMatrimonial = (value: string | number) => {
    if (value === 1 || value === '1') return 'Celibataire';
    if (value === 2 || value === '2') return 'Celibataire sans enfant';
    if (value === 3 || value === '3') return 'Fiance(e)';
    if (value === 4 || value === '4') return 'Concubinage';
    if (value === 5 || value === '5') return 'Marie(e)';
    if (value === 6 || value === '6') return 'Divorce(e)';
    if (value === 7 || value === '7') return 'Veuve';
    if (value === 8 || value === '8') return 'Veuf';
    if (value === 9 || value === '9') return 'Copain / Copine';
    if (value === 10 || value === '10') return 'Polygame';
    return String(value || '');
  };

  const photoUrl = getPhotoUrl(row.photoMembre);

  const getBaptemeDisplay = (value: string | number | null | undefined) => {
    if (value === null || value === undefined || value === '') {
      return { color: 'default' as const, label: 'Non renseigne' };
    }

    const normalizedValue = String(value).trim();

    if (normalizedValue === '1') {
      return { color: 'success' as const, label: 'Oui' };
    }

    if (normalizedValue === '0' || normalizedValue === '2') {
      return { color: 'error' as const, label: 'Non' };
    }

    return {
      color: normalizedValue.toLowerCase() === 'oui' ? 'success' as const : 'default' as const,
      label: formattedRow.baptemeEauMembre,
    };
  };

  const baptemeDisplay = getBaptemeDisplay(row.baptemeEauMembre);

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

        <TableCell component="th" scope="row">
          <Box gap={2} display="flex" alignItems="center">
            <Avatar
              src={photoUrl || undefined}
              alt={`${row.nomMembre} ${row.prenomMembre}`}
              sx={{ width: 40, height: 40 }}
            >
              {!photoUrl && `${row.nomMembre?.charAt(0)}${row.prenomMembre?.charAt(0) || ''}`}
            </Avatar>
          </Box>
        </TableCell>

        <TableCell>{row.nomMembre} {row.prenomMembre}</TableCell>
        <TableCell>{row.residenceMembre}</TableCell>

        <TableCell>
          <Label color={baptemeDisplay.color}>
            {baptemeDisplay.label}
          </Label>
        </TableCell>
        <TableCell>{row.lieuBaptemeEauMembre}</TableCell>
        <TableCell>{row.fonctionMembre}</TableCell>
        <TableCell>{getSituationMatrimonial(row.situationMatrimonialeMembre)}</TableCell>
        <TableCell>{row.contactMembre}</TableCell>

        <TableCell align="right">
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
            Detail
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
        title="Suppression du membre"
        message={`Voulez-vous vraiment supprimer ${row.nomMembre} ${row.prenomMembre} ?`}
        confirmText="Supprimer"
        cancelText="Annuler"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setOpenConfirm(false)}
      />
    </>
  );
}
