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

import { isDesktopAppRuntime } from 'src/utils/access-control';
import { canUseDesktopPrint, exportDesktopPdf, openDesktopPrintPreview } from 'src/utils/desktop-print';
import type { IGalerieEvenement, IGalerieImage } from 'src/store/galerieSlice';

import { GaleriePrintDocument } from './galerie-print-document';

type PrintEtatGalerieProps = {
  event: IGalerieEvenement;
  images: IGalerieImage[];
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

const ComponentToPrint = forwardRef<HTMLDivElement, PrintEtatGalerieProps>(({ event, images }, ref) => (
  <div ref={ref}>
    <GaleriePrintDocument event={event} images={images} />
  </div>
));

export function PrintEtatGalerie({ event, images }: PrintEtatGalerieProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isDesktopPrint = canUseDesktopPrint();
  const open = Boolean(anchorEl);
  const meta = useMemo(() => ({ title: `Galerie - ${event.titreGalerie}`, fileName: `galerie-${event.dossierGalerie || event.idGalerie}` }), [event]);

  if (isDesktopAppRuntime()) {
    return null;
  }

  return (
    <>
      <Button variant="contained" onClick={(evt) => setAnchorEl(evt.currentTarget)} endIcon={<KeyboardArrowDownIcon />} sx={{ bgcolor: 'grey.900', color: 'common.white', '&:hover': { bgcolor: 'grey.800' } }}>
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
        <ComponentToPrint ref={printRef} event={event} images={images} />
      </div>
    </>
  );
}

export default PrintEtatGalerie;
