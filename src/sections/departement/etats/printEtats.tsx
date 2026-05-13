import React, { forwardRef, useRef, useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PrintIcon from '@mui/icons-material/Print';
import VisibilityIcon from '@mui/icons-material/Visibility';
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

import { ListeDesDepartements } from './listeDepartementPdf';

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

const PrintEtatGlobal = () => {
  const departementRef = useRef<HTMLDivElement>(null);
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
      title: 'Apercu - Liste des departements',
      fileName: 'liste-departements',
    });
  };

  const handleExportPdf = async () => {
    // On ferme d'abord le menu pour garder une seule action visible a l'ecran.
    handleClose();
    await exportDesktopPdf(departementRef.current, {
      title: 'Liste des departements',
      fileName: 'liste-departements',
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
        endIcon={<KeyboardArrowDownIcon />}
      >
        Imprimer
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
              trigger={() => <div>Liste des departements</div>}
              content={() => departementRef.current}
            />
          </MenuItem>
        )}

        <Divider sx={{ my: 0.5 }} />
      </StyledMenu>

      <div style={{ display: 'none' }}>
        <ComponentToPrintDepartements ref={departementRef} />
      </div>
    </div>
  );
};

export default PrintEtatGlobal;
