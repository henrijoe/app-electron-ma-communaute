import React, { forwardRef, useRef, useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PrintIcon from '@mui/icons-material/Print';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Menu, { type MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { alpha, styled } from '@mui/material/styles';
import ReactToPrint from 'react-to-print';

import {
  canUseDesktopPrint,
  exportDesktopPdf,
  openDesktopPrintPreview,
} from 'src/utils/desktop-print';
import { isDesktopAppRuntime } from 'src/utils/access-control';

import { ListeDesCultes } from './listeCultePdf';

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 10,
    marginTop: theme.spacing(1),
    minWidth: 220,
    color: theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
    boxShadow:
      'rgb(255, 255, 255) 0 0 0 0, rgba(15, 23, 42, 0.06) 0 0 0 1px, rgba(15, 23, 42, 0.14) 0 18px 40px -12px',
    '& .MuiMenu-list': {
      padding: '6px',
    },
    '& .MuiMenuItem-root': {
      borderRadius: 8,
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
      },
    },
  },
}));

const ComponentToPrintCultes = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref}>
    <ListeDesCultes />
  </div>
));

const PrintEtatGlobal = () => {
  const culteRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isDesktopPrint = canUseDesktopPrint();
  const open = Boolean(anchorEl);

  if (isDesktopAppRuntime()) {
    return null;
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    // On memorise l'element source pour positionner le menu d'actions.
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    // On referme simplement le menu pour revenir au contexte normal.
    setAnchorEl(null);
  };

  const handleOpenPreview = async () => {
    // On ferme le menu avant d'ouvrir la fenetre d'aperçu desktop.
    handleClose();
    await openDesktopPrintPreview(culteRef.current, {
      title: 'Apercu - Liste des cultes',
      fileName: 'liste-cultes',
    });
  };

  const handleExportPdf = async () => {
    // On ferme le menu avant de lancer l'export PDF desktop.
    handleClose();
    await exportDesktopPdf(culteRef.current, {
      title: 'Liste des cultes',
      fileName: 'liste-cultes',
    });
  };

  return (
    <div>
      <Button
        id="print-culte-button"
        aria-controls={open ? 'print-culte-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        variant="contained"
        color="inherit"
        onClick={handleClick}
        startIcon={<PrintIcon sx={{ display: { xs: 'inline-flex', sm: 'none' } }} />}
        endIcon={<KeyboardArrowDownIcon sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />}
        sx={{ minWidth: { xs: 44, sm: 'auto' }, px: { xs: 1.25, sm: 2 } }}
      >
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
          Imprimer
        </Box>
      </Button>

      <StyledMenu
        id="print-culte-menu"
        MenuListProps={{ 'aria-labelledby': 'print-culte-button' }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {isDesktopPrint ? (
          <>
            <MenuItem onClick={handleOpenPreview}>
              <VisibilityIcon />
              Apercu avant impression
            </MenuItem>

            <MenuItem onClick={handleExportPdf}>
              <PictureAsPdfIcon />
              Exporter en PDF
            </MenuItem>
          </>
        ) : (
          <MenuItem onClick={handleClose}>
            <PrintIcon />
            <ReactToPrint
              trigger={() => <div>Liste des cultes</div>}
              content={() => culteRef.current}
            />
          </MenuItem>
        )}

        <Divider sx={{ my: 0.5 }} />
      </StyledMenu>

      <div style={{ display: 'none' }}>
        <ComponentToPrintCultes ref={culteRef} />
      </div>
    </div>
  );
};

export default PrintEtatGlobal;
