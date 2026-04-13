import React from 'react';
import { Box, Stack } from '@mui/material';

import { FicheDecisionIndividuelPDf } from './ficheDecisionIndividuels';

export const FicheIndividuelDecision = () => (
  <Box sx={{ width: '100%' }}>
    <Stack spacing={3}>
      <Box>
        <FicheDecisionIndividuelPDf />
      </Box>

      <Box>
        <FicheDecisionIndividuelPDf />
      </Box>
    </Stack>
  </Box>
);
