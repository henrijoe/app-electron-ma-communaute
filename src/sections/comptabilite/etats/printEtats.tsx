import type { IComptabiliteItem } from 'src/store/comptabiliteSlice';

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

import { ComptabiliteArchiveDocument } from './comptabilite-archive-document';
import { ComptabiliteJournalDocument } from './comptabilite-journal-document';
import { ComptabiliteSummaryDocument } from './comptabilite-summary-document';
import { ComptabiliteMovementDocument } from './comptabilite-movement-document';
import { FicheComptabiliteRenseignement } from './ficheComptabiliteRenseignement';

type BasePrintDocumentProps = {
  filterLabel: string;
  items: IComptabiliteItem[];
  search: string;
};

type ArchivePrintDocumentProps = {
  deletedItems?: IComptabiliteItem[];
  filterLabel: string;
};

type PrintEtatComptabiliteProps = {
  deletedItems?: IComptabiliteItem[];
  filterLabel: string;
  isSuperAdmin?: boolean;
  items: IComptabiliteItem[];
  search: string;
};

type PrintDocumentMeta = {
  fileName: string;
  title: string;
};

type PrintTarget = 'archive' | 'entrees' | 'journal' | 'sorties' | 'summary';

const hiddenPrintHostStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: '-10000px',
  width: '210mm',
  pointerEvents: 'none',
  zIndex: -1,
};

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 10,
    marginTop: theme.spacing(1),
    minWidth: 250,
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

const JournalComponent = forwardRef<HTMLDivElement, BasePrintDocumentProps>(
  ({ items, search, filterLabel }, ref) => (
    <div ref={ref}>
      <ComptabiliteJournalDocument filterLabel={filterLabel} items={items} search={search} />
    </div>
  )
);

const EntreesComponent = forwardRef<HTMLDivElement, BasePrintDocumentProps>(
  ({ items, search, filterLabel }, ref) => (
    <div ref={ref}>
      <ComptabiliteMovementDocument
        filterLabel={filterLabel}
        items={items}
        search={search}
        type="entree"
      />
    </div>
  )
);

const SortiesComponent = forwardRef<HTMLDivElement, BasePrintDocumentProps>(
  ({ items, search, filterLabel }, ref) => (
    <div ref={ref}>
      <ComptabiliteMovementDocument
        filterLabel={filterLabel}
        items={items}
        search={search}
        type="sortie"
      />
    </div>
  )
);

const SummaryComponent = forwardRef<HTMLDivElement, BasePrintDocumentProps>(
  ({ items, search, filterLabel }, ref) => (
    <div ref={ref}>
      <ComptabiliteSummaryDocument filterLabel={filterLabel} items={items} search={search} />
    </div>
  )
);

const ArchiveComponent = forwardRef<HTMLDivElement, ArchivePrintDocumentProps>(
  ({ deletedItems = [], filterLabel }, ref) => (
    <div ref={ref}>
      <ComptabiliteArchiveDocument filterLabel={filterLabel} items={deletedItems} />
    </div>
  )
);

const FormComponent = forwardRef<HTMLDivElement>((_, ref) => (
  <div ref={ref}>
    <FicheComptabiliteRenseignement />
  </div>
));

