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

import CoursDeBaseForm from './ficheCoursDebase';
import { FicheDecision } from './ficheDecision';
import { ListeDesMembres } from './listeMembrePdf';

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
    minWidth: 240,
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

const ComponentToPrintMembres = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref}>
    <ListeDesMembres />
  </div>
));

const ComponentToPrintFicheDecision = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref}>
    <FicheDecision />
  </div>
));

const ComponentToPrintCoursDeBase = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref}>
    <CoursDeBaseForm />
  </div>
));

const PrintEtatGlobal = () => {
  const membreRef = useRef<HTMLDivElement>(null);
  const ficheDecisionRef = useRef<HTMLDivElement>(null);
  const coursDeBaseRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isDesktopPrint = canUseDesktopPrint();
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    // On memorise l'origine du clic pour positionner le menu d'impression.
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    // On ferme le menu a la fin de chaque action.
    setAnchorEl(null);
  };

  const buildDesktopHandlers = (
    ref: React.RefObject<HTMLDivElement>,
    title: string,
    fileName: string
  ) => ({
    preview: async () => {
      // On ferme le menu avant d'ouvrir l'aperçu natif du desktop.
      handleClose();
      await openDesktopPrintPreview(ref.current, { title: `Apercu - ${title}`, fileName });
    },
    pdf: async () => {
      // On ferme le menu avant d'exporter le document cible au format PDF.
      handleClose();
      await exportDesktopPdf(ref.current, { title, fileName });
    },
  });

  const membersHandlers = buildDesktopHandlers(membreRef, 'Liste des membres', 'liste-membres');
  const ficheHandlers = buildDesktopHandlers(
    ficheDecisionRef,
    'Fiche de decision',
    'fiche-decision'
  );
  const coursHandlers = buildDesktopHandlers(
    coursDeBaseRef,
    'Fiche de cours de base',
    'fiche-cours-de-base'
  );

  return (
    <div>
      <Button
        id="print-user-button"
        aria-controls={open ? 'print-user-menu' : undefined}
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
        id="print-user-menu"
        MenuListProps={{ 'aria-labelledby': 'print-user-button' }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {isDesktopPrint ? (
          <>
            <MenuItem onClick={membersHandlers.preview}>
              <VisibilityIcon />
              Apercu membres
            </MenuItem>
            <MenuItem onClick={membersHandlers.pdf}>
              <PictureAsPdfIcon />
              PDF membres
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />

            <MenuItem onClick={ficheHandlers.preview}>
              <VisibilityIcon />
              Apercu fiche de decision
            </MenuItem>
            <MenuItem onClick={ficheHandlers.pdf}>
              <PictureAsPdfIcon />
              PDF fiche de decision
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />

            <MenuItem onClick={coursHandlers.preview}>
              <VisibilityIcon />
              Apercu cours de base
            </MenuItem>
            <MenuItem onClick={coursHandlers.pdf}>
              <PictureAsPdfIcon />
              PDF cours de base
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem onClick={handleClose}>
              <PrintIcon />
              <ReactToPrint
                trigger={() => <div>Liste des membres</div>}
                content={() => membreRef.current}
              />
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <PrintIcon />
              <ReactToPrint
                trigger={() => <div>Fiche de decision</div>}
                content={() => ficheDecisionRef.current}
              />
            </MenuItem>
            <MenuItem onClick={handleClose}>
              <PrintIcon />
              <ReactToPrint
                trigger={() => <div>Fiche de cours de base</div>}
                content={() => coursDeBaseRef.current}
              />
            </MenuItem>
          </>
        )}
      </StyledMenu>

      <div style={{ display: 'none' }}>
        <ComponentToPrintMembres ref={membreRef} />
        <ComponentToPrintFicheDecision ref={ficheDecisionRef} />
        <ComponentToPrintCoursDeBase ref={coursDeBaseRef} />
      </div>
    </div>
  );
};

export default PrintEtatGlobal;
