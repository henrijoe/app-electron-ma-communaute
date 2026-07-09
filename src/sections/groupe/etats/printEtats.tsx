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

import { ListeDesGroupes } from './listeGroupePdf';
import { FicheGroupeVierge } from './ficheGroupeVierge';

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

const ComponentToPrintGroupes = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref}>
    <ListeDesGroupes />
  </div>
));

const ComponentToPrintFicheGroupe = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref}>
    <FicheGroupeVierge />
  </div>
));

export const PrintEtatGlobal = () => {
  const groupeRef = useRef<HTMLDivElement>(null);
  const ficheGroupeRef = useRef<HTMLDivElement>(null);
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
                await openDesktopPrintPreview(ficheGroupeRef.current, {
                  title: 'Aperçu - Fiche de renseignement groupe',
                  fileName: 'fiche-renseignement-groupe',
                });
              }}
            >
              <VisibilityIcon />
              Aperçu fiche de renseignement
            </MenuItem>
            <MenuItem
              onClick={async () => {
                handleClose();
                await exportDesktopPdf(ficheGroupeRef.current, {
                  title: 'Fiche de renseignement groupe',
                  fileName: 'fiche-renseignement-groupe',
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
                await openDesktopPrintPreview(groupeRef.current, {
                  title: 'Aperçu - Liste des groupes',
                  fileName: 'liste-groupes',
                });
              }}
            >
              <VisibilityIcon />
              Aperçu avant impression
            </MenuItem>
            <MenuItem
              onClick={async () => {
                handleClose();
                await exportDesktopPdf(groupeRef.current, {
                  title: 'Liste des groupes',
                  fileName: 'liste-groupes',
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
                trigger={() => <div>Fiche de renseignement groupe</div>}
                content={() => ficheGroupeRef.current}
              />
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <PrintIcon />
              <ReactToPrint
                trigger={() => <div>Liste des groupes</div>}
                content={() => groupeRef.current}
              />
            </MenuItem>
          </>
        )}
        <Divider sx={{ my: 0.5 }} />
      </StyledMenu>

      <div style={{ display: 'none' }}>
        <ComponentToPrintGroupes ref={groupeRef} />
        <ComponentToPrintFicheGroupe ref={ficheGroupeRef} />
      </div>
    </div>
  );
};

export default PrintEtatGlobal;