export function PrintEtatComptabilite({
  items,
  deletedItems = [],
  filterLabel,
  isSuperAdmin = false,
  search,
}: PrintEtatComptabiliteProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const archiveRef = useRef<HTMLDivElement>(null);
  const entreesRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const isDesktopPrint = canUseDesktopPrint();
  const journalRef = useRef<HTMLDivElement>(null);
  const open = Boolean(anchorEl);
  const sortiesRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const meta = useMemo(
    () => ({
      archive: {
        fileName: 'comptabilite-archive',
        title: 'Comptabilité - Archive comptable',
      },
      entrees: {
        fileName: 'comptabilite-entrees',
        title: 'Comptabilité - État des entrées',
      },
      journal: {
        fileName: 'comptabilite-journal',
        title: 'Comptabilité - Journal de caisse',
      },
      sorties: {
        fileName: 'comptabilite-sorties',
        title: 'Comptabilité - État des sorties',
      },
      summary: {
        fileName: 'comptabilite-synthese',
        title: 'Comptabilité - Situation de trésorerie',
      },
      form: {
        fileName: 'fiche-renseignement-comptabilite',
        title: 'Fiche de renseignement comptabilité',
      },
    }),
    []
  );

  if (isDesktopAppRuntime()) {
    return null;
  }

  const getTargetRef = (target: PrintTarget) => {
    switch (target) {
      case 'archive':
        return archiveRef;
      case 'entrees':
        return entreesRef;
      case 'sorties':
        return sortiesRef;
      case 'summary':
        return summaryRef;
      case 'journal':
      default:
        return journalRef;
    }
  };

  const runDesktopAction = async (
    target: PrintTarget,
    action: (element: HTMLElement | null, metaArg: PrintDocumentMeta) => Promise<void>
  ) => {
    setAnchorEl(null);
    await action(getTargetRef(target).current, meta[target]);
  };

  return (
    <>
      <Button
        startIcon={<PrintIcon sx={{ display: { xs: 'inline-flex', sm: 'none' } }} />}
        endIcon={<KeyboardArrowDownIcon sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />}
        onClick={(evt) => setAnchorEl(evt.currentTarget)}
        sx={{
          minWidth: { xs: 44, sm: 'auto' },
          px: { xs: 1.25, sm: 1.75 },
          height: 42,
          borderRadius: 2,
          bgcolor: 'grey.900',
          color: 'common.white',
          '&:hover': { bgcolor: 'grey.800' },
        }}
        variant="contained"
      >
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
          États comptables
        </Box>
      </Button>

      <StyledMenu anchorEl={anchorEl} onClose={() => setAnchorEl(null)} open={open}>
        {isDesktopPrint ? (
          <>
            <MenuItem
              onClick={async () => {
                setAnchorEl(null);
                await openDesktopPrintPreview(formRef.current, {
                  title: `Aperçu - ${meta.form.title}`,
                  fileName: meta.form.fileName,
                });
              }}
            >
              <VisibilityIcon />
              Fiche de renseignement
            </MenuItem>
            <MenuItem
              onClick={async () => {
                setAnchorEl(null);
                await exportDesktopPdf(formRef.current, meta.form);
              }}
            >
              <PictureAsPdfIcon />
              Exporter fiche de renseignement
            </MenuItem>
            <Divider sx={{ my: 0.5 }} />
            <MenuItem
              onClick={() =>
                runDesktopAction('journal', (element, itemMeta) =>
                  openDesktopPrintPreview(element, {
                    title: `Aperçu - ${itemMeta.title}`,
                    fileName: itemMeta.fileName,
                  })
                )
              }
            >
              <VisibilityIcon />
              Journal de caisse
            </MenuItem>
            <MenuItem
              onClick={() =>
                runDesktopAction('entrees', (element, itemMeta) =>
                  openDesktopPrintPreview(element, {
                    title: `Aperçu - ${itemMeta.title}`,
                    fileName: itemMeta.fileName,
                  })
                )
              }
            >
              <VisibilityIcon />
              État des entrées
            </MenuItem>
            <MenuItem
              onClick={() =>
                runDesktopAction('sorties', (element, itemMeta) =>
                  openDesktopPrintPreview(element, {
                    title: `Aperçu - ${itemMeta.title}`,
                    fileName: itemMeta.fileName,
                  })
                )
              }
            >
              <VisibilityIcon />
              État des sorties
            </MenuItem>
            <MenuItem
              onClick={() =>
                runDesktopAction('summary', (element, itemMeta) =>
                  openDesktopPrintPreview(element, {
                    title: `Aperçu - ${itemMeta.title}`,
                    fileName: itemMeta.fileName,
                  })
                )
              }
            >
              <VisibilityIcon />
              Situation de trésorerie
            </MenuItem>
            {isSuperAdmin && (
              <MenuItem
                onClick={() =>
                  runDesktopAction('archive', (element, itemMeta) =>
                    openDesktopPrintPreview(element, {
                      title: `Aperçu - ${itemMeta.title}`,
                      fileName: itemMeta.fileName,
                    })
                  )
                }
              >
                <VisibilityIcon />
                Archive comptable
              </MenuItem>
            )}
            <Divider sx={{ my: 0.5 }} />
            <MenuItem onClick={() => runDesktopAction('journal', exportDesktopPdf)}>
              <PictureAsPdfIcon />
              Exporter journal en PDF
            </MenuItem>
            <MenuItem onClick={() => runDesktopAction('entrees', exportDesktopPdf)}>
              <PictureAsPdfIcon />
              Exporter entrées en PDF
            </MenuItem>
            <MenuItem onClick={() => runDesktopAction('sorties', exportDesktopPdf)}>
              <PictureAsPdfIcon />
              Exporter sorties en PDF
            </MenuItem>
            <MenuItem onClick={() => runDesktopAction('summary', exportDesktopPdf)}>
              <PictureAsPdfIcon />
              Exporter synthèse en PDF
            </MenuItem>
            {isSuperAdmin && (
              <MenuItem onClick={() => runDesktopAction('archive', exportDesktopPdf)}>
                <PictureAsPdfIcon />
                Exporter archive en PDF
              </MenuItem>
            )}
          </>
        ) : (
          <>
            <MenuItem onClick={() => setAnchorEl(null)}>
              <PrintIcon />
              Fiche de renseignement
              <ReactToPrint
                content={() => formRef.current}
                pageStyle={PRINT_PORTRAIT_PAGE_STYLE}
                trigger={() => <div>{meta.form.title}</div>}
              />
            </MenuItem>
            <MenuItem onClick={() => setAnchorEl(null)}>
              <PrintIcon />
              Journal de caisse
              <ReactToPrint
                content={() => journalRef.current}
                pageStyle={PRINT_LANDSCAPE_PAGE_STYLE}
                trigger={() => <div>{meta.journal.title}</div>}
              />
            </MenuItem>
            <MenuItem onClick={() => setAnchorEl(null)}>
              <PrintIcon />
              État des entrées
              <ReactToPrint
                content={() => entreesRef.current}
                pageStyle={PRINT_LANDSCAPE_PAGE_STYLE}
                trigger={() => <div>{meta.entrees.title}</div>}
              />
            </MenuItem>
            <MenuItem onClick={() => setAnchorEl(null)}>
              <PrintIcon />
              État des sorties
              <ReactToPrint
                content={() => sortiesRef.current}
                pageStyle={PRINT_LANDSCAPE_PAGE_STYLE}
                trigger={() => <div>{meta.sorties.title}</div>}
              />
            </MenuItem>
            <MenuItem onClick={() => setAnchorEl(null)}>
              <PrintIcon />
              Situation de trésorerie
              <ReactToPrint
                content={() => summaryRef.current}
                pageStyle={PRINT_LANDSCAPE_PAGE_STYLE}
                trigger={() => <div>{meta.summary.title}</div>}
              />
            </MenuItem>
            {isSuperAdmin && (
              <MenuItem onClick={() => setAnchorEl(null)}>
                <PrintIcon />
                Archive comptable
                <ReactToPrint
                  content={() => archiveRef.current}
                  pageStyle={PRINT_LANDSCAPE_PAGE_STYLE}
                  trigger={() => <div>{meta.archive.title}</div>}
                />
              </MenuItem>
            )}
          </>
        )}
      </StyledMenu>

      <div aria-hidden="true" style={hiddenPrintHostStyle}>
        <JournalComponent filterLabel={filterLabel} items={items} ref={journalRef} search={search} />
      </div>
      <div aria-hidden="true" style={hiddenPrintHostStyle}>
        <EntreesComponent filterLabel={filterLabel} items={items} ref={entreesRef} search={search} />
      </div>
      <div aria-hidden="true" style={hiddenPrintHostStyle}>
        <SortiesComponent filterLabel={filterLabel} items={items} ref={sortiesRef} search={search} />
      </div>
      <div aria-hidden="true" style={hiddenPrintHostStyle}>
        <SummaryComponent filterLabel={filterLabel} items={items} ref={summaryRef} search={search} />
      </div>
      {isSuperAdmin && (
        <div aria-hidden="true" style={hiddenPrintHostStyle}>
          <ArchiveComponent deletedItems={deletedItems} filterLabel={filterLabel} ref={archiveRef} />
        </div>
      )}
      <div aria-hidden="true" style={hiddenPrintHostStyle}>
        <FormComponent ref={formRef} />
      </div>
    </>
  );
}

export default PrintEtatComptabilite;
