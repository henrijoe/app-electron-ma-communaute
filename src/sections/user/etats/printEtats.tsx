import React, { useRef, useState, forwardRef } from 'react';
import PrintIcon from '@mui/icons-material/Print';
import Button from '@mui/material/Button';
import ReactToPrint from 'react-to-print';
import { styled, alpha } from '@mui/material/styles';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { ListeDesMembres } from './listeMembrePdf';
import { FicheDecision } from './ficheDecision';
import CoursDeBaseForm from './ficheCoursDebase';

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
    minWidth: 180,
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
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity,
        ),
      },
    },
  },
}));

// Composant pour imprimer la liste des membres
const ComponentToPrintMembres = forwardRef<HTMLDivElement>((props, ref) => (
  <div ref={ref}>
    <ListeDesMembres />
  </div>
));

// Composant pour imprimer la liste des diacres
const ComponentToPrintDiacres = forwardRef<HTMLDivElement>((props, ref) => (
  <div ref={ref}>
    <FicheDecision />
  </div>
));

// Composant pour imprimer la fiche de cours de base
const ComponentToPrintCoursDebase = forwardRef<HTMLDivElement>((props, ref) => (
  <div ref={ref}>
    <CoursDeBaseForm />
  </div>
));

const PrintEtatGlobal = () => {
  const membreRef = useRef<HTMLDivElement>(null);
  const ficheDecisionRef = useRef<HTMLDivElement>(null);
  const coursDebaseRef = useRef<HTMLDivElement>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        id="demo-customized-button"
        aria-controls={open ? 'demo-customized-menu' : undefined}
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
        id="demo-customized-menu"
        MenuListProps={{
          'aria-labelledby': 'demo-customized-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem 
          onClick={handleClose}
          sx={{ height: 32 }}
        >
          <PrintIcon />
          <ReactToPrint
            trigger={() => <div>Liste des membres</div>}
            content={() => membreRef.current}
          />
          <div style={{ display: 'none' }}>
            <ComponentToPrintMembres ref={membreRef} />
          </div>
        </MenuItem>

        <Divider sx={{ my: 0.5 }} />
        
        <MenuItem 
          onClick={handleClose}
          sx={{ height: 32 }}
        >
          <PrintIcon />
          <ReactToPrint
            trigger={() => <div>Fiche de décision</div>}
            content={() => ficheDecisionRef.current}
          />
          <div style={{ display: 'none' }}>
            <ComponentToPrintDiacres ref={ficheDecisionRef} />
          </div>
        </MenuItem>
        
        {/* <Divider sx={{ my: 0.5 }} />
        <MenuItem 
          onClick={handleClose}
          sx={{ height: 32 }}
        >
          <PrintIcon />
          <ReactToPrint
            trigger={() => <div>Fiche de cours de base</div>}
            content={() => coursDebaseRef.current}
          />
          <div style={{ display: 'none' }}>
            <ComponentToPrintCoursDebase ref={coursDebaseRef} />
          </div>
        </MenuItem> */}
      </StyledMenu>
    </div>
  );
};

export default PrintEtatGlobal;