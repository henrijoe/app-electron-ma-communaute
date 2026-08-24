// ============================================================================
// printEtats.tsx (pastoral)
// Bouton "Imprimer" du suivi pastoral : genere un etat PDF/imprimable a partir
// de la liste deja filtree par la page (categorie, priorite, recherche, periode).
// Fonctionne aussi bien dans l'app desktop (export PDF direct via Electron) que
// dans un navigateur (boite d'impression native), contrairement a certains
// boutons d'impression plus anciens du projet qui ne marchent qu'au navigateur.
// ============================================================================
import { useRef, useState } from 'react';
import ReactToPrint from 'react-to-print';

import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import PrintIcon from '@mui/icons-material/Print';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

import { PRINT_LANDSCAPE_PAGE_STYLE } from 'src/components/print/print-document';
import { exportDesktopPdf, canUseDesktopPrint, openDesktopPrintPreview } from 'src/utils/desktop-print';

import { PastoralPrintDocument, type PastoralPrintRow } from './pastoral-print-document';

type PrintIdentity = {
  email?: string;
  logoUtilisateur?: string;
  nomTemple?: string;
  nomUtilisateur?: string;
  prenomUtilisateur?: string;
  telephoneUtilisateur?: string;
};

type PrintEtatPastoralProps = {
  identity?: PrintIdentity;
  rows: PastoralPrintRow[];
  subtitle: string;
};

export function PrintEtatPastoral({ identity, rows, subtitle }: PrintEtatPastoralProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isDesktopPrint = canUseDesktopPrint();
  const open = Boolean(anchorEl);
  const meta = { title: 'Suivi pastoral', fileName: 'suivi-pastoral' };

  return (
    <>
      <Button
        variant="outlined"
        color="inherit"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        startIcon={<PrintIcon sx={{ display: { xs: 'inline-flex', sm: 'none' } }} />}
        endIcon={<KeyboardArrowDownIcon sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />}
        sx={{ minWidth: { xs: 44, sm: 'auto' }, px: { xs: 1.25, sm: 2 } }}
      >
        <span style={{ display: 'inline' }}>Imprimer</span>
      </Button>

      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        {isDesktopPrint ? (
          [
            <MenuItem
              key="preview"
              onClick={async () => {
                setAnchorEl(null);
                await openDesktopPrintPreview(printRef.current, { title: `Aperçu - ${meta.title}`, fileName: meta.fileName, orientation: 'landscape' });
              }}
            >
              <VisibilityIcon style={{ marginRight: 10 }} />Aperçu avant impression
            </MenuItem>,
            <MenuItem
              key="pdf"
              onClick={async () => {
                setAnchorEl(null);
                await exportDesktopPdf(printRef.current, { ...meta, orientation: 'landscape' });
              }}
            >
              <PictureAsPdfIcon style={{ marginRight: 10 }} />Exporter en PDF
            </MenuItem>,
          ]
        ) : (
          <MenuItem onClick={() => setAnchorEl(null)}>
            <PrintIcon style={{ marginRight: 10 }} />
            <ReactToPrint
              trigger={() => <div>Imprimer / PDF</div>}
              content={() => printRef.current}
              pageStyle={PRINT_LANDSCAPE_PAGE_STYLE}
              documentTitle={meta.fileName}
            />
          </MenuItem>
        )}
        <Divider sx={{ my: 0.5 }} />
        <MenuItem disabled sx={{ opacity: '0.6 !important' }}>
          {subtitle}
        </MenuItem>
      </Menu>

      {/* Composant jamais affiche a l'ecran : sert uniquement de source pour l'impression/PDF. */}
      <div style={{ display: 'none' }}>
        <div ref={printRef}>
          <PastoralPrintDocument identity={identity} rows={rows} subtitle={subtitle} />
        </div>
      </div>
    </>
  );
}

export default PrintEtatPastoral;
