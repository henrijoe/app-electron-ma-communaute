import React, { forwardRef, useRef, useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import PrintIcon from '@mui/icons-material/Print';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Menu, { type MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { alpha, styled } from '@mui/material/styles';
import ReactToPrint from 'react-to-print';

import { isDesktopAppRuntime } from 'src/utils/access-control';
import { canUseDesktopPrint, exportDesktopPdf, openDesktopPrintPreview } from 'src/utils/desktop-print';

import { ListeDesGroupes } from './listeGroupePdf';

const StyledMenu = styled((props: MenuProps) => <Menu elevation={0} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} {...props} />)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 10,
    marginTop: theme.spacing(1),
    minWidth: 220,
    boxShadow: 'rgb(255, 255, 255) 0 0 0 0, rgba(15, 23, 42, 0.06) 0 0 0 1px, rgba(15, 23, 42, 0.14) 0 18px 40px -12px',
    '& .MuiMenu-list': { padding: '6px' },
    '& .MuiMenuItem-root': {
      borderRadius: 8,
      '&:active': { backgroundColor: alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity) },
    },
  },
}));

const ComponentToPrintGroupes = forwardRef<HTMLDivElement>((_, ref) => <div ref={ref}><ListeDesGroupes /></div>);

export const PrintEtatGlobal = () => {
  const groupeRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isDesktopPrint = canUseDesktopPrint();
  const open = Boolean(anchorEl);

  if (isDesktopAppRuntime()) {
    return null;
  }

  return (
    <div>
      <Button
        variant="contained"
        color="inherit"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        startIcon={<PrintIcon sx={{ display: { xs: 'inline-flex', sm: 'none' } }} />}
        endIcon={<KeyboardArrowDownIcon sx={{ display: { xs: 'none', sm: 'inline-flex' } }} />}
        sx={{ minWidth: { xs: 44, sm: 'auto' }, px: { xs: 1.25, sm: 2 } }}
      >
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Imprimer</Box>
      </Button>
      <StyledMenu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        {isDesktopPrint ? (
          <>
            <MenuItem onClick={async () => { setAnchorEl(null); await openDesktopPrintPreview(groupeRef.current, { title: 'Aperçu - Liste des groupes', fileName: 'liste-groupes' }); }}><VisibilityIcon />Aperçu avant impression</MenuItem>
            <MenuItem onClick={async () => { setAnchorEl(null); await exportDesktopPdf(groupeRef.current, { title: 'Liste des groupes', fileName: 'liste-groupes' }); }}><PictureAsPdfIcon />Exporter en PDF</MenuItem>
          </>
        ) : (
          <MenuItem onClick={() => setAnchorEl(null)}><PrintIcon /><ReactToPrint trigger={() => <div>Liste des groupes</div>} content={() => groupeRef.current} /></MenuItem>
        )}
        <Divider sx={{ my: 0.5 }} />
      </StyledMenu>
      <div style={{ display: 'none' }}><ComponentToPrintGroupes ref={groupeRef} /></div>
    </div>
  );
};

export default PrintEtatGlobal;
