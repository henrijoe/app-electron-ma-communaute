import React, { forwardRef, useRef, useState } from 'react';
import PrintIcon from '@mui/icons-material/Print';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Button from '@mui/material/Button';
import { alpha, styled } from '@mui/material/styles';
import Menu, { type MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ReactToPrint from 'react-to-print';

import { exportDesktopPdf, openDesktopPrintPreview, canUseDesktopPrint } from 'src/utils/desktop-print';

import { ListeDesDepartements } from './listeDepartementPdf';

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 220,
    color: theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
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

const ComponentToPrintDepartements = forwardRef<HTMLDivElement>((props, ref) => (
  <div ref={ref}>
    <ListeDesDepartements />
  </div>
));

const PrintEtatGlobal = () => {
  const departementRef = useRef<HTMLDivElement>(null);
  const reactToPrintTriggerRef = useRef<HTMLDivElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isDesktopPrint = canUseDesktopPrint();

  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpenPreview = async () => {
    handleClose();
    await openDesktopPrintPreview(departementRef.current, {
      title: 'Aperçu - Liste des départements',
      fileName: 'liste-departements',
    });
  };

  const handleExportPdf = async () => {
    handleClose();
    await exportDesktopPdf(departementRef.current, {
      title: 'Liste des départements',
      fileName: 'liste-departements',
    });
  };

  return (
    <div>
      <Button
        id="print-departement-button"
        aria-controls={open ? 'print-departement-menu' : undefined}
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
        id="print-departement-menu"
        MenuListProps={{
          'aria-labelledby': 'print-departement-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {isDesktopPrint ? (
          <>
            <MenuItem onClick={handleOpenPreview}>
              <VisibilityIcon />
              Aperçu avant impression
            </MenuItem>

            <MenuItem onClick={handleExportPdf}>
              <PictureAsPdfIcon />
              Exporter en PDF
            </MenuItem>
          </>
        ) : (
          <MenuItem onClick={handleClose}>
            <PrintIcon />
            <ReactToPrint
              trigger={() => <div ref={reactToPrintTriggerRef}>Liste des départements</div>}
              content={() => departementRef.current}
            />
          </MenuItem>
        )}

        <Divider sx={{ my: 0.5 }} />
      </StyledMenu>

      <div style={{ display: 'none' }}>
        <ComponentToPrintDepartements ref={departementRef} />
      </div>
    </div>
  );
};

export default PrintEtatGlobal;

