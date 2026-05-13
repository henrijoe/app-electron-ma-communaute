import { Typography, Box } from '@mui/material';
import React, { useRef } from 'react';
import ReactToPrint from 'react-to-print';

import { isDesktopAppRuntime } from 'src/utils/access-control';

import { FicheDecision } from './ficheDecision';

function PrintFicheDecision() {
  const componentRef = useRef<HTMLDivElement>(null);

  if (isDesktopAppRuntime()) {
    return null;
  }

  return (
    <Box>
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
                '&:hover': {
                  textDecoration: 'underline',
                }
              }}
            >
              Fiche de décision
            </Typography>
          )}
          content={() => componentRef.current}
        />
        <Box sx={{ display: 'none' }}>
          <div ref={componentRef}>
            <FicheDecision />
          </div>
        </Box>
      </Box>
    </Box>
  );
}

export default PrintFicheDecision;
