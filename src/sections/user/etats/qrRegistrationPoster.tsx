import { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type QrRegistrationPosterProps = {
  churchName: string;
  qrValue: string;
};

export const QrRegistrationPoster = forwardRef<HTMLDivElement, QrRegistrationPosterProps>(
  ({ churchName, qrValue }, ref) => (
    <div ref={ref}>
      <Box
        sx={{
          width: '190mm',
          minHeight: '277mm',
          boxSizing: 'border-box',
          p: '18mm 14mm',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          bgcolor: '#ffffff',
          color: '#0f172a',
        }}
      >
        <Typography sx={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: 0.5, mb: 0.5 }}>
          {churchName}
        </Typography>

        <Typography sx={{ fontSize: '2.1rem', fontWeight: 900, mb: '10mm' }}>
          Inscription membre
        </Typography>

        {qrValue && (
          <Box
            sx={{
              p: '8mm',
              borderRadius: 3,
              border: '2px solid #0f172a',
              display: 'inline-flex',
            }}
          >
            <QRCodeSVG value={qrValue} size={340} level="M" />
          </Box>
        )}

        <Typography sx={{ fontSize: '1.15rem', fontWeight: 700, mt: '10mm', maxWidth: '150mm' }}>
          Scannez ce QR code avec votre téléphone pour vous enregistrer
        </Typography>
        <Typography sx={{ fontSize: '0.95rem', color: '#475569', mt: '3mm', maxWidth: '150mm' }}>
          Le téléphone doit être connecté au même réseau Wi-Fi que le poste principal.
        </Typography>
      </Box>
    </div>
  )
);
