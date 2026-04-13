import React, { forwardRef, useMemo, useRef, useState } from 'react';
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

import { canUseDesktopPrint, exportDesktopPdf, openDesktopPrintPreview } from 'src/utils/desktop-print';
import type { IDeces } from 'src/store/decesSlice';
import type { IMariage } from 'src/store/mariageSlice';
import type { INaissance } from 'src/store/naissanceSlice';

import type { IMaladieDraft, SocialCaseType } from '../types';
import { SocialPrintDocument } from './social-print-document';

type PrintIdentity = {
  email?: string;
  logoUtilisateur?: string;
  nomTemple?: string;
  nomUtilisateur?: string;
  prenomUtilisateur?: string;
  telephoneUtilisateur?: string;
};

type PrintEtatsProps = {
  activeType: SocialCaseType;
  identity?: PrintIdentity;
  rows: IDeces[] | IMaladieDraft[] | IMariage[] | INaissance[];
};

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
    boxShadow: 'rgb(255, 255, 255) 0 0 0 0, rgba(15, 23, 42, 0.06) 0 0 0 1px, rgba(15, 23, 42, 0.14) 0 18px 40px -12px',
    '& .MuiMenu-list': { padding: '6px' },
    '& .MuiMenuItem-root': {
      borderRadius: 8,
      gap: 10,
      '&:active': { backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity) },
    },
  },
}));

const labels: Record<SocialCaseType, { fileName: string; title: string }> = {
  mariage: { title: 'Liste des mariages', fileName: 'liste-mariages' },
  naissance: { title: 'Liste des naissances', fileName: 'liste-naissances' },
  deces: { title: 'Liste des deces', fileName: 'liste-deces' },
  maladie: { title: 'Liste des maladies', fileName: 'liste-maladies' },
};

const ComponentToPrint = forwardRef<HTMLDivElement, PrintEtatsProps>(({ activeType, identity, rows }, ref) => (
  <div ref={ref}>
    <SocialPrintDocument type={activeType} identity={identity} rows={rows} />
  </div>
));

export function PrintEtatSociaux({ activeType, identity, rows }: PrintEtatsProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isDesktopPrint = canUseDesktopPrint();
  const open = Boolean(anchorEl);
  const meta = useMemo(() => labels[activeType], [activeType]);

  return (
    <>
      <Button variant="contained" color="inherit" onClick={(event) => setAnchorEl(event.currentTarget)} endIcon={<KeyboardArrowDownIcon />}>
        Imprimer
      </Button>
      <StyledMenu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        {isDesktopPrint ? (
          <>
            <MenuItem
              onClick={async () => {
                setAnchorEl(null);
                await openDesktopPrintPreview(printRef.current, {
                  title: `Apercu - ${meta.title}`,
                  fileName: meta.fileName,
                });
              }}
            >
              <VisibilityIcon />Apercu avant impression
            </MenuItem>
            <MenuItem
              onClick={async () => {
                setAnchorEl(null);
                await exportDesktopPdf(printRef.current, {
                  title: meta.title,
                  fileName: meta.fileName,
                });
              }}
            >
              <PictureAsPdfIcon />Exporter en PDF
            </MenuItem>
          </>
        ) : (
          <MenuItem onClick={() => setAnchorEl(null)}>
            <PrintIcon />
            <ReactToPrint trigger={() => <div>{meta.title}</div>} content={() => printRef.current} />
          </MenuItem>
        )}
        <Divider sx={{ my: 0.5 }} />
      </StyledMenu>
      <div style={{ display: 'none' }}>
        <ComponentToPrint ref={printRef} activeType={activeType} identity={identity} rows={rows} />
      </div>
    </>
  );
}

export default PrintEtatSociaux;
