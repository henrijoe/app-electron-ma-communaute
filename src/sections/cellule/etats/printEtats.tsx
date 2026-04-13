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

import { canUseDesktopPrint, exportDesktopPdf, openDesktopPrintPreview } from 'src/utils/desktop-print';

import { ListeDesCellules } from './listeCellulePdf';

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

const ComponentToPrintCellules = forwardRef<HTMLDivElement>((_, ref) => <div ref={ref}><ListeDesCellules /></div>);

export const PrintEtatGlobal = () => {
  const celluleRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isDesktopPrint = canUseDesktopPrint();
  const open = Boolean(anchorEl);

  return (
    <div>
      <Button variant="contained" color="inherit" onClick={(event) => setAnchorEl(event.currentTarget)} endIcon={<KeyboardArrowDownIcon />}>Imprimer</Button>
      <StyledMenu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        {isDesktopPrint ? (
          <>
            <MenuItem onClick={async () => { setAnchorEl(null); await openDesktopPrintPreview(celluleRef.current, { title: 'Aperçu - Liste des cellules', fileName: 'liste-cellules' }); }}><VisibilityIcon />Aperçu avant impression</MenuItem>
            <MenuItem onClick={async () => { setAnchorEl(null); await exportDesktopPdf(celluleRef.current, { title: 'Liste des cellules', fileName: 'liste-cellules' }); }}><PictureAsPdfIcon />Exporter en PDF</MenuItem>
          </>
        ) : (
          <MenuItem onClick={() => setAnchorEl(null)}><PrintIcon /><ReactToPrint trigger={() => <div>Liste des cellules</div>} content={() => celluleRef.current} /></MenuItem>
        )}
        <Divider sx={{ my: 0.5 }} />
      </StyledMenu>
      <div style={{ display: 'none' }}><ComponentToPrintCellules ref={celluleRef} /></div>
    </div>
  );
};

export default PrintEtatGlobal;
