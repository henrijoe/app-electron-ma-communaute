import { useState, useCallback } from 'react';

import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------
// Menu « … » d'une ligne de tableau, repris de la liste des membres pour que les
// deux écrans se manipulent de la même façon.

export type ActionLigne = {
  libelle: string;
  /** Nom d'icône Iconify, comme dans la liste des membres. */
  icone: string;
  onClick: () => void;
  /** Rouge, pour les actions destructrices. */
  destructrice?: boolean;
  /** Une entrée absente est préférable à une entrée grisée sans explication. */
  masquee?: boolean;
};

type RowActionsProps = {
  actions: ActionLigne[];
};

export function RowActions({ actions }: RowActionsProps) {
  const [ancre, setAncre] = useState<HTMLButtonElement | null>(null);

  const ouvrir = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    // La ligne entière est cliquable sur certains onglets : le menu ne doit pas
    // déclencher l'action de la ligne au passage.
    event.stopPropagation();
    setAncre(event.currentTarget);
  }, []);

  const fermer = useCallback(() => setAncre(null), []);

  const visibles = actions.filter((action) => !action.masquee);

  if (!visibles.length) {
    return null;
  }

  return (
    <>
      <IconButton onClick={ouvrir}>
        <Iconify icon="eva:more-vertical-fill" />
      </IconButton>

      <Popover
        open={Boolean(ancre)}
        anchorEl={ancre}
        onClose={fermer}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 200,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
            },
          }}
        >
          {visibles.map((action) => (
            <MenuItem
              key={action.libelle}
              onClick={(event) => {
                event.stopPropagation();
                fermer();
                action.onClick();
              }}
              sx={action.destructrice ? { color: 'error.main' } : undefined}
            >
              <Iconify icon={action.icone} />
              {action.libelle}
            </MenuItem>
          ))}
        </MenuList>
      </Popover>
    </>
  );
}
