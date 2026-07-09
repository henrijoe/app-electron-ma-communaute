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

import { FicheDecision } from './ficheDecision';
import CoursDeBaseForm from './ficheCoursDebase';
import { ListeDesMembres } from './listeMembrePdf';
import { FicheInscriptionMembre } from './ficheInscriptionMembre';

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

const ComponentToPrintFicheInscription = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref}>
    <FicheInscriptionMembre />
  </div>
));

const PrintEtatGlobal = () => {
  const membreRef = useRef<HTMLDivElement>(null);
  const ficheDecisionRef = useRef<HTMLDivElement>(null);
  const coursDeBaseRef = useRef<HTMLDivElement>(null);
  const ficheInscriptionRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isDesktopPrint = canUseDesktopPrint();
  const open = Boolean(anchorEl);

  if (isDesktopAppRuntime()) {
    return null;
  }

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
      await openDesktopPrintPreview(ref.current, { title: `Aperçu - ${title}`, fileName });
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
  const inscriptionHandlers = buildDesktopHandlers(
    ficheInscriptionRef,
    "Fiche d'inscription membre",
    'fiche-inscription-membre'
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
        startIcon={<PrintIcon sx={{ display: { xs: 'inline-flex', sm: 'none' } }} />}
        endIcon={<KeyboardArrowDownIcon sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />}
        sx={{ minWidth: { xs: 44, sm: 'auto' }, px: { xs: 1.25, sm: 2 } }}
      >
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
          Imprimer
        </Box>
      </Button>

      <StyledMenu
        id="print-user-menu"
        MenuListProps={{ 'aria-labelledby': 'print-user-button' }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {isDesktopPrint ? (
          [
            <MenuItem key="inscription-preview" onClick={inscriptionHandlers.preview}>
              <VisibilityIcon />
              Aperçu fiche inscription
            </MenuItem>,
            <MenuItem key="inscription-pdf" onClick={inscriptionHandlers.pdf}>
              <PictureAsPdfIcon />
              PDF fiche inscription
            </MenuItem>,
            <Divider key="inscription-divider" sx={{ my: 0.5 }} />,
            <MenuItem key="members-preview" onClick={membersHandlers.preview}>
              <VisibilityIcon />
              Aperçu membres
            </MenuItem>,
            <MenuItem key="members-pdf" onClick={membersHandlers.pdf}>
              <PictureAsPdfIcon />
              PDF membres
            </MenuItem>,
            <Divider key="members-divider" sx={{ my: 0.5 }} />,
            <MenuItem key="fiche-preview" onClick={ficheHandlers.preview}>
              <VisibilityIcon />
              Aperçu fiche de décision
            </MenuItem>,
            <MenuItem key="fiche-pdf" onClick={ficheHandlers.pdf}>
              <PictureAsPdfIcon />
              PDF fiche de décision
            </MenuItem>,
            <Divider key="fiche-divider" sx={{ my: 0.5 }} />,
            <MenuItem key="cours-preview" onClick={coursHandlers.preview}>
              <VisibilityIcon />
              Aperçu cours de base
            </MenuItem>,
            <MenuItem key="cours-pdf" onClick={coursHandlers.pdf}>
              <PictureAsPdfIcon />
              PDF cours de base
            </MenuItem>,
          ]
        ) : (
          [
            <MenuItem key="print-inscription" onClick={handleClose}>
              <PrintIcon />
              <ReactToPrint
                trigger={() => <div>Fiche d&apos;inscription membre</div>}
                content={() => ficheInscriptionRef.current}
              />
            </MenuItem>,

            <MenuItem key="print-members" onClick={handleClose}>
              <PrintIcon />
              <ReactToPrint
                trigger={() => <div>Liste des membres</div>}
                content={() => membreRef.current}
              />
            </MenuItem>,
            
            <MenuItem key="print-fiche" onClick={handleClose}>
              <PrintIcon />
              <ReactToPrint
                trigger={() => <div>Fiche de decision</div>}
                content={() => ficheDecisionRef.current}
              />
            </MenuItem>,
            <MenuItem key="print-cours" onClick={handleClose}>
              <PrintIcon />
              <ReactToPrint
                trigger={() => <div>Fiche de cours de base</div>}
                content={() => coursDeBaseRef.current}
              />
            </MenuItem>,

          ]
        )}
      </StyledMenu>

      <div style={{ display: 'none' }}>
        <ComponentToPrintMembres ref={membreRef} />
        <ComponentToPrintFicheDecision ref={ficheDecisionRef} />
        <ComponentToPrintCoursDeBase ref={coursDeBaseRef} />
        <ComponentToPrintFicheInscription ref={ficheInscriptionRef} />
      </div>
    </div>
  );
};

export default PrintEtatGlobal;
