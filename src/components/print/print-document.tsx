import type { IReduxState } from 'src/store/store';

import React from 'react';
import { useSelector } from 'react-redux';

import {
  Box,
  Stack,
  Table,
  Divider,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  GlobalStyles,
  TableContainer,
} from '@mui/material';

import { buildChurchLogoUrl } from 'src/utils/apiClient';
import { resolveStaticAssetUrl } from 'src/utils/asset-url';

type PrintIdentity = {
  logoUtilisateur?: string;
  logoEglise?: string;
  nomTemple?: string;
  nomEgliseCourt?: string;
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
  variant?: 'default' | 'plain';
  showDocumentMeta?: boolean;
  showCountMeta?: boolean;
  showPagination?: boolean;
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

type PrintHeaderProps = {
  identity: PrintIdentity;
  logoUrl: string | null;
};

type PrintFooterProps = {
  contactLine: string;
  showPagination: boolean;
};

const joinAvailableValues = (...values: Array<string | undefined>): string =>
  values
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' - ');

const getPrintableLogoUrl = (identity?: PrintIdentity): string | null => {
  const logoPath = identity?.logoEglise || identity?.logoUtilisateur;

  if (!logoPath) {
    return null;
  }

  if (/^(https?:|data:|blob:|file:)/i.test(logoPath)) {
    return logoPath;
  }

  if (identity?.logoEglise && logoPath === identity.logoEglise) {
    return buildChurchLogoUrl(logoPath);
  }

  return resolveStaticAssetUrl(logoPath);
};

function PrintHeader({ identity, logoUrl }: PrintHeaderProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '88px minmax(0, 1fr)',
        alignItems: 'center',
        gap: 2,
        pb: 1.75,
        mb: 2.25,
        borderBottom: '2px solid #0f274a',
      }}
    >
      <Box
        sx={{
          width: 78,
          height: 78,
          borderRadius: 2,
          border: '1px solid rgba(15, 39, 74, 0.16)',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          p: 0.75,
        }}
      >
        {logoUrl ? (
          <Box
            component="img"
            src={logoUrl}
            alt="Logo eglise"
            sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
          />
        ) : (
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f274a' }}>
            MC
          </Typography>
        )}
      </Box>

      <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1.05, color: '#0f274a' }}>
        {identity.nomEgliseCourt || identity.nomTemple || 'Communaute locale'}
      </Typography>
    </Box>
  );
}

function PrintFooter({ contactLine, showPagination }: PrintFooterProps) {
  return (
    <Box
      className="print-page-footer"
      sx={{
        mt: 2,
        pt: 1,
        borderTop: '1px solid rgba(15, 39, 74, 0.12)',
        color: '#5b6b7f',
        fontSize: '0.72rem',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <Typography variant="caption" sx={{ color: 'inherit' }}>
          {contactLine || "Document interne de l'eglise"}
        </Typography>
        {showPagination ? (
          <Typography variant="caption" sx={{ color: 'inherit' }}>
            Page 1
          </Typography>
        ) : (
          <Box />
        )}
      </Stack>
    </Box>
  );
}

export function PrintDocumentLayout({
  identity,
  title,
  variant = 'default',
  showDocumentMeta = true,
  showCountMeta = true,
  showPagination = false,
  children,
}: PrintDocumentLayoutProps) {
  const userConnected = useSelector((state: IReduxState) => state.application.userConnected);
  const utilisateurData = useSelector((state: IReduxState) => state.authentification.utilisateurData);

  const mergedIdentity: PrintIdentity = {
    ...(utilisateurData || {}),
    ...(userConnected || {}),
    ...(identity || {}),
  };

  const logoUrl = getPrintableLogoUrl(mergedIdentity);
  const isPlainVariant = variant === 'plain';
  const footerContactLine = joinAvailableValues(
    mergedIdentity.lieuEglise,
    mergedIdentity.telephoneSecretariatEglise || mergedIdentity.telephoneUtilisateur,
    mergedIdentity.emailEglise || mergedIdentity.email,
    mergedIdentity.boitePostaleEglise
  );

  return (
    <>
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
            '.print-document-root': {
              paddingBottom: '18mm',
              minHeight: 'calc(100vh - 20mm)',
            },
            '.print-page-footer': {
              position: 'fixed',
              left: '10mm',
              right: '10mm',
              bottom: '6mm',
              marginTop: 0,
              backgroundColor: '#ffffff',
            },
          },
        }}
      />

      <Box
        className="print-document-root"
        sx={{
          color: '#111827',
          width: '100%',
          maxWidth: 'none',
          mx: 'auto',
          p: isPlainVariant ? 0 : { xs: 2, md: 3 },
          background: isPlainVariant
            ? '#ffffff'
            : 'linear-gradient(180deg, #eaf2fb 0%, #f7fbff 38%, #edf5fc 100%)',
          minHeight: isPlainVariant ? 'auto' : '100vh',
          display: 'flex',
          flexDirection: 'column',
          '@media print': {
            p: 0,
            minHeight: 'calc(100vh - 20mm)',
            background: '#ffffff',
          },
        }}
      >
        <PrintHeader identity={mergedIdentity} logoUrl={logoUrl} />

        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            flex: 1,
            backgroundColor: isPlainVariant ? 'transparent' : 'common.white',
            color: '#111827',
            borderRadius: isPlainVariant ? 0 : 6,
            p: isPlainVariant ? 0 : { xs: 3, md: 4 },
            boxShadow: isPlainVariant ? 'none' : '0 18px 40px rgba(15, 23, 42, 0.08)',
            border: isPlainVariant ? 'none' : '1px solid rgba(15, 23, 42, 0.08)',
          }}
        >
          {showDocumentMeta && (
            <>
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
    
                </Box>

 
              </Stack>

              <Divider sx={{ mb: 3 }} />
            </>
          )}

          {children}
        </Box>

        <PrintFooter contactLine={footerContactLine} showPagination={showPagination} />
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

export { TableRow, TableBody, TableCell, TableHead, PrintFooter, PrintHeader };
