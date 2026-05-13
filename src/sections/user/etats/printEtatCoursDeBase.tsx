import React, { useRef } from 'react';
import PrintIcon from '@mui/icons-material/Print';
import { Box, Typography } from '@mui/material';
import ReactToPrint from 'react-to-print';

import { isDesktopAppRuntime } from 'src/utils/access-control';

import CoursDeBaseForm from './ficheCoursDebase';

function PrintFicheCoursDeBase() {
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
              Fiche de cours de base
            </Typography>
          )}
          content={() => componentRef.current}
        />
        <Box sx={{ display: 'none' }}>
          <div ref={componentRef}>
            <CoursDeBaseForm />
          </div>
        </Box>
      </Box>
    </Box>
  );
}

export default PrintFicheCoursDeBase;
