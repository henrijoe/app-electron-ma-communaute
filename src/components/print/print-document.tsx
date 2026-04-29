import React from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Divider,
  GlobalStyles,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { buildChurchLogoUrl } from 'src/utils/apiClient';
import type { IReduxState } from 'src/store/store';
import { resolveStaticAssetUrl } from 'src/utils/asset-url';

type PrintIdentity = {
  logoUtilisateur?: string;
  logoEglise?: string;
  nomTemple?: string;
  lieuEglise?: string;
  prenomUtilisateur?: string;
  nomUtilisateur?: string;
  telephoneUtilisateur?: string;
  telephoneSecretariatEglise?: string;
  pasteurPrincipal?: string;
  pasteurSecondaire?: string;
  pasteurTroisieme?: string;
  telephonePasteurPrincipal?: string;
  telephonePasteurSecondaire?: string;
  telephonePasteurTroisieme?: string;
  boitePostaleEglise?: string;
  dateCreationEglise?: string;
  capaciteAccueilEglise?: string;
  nombreCultesDimanche?: string;
  nombrePasteursEglise?: string;
  nombreAnciensEglise?: string;
  nombreDiacresEglise?: string;
  email?: string;
  emailEglise?: string;
};

type PrintDocumentLayoutProps = {
  identity?: PrintIdentity;
  title: string;
  subtitle?: string;
  countLabel?: string;
  countValue?: number;
  variant?: 'default' | 'plain';
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

const joinAvailableValues = (...values: Array<string | undefined>): string =>
  values
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' - ');

const getPrintableLogoUrl = (identity?: PrintIdentity): string | null => {
  // On ignore les logos absents pour garder un rendu propre sans image cassée.
  const logoPath = identity?.logoEglise || identity?.logoUtilisateur;

  if (!logoPath) {
    return null;
  }

  // Les logos deja absolus ou embarques peuvent etre utilises directement.
  if (/^(https?:|data:|blob:|file:)/i.test(logoPath)) {
    return logoPath;
  }

  // Les logos du bundle front doivent etre resolus contre la base Vite/Electron.
  if (identity?.logoEglise && logoPath === identity.logoEglise) {
    return buildChurchLogoUrl(logoPath);
  }

  return resolveStaticAssetUrl(logoPath);
};

