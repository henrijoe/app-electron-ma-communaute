import type { IDeces } from 'src/store/decesSlice';
import type { IMariage } from 'src/store/mariageSlice';
import type { INaissance } from 'src/store/naissanceSlice';

import ReactToPrint from 'react-to-print';
import React, { useRef, useMemo, useState, forwardRef } from 'react';

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
import {
  exportDesktopPdf,
  canUseDesktopPrint,
  openDesktopPrintPreview,
} from 'src/utils/desktop-print';
import {
  PRINT_PORTRAIT_PAGE_STYLE,
  PRINT_LANDSCAPE_PAGE_STYLE,
} from 'src/components/print/print-document';

import { SocialPrintDocument } from './social-print-document';
import { FicheSocialeRenseignement } from './ficheSocialeRenseignement';

import type { IMaladieDraft, SocialCaseType } from '../types';

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
      gap: 10,
      '&:active': {
        backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity),
      },
    },
  },
}));

const labels: Record<SocialCaseType, { fileName: string; title: string }> = {
  mariage: { title: 'Liste des mariages', fileName: 'liste-mariages' },
  naissance: { title: 'Liste des naissances', fileName: 'liste-naissances' },
  deces: { title: 'Liste des décès', fileName: 'liste-deces' },
  maladie: { title: 'Liste des maladies', fileName: 'liste-maladies' },
};

const ComponentToPrint = forwardRef<HTMLDivElement, PrintEtatsProps>(
  ({ activeType, identity, rows }, ref) => (
    <div ref={ref}>
      <SocialPrintDocument type={activeType} identity={identity} rows={rows} />
    </div>
  )
);

const ComponentToPrintForm = forwardRef<HTMLDivElement, { activeType: SocialCaseType }>(
  ({ activeType }, ref) => (
    <div ref={ref}>
      <FicheSocialeRenseignement type={activeType} />
    </div>
  )
);

export function PrintEtatSociaux({ activeType, identity, rows }: PrintEtatsProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isDesktopPrint = canUseDesktopPrint();
  const open = Boolean(anchorEl);
  const meta = useMemo(() => labels[activeType], [activeType]);
  const formMeta = useMemo(
    () => ({
      fileName: `fiche-renseignement-${activeType}`,
      title: `Fiche de renseignement ${activeType}`,
    }),
    [activeType]
  );

  if (isDesktopAppRuntime()) {
    return null;
  }

  return (
    <>
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
      <StyledMenu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        {isDesktopPrint ? (
          <>
            <MenuItem
              onClick={async () => {
                setAnchorEl(null);
                await openDesktopPrintPreview(formRef.current, {
                  title: `Aperçu - ${formMeta.title}`,
                  fileName: formMeta.fileName,
                });
              }}
            >
              <VisibilityIcon />Aperçu fiche de renseignement
            </MenuItem>
            <MenuItem
              onClick={async () => {
                setAnchorEl(null);
                await exportDesktopPdf(formRef.current, formMeta);
              }}
            >
              <PictureAsPdfIcon />Exporter fiche de renseignement
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem
              onClick={async () => {
                setAnchorEl(null);
                await openDesktopPrintPreview(printRef.current, {
                  title: `Aperçu - ${meta.title}`,
                  fileName: meta.fileName,
                });
              }}
            >
              <VisibilityIcon />Aperçu avant impression
            </MenuItem>
            <MenuItem
              onClick={async () => {
                setAnchorEl(null);
                await exportDesktopPdf(printRef.current, meta);
              }}
            >
              <PictureAsPdfIcon />Exporter en PDF
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem onClick={() => setAnchorEl(null)}>
              <PrintIcon />
              <ReactToPrint
                trigger={() => <div>{formMeta.title}</div>}
                content={() => formRef.current}
                pageStyle={PRINT_PORTRAIT_PAGE_STYLE}
              />
            </MenuItem>
            <MenuItem onClick={() => setAnchorEl(null)}>
              <PrintIcon />
              <ReactToPrint
                trigger={() => <div>{meta.title}</div>}
                content={() => printRef.current}
                pageStyle={PRINT_LANDSCAPE_PAGE_STYLE}
              />
            </MenuItem>
          </>
        )}
      </StyledMenu>
      <div style={{ display: 'none' }}>
        <ComponentToPrint ref={printRef} activeType={activeType} identity={identity} rows={rows} />
        <ComponentToPrintForm ref={formRef} activeType={activeType} />
      </div>
    </>
  );
}

export default PrintEtatSociaux;
