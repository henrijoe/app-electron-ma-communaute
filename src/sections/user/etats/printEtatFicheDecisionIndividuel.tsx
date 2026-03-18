import React, { useRef } from 'react';
import PrintIcon from '@mui/icons-material/Print';
import { Typography, Box } from '@mui/material';
import ReactToPrint from 'react-to-print';
import { FicheIndividuelDecision } from './ficheDecisionIndividuel';

function PrintFicheIndividuelDecision() {
  const componentRef = useRef<HTMLDivElement>(null);

  return (
    <Box>
      <ReactToPrint
        trigger={() => (
          <Typography
            sx={{
              fontSize: '14px',
              textTransform: 'normal',
              color: 'blue',
              marginLeft: '10px',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            Fiche de décision
          </Typography>
        )}
        content={() => componentRef.current}
      />
      <Box sx={{ display: 'none' }}>
        <div ref={componentRef}>
          <FicheIndividuelDecision />
        </div>
      </Box>
    </Box>
  );
}

export default PrintFicheIndividuelDecision;