export function PrintDocumentLayout({
  identity,
  title,
  subtitle,
  countLabel = 'Total',
  countValue = 0,
  variant = 'default',
  children,
}: PrintDocumentLayoutProps) {
  const userConnected = useSelector((state: IReduxState) => state.application.userConnected);
  const utilisateurData = useSelector((state: IReduxState) => state.authentification.utilisateurData);

  const mergedIdentity: PrintIdentity = {
    ...(utilisateurData || {}),
    ...(userConnected || {}),
    ...(identity || {}),
  };

  // On prepare l'eventuel logo pour le bandeau haut du document.
  const logoUrl = getPrintableLogoUrl(mergedIdentity);
  // On capture la date de generation une seule fois pour tout le document.
  const generatedAt = new Date().toLocaleString('fr-FR');
  const isPlainVariant = variant === 'plain';
  const primaryContactLine = joinAvailableValues(
    mergedIdentity.lieuEglise,
    mergedIdentity.telephoneSecretariatEglise || mergedIdentity.telephoneUtilisateur,
    mergedIdentity.emailEglise || mergedIdentity.email,
    mergedIdentity.boitePostaleEglise
  );
  const pastorsLine = joinAvailableValues(
    mergedIdentity.pasteurPrincipal
      ? `Pasteur principal: ${mergedIdentity.pasteurPrincipal}${mergedIdentity.telephonePasteurPrincipal ? ` (${mergedIdentity.telephonePasteurPrincipal})` : ''}`
      : undefined,
    mergedIdentity.pasteurSecondaire
      ? `Pasteur secondaire: ${mergedIdentity.pasteurSecondaire}${mergedIdentity.telephonePasteurSecondaire ? ` (${mergedIdentity.telephonePasteurSecondaire})` : ''}`
      : undefined,
    mergedIdentity.pasteurTroisieme
      ? `3eme pasteur: ${mergedIdentity.pasteurTroisieme}${mergedIdentity.telephonePasteurTroisieme ? ` (${mergedIdentity.telephonePasteurTroisieme})` : ''}`
      : undefined
  );
  const churchStatsLine = joinAvailableValues(
    mergedIdentity.dateCreationEglise ? `Creation: ${mergedIdentity.dateCreationEglise}` : undefined,
    mergedIdentity.capaciteAccueilEglise ? `Capacite: ${mergedIdentity.capaciteAccueilEglise}` : undefined,
    mergedIdentity.nombreCultesDimanche ? `Cultes dimanche: ${mergedIdentity.nombreCultesDimanche}` : undefined,
    mergedIdentity.nombrePasteursEglise ? `Pasteurs: ${mergedIdentity.nombrePasteursEglise}` : undefined,
    mergedIdentity.nombreAnciensEglise ? `Anciens: ${mergedIdentity.nombreAnciensEglise}` : undefined,
    mergedIdentity.nombreDiacresEglise ? `Diacres: ${mergedIdentity.nombreDiacresEglise}` : undefined
  );

  return (
    <>
      {/* Regles globales d'impression: mode paysage et prevention des coupures de blocs. */}
      <GlobalStyles
        styles={{
          '@page': {
            size: 'A4 landscape',
            margin: '10mm',
          },
          '@media print': {
            'html, body': {
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            },
            '.print-block-avoid-break': {
              breakInside: 'avoid',
              pageBreakInside: 'avoid',
            },
          },
        }}
      />

      <Box
        data-count-label={countLabel}
        data-count-value={countValue}
        data-subtitle={subtitle || ''}
        sx={{
          width: '100%',
          maxWidth: 'none',
          mx: 'auto',
          p: isPlainVariant ? 0 : { xs: 2, md: 3 },
          background: isPlainVariant
            ? '#ffffff'
            : 'linear-gradient(180deg, #eaf2fb 0%, #f7fbff 38%, #edf5fc 100%)',
          minHeight: isPlainVariant ? 'auto' : '100vh',
          '@media print': {
            p: 0,
            minHeight: 'auto',
            background: '#ffffff',
          },
        }}
      >
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 6,
          mb: 3,
          boxShadow: '0 18px 34px rgba(15, 23, 42, 0.10)',
          background:
            'linear-gradient(135deg, rgba(5, 36, 79, 0.98) 0%, rgba(19, 110, 194, 0.94) 58%, rgba(44, 169, 225, 0.90) 100%)',
          color: 'common.white',
          
        }}
      >
        <Box
          sx={{
            display: 'none',
          }}
        />
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
                {mergedIdentity.nomTemple || 'Communaute locale'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.75, opacity: 0.92, maxWidth: 760 }}>
                {primaryContactLine || "Document imprime depuis l'application de gestion communautaire."}
              </Typography>
              {pastorsLine && (
                <Typography
                  variant="caption"
                  sx={{ mt: 0.75, opacity: 0.88, maxWidth: 760, display: 'block' }}
                >
                  {pastorsLine}
                </Typography>
              )}
              {churchStatsLine && (
                <Typography
                  variant="caption"
                  sx={{ mt: 0.5, opacity: 0.84, maxWidth: 760, display: 'block' }}
                >
                  {churchStatsLine}
                </Typography>
              )}
            </Box>
          </Stack>

          <Stack spacing={1} alignItems="flex-end">
            <Typography variant="caption" sx={{ opacity: 0.84 }}>
              {generatedAt}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: isPlainVariant ? 'transparent' : 'common.white',
          borderRadius: isPlainVariant ? 0 : 6,
          p: isPlainVariant ? 0 : { xs: 3, md: 4 },
          boxShadow: isPlainVariant ? 'none' : '0 18px 40px rgba(15, 23, 42, 0.08)',
          border: isPlainVariant ? 'none' : '1px solid rgba(15, 23, 42, 0.08)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          sx={{ mb: 1.5 }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                color: '#0f274a',
                textTransform: 'uppercase',
                letterSpacing: 0.8,
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ mt: 0.75, color: '#5b6b7f' }}>
                {subtitle}
              </Typography>
            )}
          </Box>

          <Box sx={{ color: '#304760' }}>
            <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
              {countLabel}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {countValue}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {children}
      </Box>
      </Box>
    </>
  );
}

export function PrintTable({ children, minWidth = 760 }: PrintTableProps) {
  return (
    <TableContainer
      className="print-block-avoid-break"
      sx={{
        borderRadius: 3,
        border: '1px solid rgba(15, 23, 42, 0.1)',
        overflow: 'hidden',
        '@media print': {
          borderRadius: 2,
        },
      }}
    >
      <Table
        sx={{
          minWidth,
          tableLayout: 'fixed',
          '& .MuiTableCell-root': {
            py: 1.5,
            px: 1.5,
            borderColor: 'rgba(15, 23, 42, 0.08)',
            verticalAlign: 'top',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
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
          '& .MuiTableRow-root': {
            breakInside: 'avoid',
            pageBreakInside: 'avoid',
          },
          '@media print': {
            minWidth: '100%',
            '& .MuiTableCell-root': {
              py: 0.8,
              px: 0.9,
              fontSize: '0.72rem',
              lineHeight: 1.2,
            },
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
