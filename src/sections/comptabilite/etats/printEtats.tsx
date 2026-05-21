import type { IComptabiliteItem } from 'src/store/comptabiliteSlice';

import ReactToPrint from 'react-to-print';
import React, { useRef, useMemo, useState, forwardRef } from 'react';

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

import {
  exportDesktopPdf,
  canUseDesktopPrint,
  openDesktopPrintPreview,
} from 'src/utils/desktop-print';
import { isDesktopAppRuntime } from 'src/utils/access-control';

import { ComptabiliteArchiveDocument } from './comptabilite-archive-document';
import { ComptabiliteJournalDocument } from './comptabilite-journal-document';
import { ComptabiliteSummaryDocument } from './comptabilite-summary-document';
import { ComptabiliteMovementDocument } from './comptabilite-movement-document';

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
    minWidth: 250,
    boxShadow:
      'rgb(255, 255, 255) 0 0 0 0, rgba(15, 23, 42, 0.06) 0 0 0 1px, rgba(15, 23, 42, 0.14) 0 18px 40px -12px',
    '& .MuiMenu-list': { padding: '6px' },
    '& .MuiMenuItem-root': {
      borderRadius: 8,
      gap: 10,
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity
        ),
      },
    },
  },
}));

const JournalComponent = forwardRef<HTMLDivElement, BasePrintDocumentProps>(
  ({ items, search, filterLabel }, ref) => (
    <div ref={ref}>
      <ComptabiliteJournalDocument
        filterLabel={filterLabel}
        items={items}
        search={search}
      />
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
      <ComptabiliteSummaryDocument
        filterLabel={filterLabel}
        items={items}
        search={search}
      />
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
  const isDesktopPrint = canUseDesktopPrint();
  const journalRef = useRef<HTMLDivElement>(null);
  const open = Boolean(anchorEl);
  const sortiesRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const meta = useMemo(
    () => ({
      archive: {
        fileName: 'comptabilite-archive',
        title: 'Comptabilite - Archive comptable',
      },
      entrees: {
        fileName: 'comptabilite-entrees',
        title: 'Comptabilite - Etat des entrees',
      },
      journal: {
        fileName: 'comptabilite-journal',
        title: 'Comptabilite - Journal de caisse',
      },
      sorties: {
        fileName: 'comptabilite-sorties',
        title: 'Comptabilite - Etat des sorties',
      },
      summary: {
        fileName: 'comptabilite-synthese',
        title: 'Comptabilite - Situation de tresorerie',
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
          Etats comptables
        </Box>
      </Button>

      <StyledMenu anchorEl={anchorEl} onClose={() => setAnchorEl(null)} open={open}>
        {isDesktopPrint ? (
          <>
            <MenuItem
              onClick={() =>
                runDesktopAction('journal', (element, itemMeta) =>
                  openDesktopPrintPreview(element, {
                    title: `Apercu - ${itemMeta.title}`,
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
                    title: `Apercu - ${itemMeta.title}`,
                    fileName: itemMeta.fileName,
                  })
                )
              }
            >
              <VisibilityIcon />
              Etat des entrees
            </MenuItem>
            <MenuItem
              onClick={() =>
                runDesktopAction('sorties', (element, itemMeta) =>
                  openDesktopPrintPreview(element, {
                    title: `Apercu - ${itemMeta.title}`,
                    fileName: itemMeta.fileName,
                  })
                )
              }
            >
              <VisibilityIcon />
              Etat des sorties
            </MenuItem>
            <MenuItem
              onClick={() =>
                runDesktopAction('summary', (element, itemMeta) =>
                  openDesktopPrintPreview(element, {
                    title: `Apercu - ${itemMeta.title}`,
                    fileName: itemMeta.fileName,
                  })
                )
              }
            >
              <VisibilityIcon />
              Situation de tresorerie
            </MenuItem>
            {isSuperAdmin && (
              <MenuItem
                onClick={() =>
                  runDesktopAction('archive', (element, itemMeta) =>
                    openDesktopPrintPreview(element, {
                      title: `Apercu - ${itemMeta.title}`,
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
              Exporter entrees en PDF
            </MenuItem>
            <MenuItem onClick={() => runDesktopAction('sorties', exportDesktopPdf)}>
              <PictureAsPdfIcon />
              Exporter sorties en PDF
            </MenuItem>
            <MenuItem onClick={() => runDesktopAction('summary', exportDesktopPdf)}>
              <PictureAsPdfIcon />
              Exporter synthese en PDF
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
              Journal de caisse
              <ReactToPrint
                content={() => journalRef.current}
                trigger={() => <div>{meta.journal.title}</div>}
              />
            </MenuItem>
            <MenuItem onClick={() => setAnchorEl(null)}>
              <PrintIcon />
              Etat des entrees
              <ReactToPrint
                content={() => entreesRef.current}
                trigger={() => <div>{meta.entrees.title}</div>}
              />
            </MenuItem>
            <MenuItem onClick={() => setAnchorEl(null)}>
              <PrintIcon />
              Etat des sorties
              <ReactToPrint
                content={() => sortiesRef.current}
                trigger={() => <div>{meta.sorties.title}</div>}
              />
            </MenuItem>
            <MenuItem onClick={() => setAnchorEl(null)}>
              <PrintIcon />
              Situation de tresorerie
              <ReactToPrint
                content={() => summaryRef.current}
                trigger={() => <div>{meta.summary.title}</div>}
              />
            </MenuItem>
            {isSuperAdmin && (
              <MenuItem onClick={() => setAnchorEl(null)}>
                <PrintIcon />
                Archive comptable
                <ReactToPrint
                  content={() => archiveRef.current}
                  trigger={() => <div>{meta.archive.title}</div>}
                />
              </MenuItem>
            )}
          </>
        )}
      </StyledMenu>

      <div style={{ display: 'none' }}>
        <JournalComponent filterLabel={filterLabel} items={items} ref={journalRef} search={search} />
      </div>
      <div style={{ display: 'none' }}>
        <EntreesComponent filterLabel={filterLabel} items={items} ref={entreesRef} search={search} />
      </div>
      <div style={{ display: 'none' }}>
        <SortiesComponent filterLabel={filterLabel} items={items} ref={sortiesRef} search={search} />
      </div>
      <div style={{ display: 'none' }}>
        <SummaryComponent filterLabel={filterLabel} items={items} ref={summaryRef} search={search} />
      </div>
      {isSuperAdmin && (
        <div style={{ display: 'none' }}>
          <ArchiveComponent deletedItems={deletedItems} filterLabel={filterLabel} ref={archiveRef} />
        </div>
      )}
    </>
  );
}

export default PrintEtatComptabilite;
