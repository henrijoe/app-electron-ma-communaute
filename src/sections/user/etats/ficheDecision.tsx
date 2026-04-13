import React from 'react';
import { Box, Stack } from '@mui/material';

import { FicheDecisionPDf } from './ficheDecisionComponent';

export const FicheDecision = () => (
  <Box sx={{ width: '100%' }}>
    <Stack spacing={3}>
      <Box>
        <FicheDecisionPDf />
      </Box>

      <Box>
        <FicheDecisionPDf />
      </Box>
    </Stack>
  </Box>
);
