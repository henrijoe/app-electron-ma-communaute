import React, { useRef } from 'react';
import PrintIcon from '@mui/icons-material/Print';
import { Typography, Box } from '@mui/material';
import ReactToPrint from 'react-to-print';

import { isDesktopAppRuntime } from 'src/utils/access-control';

function PrintFicheIndividuelDecision() {
  const componentRef = useRef<HTMLDivElement>(null);

  if (isDesktopAppRuntime()) {
    return null;
  }

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
          <Typography>Fiche de décision</Typography>
        </div>
      </Box>
    </Box>
  );
}

export default PrintFicheIndividuelDecision;
