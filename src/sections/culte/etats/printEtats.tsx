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

import { ListeDesCultes } from './listeCultePdf';
import { FicheCulteRenseignement } from './ficheCulteRenseignement';

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 10,
    marginTop: theme.spacing(1),
    minWidth: 220,
    color: theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
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

const ComponentToPrintFicheCulte = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref}>
    <FicheCulteRenseignement />
  </div>
));

const PrintEtatGlobal = () => {
  const culteRef = useRef<HTMLDivElement>(null);
  const ficheCulteRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isDesktopPrint = canUseDesktopPrint();
  const open = Boolean(anchorEl);

  if (isDesktopAppRuntime()) {
    return null;
  }

  const handleClose = () => setAnchorEl(null);

  const openFichePreview = async () => {
    handleClose();
    await openDesktopPrintPreview(ficheCulteRef.current, {
      title: 'Aperçu - Fiche de renseignement culte',
      fileName: 'fiche-renseignement-culte',
    });
  };

  const exportFichePdf = async () => {
    handleClose();
    await exportDesktopPdf(ficheCulteRef.current, {
      title: 'Fiche de renseignement culte',
      fileName: 'fiche-renseignement-culte',
    });
  };

  const openListPreview = async () => {
    handleClose();
    await openDesktopPrintPreview(culteRef.current, {
      title: 'Aperçu - Liste des cultes',
      fileName: 'liste-cultes',
    });
  };

  const exportListPdf = async () => {
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
        onClick={(event) => setAnchorEl(event.currentTarget)}
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
            <MenuItem onClick={openFichePreview}>
              <VisibilityIcon />
              Aperçu fiche de renseignement
            </MenuItem>
            <MenuItem onClick={exportFichePdf}>
              <PictureAsPdfIcon />
              Exporter fiche de renseignement
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={openListPreview}>
              <VisibilityIcon />
              Aperçu avant impression
            </MenuItem>
            <MenuItem onClick={exportListPdf}>
              <PictureAsPdfIcon />
              Exporter en PDF
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem onClick={handleClose}>
              <PrintIcon />
              <ReactToPrint
                trigger={() => <div>Fiche de renseignement culte</div>}
                content={() => ficheCulteRef.current}
              />
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <PrintIcon />
              <ReactToPrint
                trigger={() => <div>Liste des cultes</div>}
                content={() => culteRef.current}
              />
            </MenuItem>
          </>
        )}

        <Divider sx={{ my: 0.5 }} />
      </StyledMenu>

      <div style={{ display: 'none' }}>
        <ComponentToPrintCultes ref={culteRef} />
        <ComponentToPrintFicheCulte ref={ficheCulteRef} />
      </div>
    </div>
  );
};

export default PrintEtatGlobal;
