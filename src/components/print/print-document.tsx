import React from 'react';
import {
  Box,
  Chip,
  Divider,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { resolveStaticAssetUrl } from 'src/utils/asset-url';

type PrintIdentity = {
  logoUtilisateur?: string;
  nomTemple?: string;
  prenomUtilisateur?: string;
  nomUtilisateur?: string;
  telephoneUtilisateur?: string;
  email?: string;
};

type PrintDocumentLayoutProps = {
  identity?: PrintIdentity;
  title: string;
  subtitle: string;
  countLabel: string;
  countValue: number;
  children: React.ReactNode;
};

type PrintTableProps = {
  children: React.ReactNode;
  minWidth?: number;
};

type PrintEmptyStateProps = {
  title: string;
  message: string;
};

const getPrintableLogoUrl = (logoPath?: string): string | null => {
  // On ignore les logos absents pour garder un rendu propre sans image cassée.
  if (!logoPath) {
    return null;
  }

  // Les logos deja absolus ou embarques peuvent etre utilises directement.
  if (/^(https?:|data:|blob:|file:)/i.test(logoPath)) {
    return logoPath;
  }

  // Les logos du bundle front doivent etre resolus contre la base Vite/Electron.
  return resolveStaticAssetUrl(logoPath);
};

export function PrintDocumentLayout({
  identity,
  title,
  subtitle,
  countLabel,
  countValue,
  children,
}: PrintDocumentLayoutProps) {
  // On prepare l'eventuel logo pour le bandeau haut du document.
  const logoUrl = getPrintableLogoUrl(identity?.logoUtilisateur);
  // On capture la date de generation une seule fois pour tout le document.
  const generatedAt = new Date().toLocaleString('fr-FR');
  // On construit un nom lisible pour la personne connectee quand l'information existe.
  const generatedBy = [identity?.prenomUtilisateur, identity?.nomUtilisateur].filter(Boolean).join(' ');

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 1180,
        mx: 'auto',
        p: 3,
        backgroundColor: '#eef3f8',
        minHeight: '100vh',
      }}
    >
      <Box
        sx={{
          background:
            'linear-gradient(135deg, rgba(14, 37, 74, 0.98) 0%, rgba(28, 83, 128, 0.96) 55%, rgba(181, 142, 61, 0.92) 100%)',
          color: 'common.white',
          borderRadius: 4,
          px: 4,
          py: 3.5,
          mb: 3,
          boxShadow: '0 20px 45px rgba(18, 38, 63, 0.16)',
        }}
      >
        <Stack direction="row" spacing={3} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2.5} alignItems="center">
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.12)',
                border: '1px solid rgba(255,255,255,0.22)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {logoUrl ? (
                <Box
                  component="img"
                  src={logoUrl}
                  alt="Logo"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  MC
                </Typography>
              )}
            </Box>

            <Box>
              <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.85 }}>
                Ma Communaute
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                {identity?.nomTemple || 'Communaute locale'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.75, opacity: 0.92, maxWidth: 520 }}>
                {identity?.telephoneUtilisateur
                  ? `Contact principal : ${identity.telephoneUtilisateur}`
                  : 'Document imprime depuis l’application desktop de gestion communautaire.'}
              </Typography>
            </Box>
          </Stack>

          <Stack spacing={1} alignItems="flex-end">
            <Chip
              label={countLabel}
              sx={{
                color: 'common.white',
                backgroundColor: 'rgba(255,255,255,0.16)',
                border: '1px solid rgba(255,255,255,0.16)',
                fontWeight: 700,
              }}
            />
            <Typography variant="caption" sx={{ opacity: 0.84 }}>
              {generatedAt}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <Box
        sx={{
          backgroundColor: 'common.white',
          borderRadius: 4,
          p: 4,
          boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)',
          border: '1px solid rgba(15, 23, 42, 0.08)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, color: '#0f274a', textTransform: 'uppercase', letterSpacing: 0.8 }}
            >
              {title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>
              {subtitle}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.25} flexWrap="wrap">
            <Chip label={`${countLabel} : ${countValue}`} color="primary" variant="outlined" />
            <Chip label={`Genere par : ${generatedBy || 'Systeme local'}`} variant="outlined" />
          </Stack>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {children}

        <Divider sx={{ mt: 3, mb: 2 }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="body2" color="text.secondary">
            Document genere automatiquement pour impression ou export PDF.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {countLabel} : {countValue}
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

export function PrintTable({ children, minWidth = 900 }: PrintTableProps) {
  return (
    <TableContainer
      sx={{
        borderRadius: 3,
        border: '1px solid rgba(15, 23, 42, 0.1)',
        overflow: 'hidden',
      }}
    >
      <Table
        sx={{
          minWidth,
          '& .MuiTableCell-root': {
            py: 1.5,
            px: 1.5,
            borderColor: 'rgba(15, 23, 42, 0.08)',
            verticalAlign: 'top',
          },
          '& .MuiTableHead-root': {
            backgroundColor: '#e8f0fb',
            '& .MuiTableCell-root': {
              color: '#0f274a',
              fontWeight: 800,
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: 0.5,
            },
          },
          '& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even)': {
            backgroundColor: '#f8fafc',
          },
        }}
      >
        {children}
      </Table>
    </TableContainer>
  );
}

export function PrintEmptyState({ title, message }: PrintEmptyStateProps) {
  return (
    <Box
      sx={{
        py: 8,
        textAlign: 'center',
        borderRadius: 3,
        border: '1px dashed rgba(15, 23, 42, 0.16)',
        backgroundColor: '#fafcff',
      }}
    >
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

export { TableBody, TableCell, TableHead, TableRow };
