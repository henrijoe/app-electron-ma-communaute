import ReactToPrint from 'react-to-print';
import React, { useRef, useState, forwardRef } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import PrintIcon from '@mui/icons-material/Print';
import { alpha, styled } from '@mui/material/styles';
import Menu, { type MenuProps } from '@mui/material/Menu';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { isDesktopAppRuntime } from 'src/utils/access-control';
import {
  exportDesktopPdf,
  canUseDesktopPrint,
  openDesktopPrintPreview,
} from 'src/utils/desktop-print';
import {
  PRINT_PORTRAIT_PAGE_STYLE,
  PRINT_LANDSCAPE_PAGE_STYLE,
} from 'src/components/print/print-document';

import { ListeDesDepartements } from './listeDepartementPdf';
import { FicheDepartementVierge } from './ficheDepartementVierge';

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

const ComponentToPrintDepartements = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref}>
    <ListeDesDepartements />
  </div>
));

const ComponentToPrintFicheDepartement = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref}>
    <FicheDepartementVierge />
  </div>
));

const PrintEtatGlobal = () => {
  const departementRef = useRef<HTMLDivElement>(null);
  const ficheDepartementRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isDesktopPrint = canUseDesktopPrint();
  const open = Boolean(anchorEl);

  if (isDesktopAppRuntime()) {
    return null;
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    // On memorise l'element qui a ouvert le menu pour l'aligner correctement.
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    // On referme le menu a la fin de chaque action d'impression.
    setAnchorEl(null);
  };

  const handleOpenPreview = async () => {
    // On ferme d'abord le menu pour ne pas perturber l'aperçu desktop.
    handleClose();
    await openDesktopPrintPreview(departementRef.current, {
      title: 'Aperçu - Liste des départements',
      fileName: 'liste-departements',
    });
  };

  const handleExportPdf = async () => {
    // On ferme d'abord le menu pour garder une seule action visible a l'ecran.
    handleClose();
    await exportDesktopPdf(departementRef.current, {
      title: 'Liste des départements',
      fileName: 'liste-departements',
    });
  };

  const handleOpenBlankPreview = async () => {
    handleClose();
    await openDesktopPrintPreview(ficheDepartementRef.current, {
      title: 'Aperçu - Fiche de renseignement département',
      fileName: 'fiche-renseignement-departement',
    });
  };

  const handleExportBlankPdf = async () => {
    handleClose();
    await exportDesktopPdf(ficheDepartementRef.current, {
      title: 'Fiche de renseignement département',
      fileName: 'fiche-renseignement-departement',
    });
  };

  return (
    <div>
      <Button
        id="print-departement-button"
        aria-controls={open ? 'print-departement-menu' : undefined}
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
        id="print-departement-menu"
        MenuListProps={{ 'aria-labelledby': 'print-departement-button' }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {isDesktopPrint ? (
          <>
            <MenuItem onClick={handleOpenBlankPreview}>
              <VisibilityIcon />
              Aperçu fiche de renseignement
            </MenuItem>

            <MenuItem onClick={handleExportBlankPdf}>
              <PictureAsPdfIcon />
              Exporter fiche de renseignement
            </MenuItem>

            <Divider sx={{ my: 0.5 }} />

            <MenuItem onClick={handleOpenPreview}>
              <VisibilityIcon />
              Aperçu avant impression
            </MenuItem>

            <MenuItem onClick={handleExportPdf}>
              <PictureAsPdfIcon />
              Exporter en PDF
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem onClick={handleClose}>
              <PrintIcon />
              <ReactToPrint
                trigger={() => <div>Fiche de renseignement département</div>}
                content={() => ficheDepartementRef.current}
                pageStyle={PRINT_PORTRAIT_PAGE_STYLE}
              />
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <PrintIcon />
              <ReactToPrint
                trigger={() => <div>Liste des départements</div>}
                content={() => departementRef.current}
                pageStyle={PRINT_LANDSCAPE_PAGE_STYLE}
              />
            </MenuItem>
          </>
        )}

        <Divider sx={{ my: 0.5 }} />
      </StyledMenu>

      <div style={{ display: 'none' }}>
        <ComponentToPrintDepartements ref={departementRef} />
        <ComponentToPrintFicheDepartement ref={ficheDepartementRef} />
      </div>
    </div>
  );
};

export default PrintEtatGlobal;
