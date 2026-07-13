import ReactToPrint from 'react-to-print';
import React, { useRef, useState, forwardRef } from 'react';

import Box from '@mui/material/Box';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import PrintIcon from '@mui/icons-material/Print';
import { alpha, styled } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { isDesktopAppRuntime } from 'src/utils/access-control';
import { exportDesktopPdf, canUseDesktopPrint, openDesktopPrintPreview } from 'src/utils/desktop-print';
import {
  PRINT_PORTRAIT_PAGE_STYLE,
  PRINT_LANDSCAPE_PAGE_STYLE,
} from 'src/components/print/print-document';

import { ListeDesCellules } from './listeCellulePdf';
import { FicheCelluleVierge } from './ficheCelluleVierge';

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 10,
    marginTop: theme.spacing(1),
    minWidth: 240,
    boxShadow:
      'rgb(255, 255, 255) 0 0 0 0, rgba(15, 23, 42, 0.06) 0 0 0 1px, rgba(15, 23, 42, 0.14) 0 18px 40px -12px',
    '& .MuiMenu-list': { padding: '6px' },
    '& .MuiMenuItem-root': {
      borderRadius: 8,
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': { backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity) },
    },
  },
}));

const ComponentToPrintCellules = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref}>
    <ListeDesCellules />
  </div>
));

const ComponentToPrintFicheCellule = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref}>
    <FicheCelluleVierge />
  </div>
));

export const PrintEtatGlobal = () => {
  const celluleRef = useRef<HTMLDivElement>(null);
  const ficheCelluleRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isDesktopPrint = canUseDesktopPrint();
  const open = Boolean(anchorEl);

  if (isDesktopAppRuntime()) {
    return null;
  }

  const handleClose = () => setAnchorEl(null);

  return (
    <div>
      <Button
        variant="contained"
        color="inherit"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        startIcon={<PrintIcon sx={{ display: { xs: 'inline-flex', sm: 'none' } }} />}
        endIcon={<KeyboardArrowDownIcon sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />}
        sx={{ minWidth: { xs: 44, sm: 'auto' }, px: { xs: 1.25, sm: 2 } }}
      >
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
          Imprimer
        </Box>
      </Button>

      <StyledMenu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {isDesktopPrint ? (
          <>
            <MenuItem
              onClick={async () => {
                handleClose();
                await openDesktopPrintPreview(ficheCelluleRef.current, {
                  title: 'Aperçu - Fiche de renseignement cellule',
                  fileName: 'fiche-renseignement-cellule',
                });
              }}
            >
              <VisibilityIcon />
              Aperçu fiche de renseignement
            </MenuItem>
            <MenuItem
              onClick={async () => {
                handleClose();
                await exportDesktopPdf(ficheCelluleRef.current, {
                  title: 'Fiche de renseignement cellule',
                  fileName: 'fiche-renseignement-cellule',
                });
              }}
            >
              <PictureAsPdfIcon />
              Exporter fiche de renseignement
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem
              onClick={async () => {
                handleClose();
                await openDesktopPrintPreview(celluleRef.current, {
                  title: 'Aperçu - Liste des cellules',
                  fileName: 'liste-cellules',
                });
              }}
            >
              <VisibilityIcon />
              Aperçu avant impression
            </MenuItem>
            <MenuItem
              onClick={async () => {
                handleClose();
                await exportDesktopPdf(celluleRef.current, {
                  title: 'Liste des cellules',
                  fileName: 'liste-cellules',
                });
              }}
            >
              <PictureAsPdfIcon />
              Exporter en PDF
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem onClick={handleClose}>
              <PrintIcon />
              <ReactToPrint
                trigger={() => <div>Fiche de renseignement cellule</div>}
                content={() => ficheCelluleRef.current}
                pageStyle={PRINT_PORTRAIT_PAGE_STYLE}
              />
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <PrintIcon />
              <ReactToPrint
                trigger={() => <div>Liste des cellules</div>}
                content={() => celluleRef.current}
                pageStyle={PRINT_LANDSCAPE_PAGE_STYLE}
              />
            </MenuItem>
          </>
        )}
        <Divider sx={{ my: 0.5 }} />
      </StyledMenu>

      <div style={{ display: 'none' }}>
        <ComponentToPrintCellules ref={celluleRef} />
        <ComponentToPrintFicheCellule ref={ficheCelluleRef} />
      </div>
    </div>
  );
};

export default PrintEtatGlobal;
