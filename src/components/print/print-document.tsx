import type { IReduxState } from 'src/store/store';

import React from 'react';
import { useSelector } from 'react-redux';

import {
  Box,
  Stack,
  Table,
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
  orientation?: 'landscape' | 'portrait';
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



export const PRINT_LANDSCAPE_PAGE_STYLE = `
@page {
  size: A4 landscape;
  margin: 5mm;
}

@media print {
  html, body {
    width: 297mm;
    height: 210mm;
    margin:0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
`;

export const PRINT_PORTRAIT_PAGE_STYLE = `
  @page {
    size: A4 portrait;
    margin: 5mm;
  }

  @media print {
    html,
    body {
      width: 210mm;
      min-height: 297mm;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
`;

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
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.35,
        mb: 1.4,
        border: '1px solid rgba(15, 39, 74, 0.18)',
        borderBottom: '3px solid #0f274a',
        borderRadius: 1.4,
        backgroundColor: '#ffffff',
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 1.1,
          bgcolor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          p: 0.4,
          flexShrink: 0,
          border: '1px solid rgba(15, 39, 74, 0.14)',
        }}
      >
        {logoUrl ? (
          <Box
            component="img"
            src={logoUrl}
            alt="Logo eglise"
            sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <Typography sx={{ color: '#0f172a', fontWeight: 900 }}>MC</Typography>
        )}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: '1.08rem',
            fontWeight: 900,
            lineHeight: 1.15,
            color: '#0f274a',
            overflowWrap: 'anywhere',
          }}
        >
          {identity.nomEgliseCourt || identity.nomTemple || 'Communauté locale'}
        </Typography>
        <Typography
          sx={{
            mt: 0.25,
            color: '#63758c',
            fontSize: '0.72rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 0.8,
          }}
        >
          État imprimable
        </Typography>
      </Box>
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
          {contactLine || "Document interne de l'église"}
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
  orientation = 'landscape',
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
  const printPageWidth = orientation === 'landscape' ? '281mm' : '190mm';
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
            size: `A4 ${orientation}`,
            margin: '5mm',
          },
          '@media print': {
            'html, body': {
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
              backgroundColor: '#ffffff',
            },
            '.print-document-root': {
              width: `${printPageWidth} !important`,
              maxWidth: `${printPageWidth} !important`,
              minHeight: orientation === 'landscape' ? '194mm' : '281mm',
              paddingBottom: '10mm',
            },
            '.print-block-avoid-break': {
              breakInside: 'avoid',
              pageBreakInside: 'avoid',
            },
            '.print-page-footer': {
              position: 'fixed',
              left: '5mm',
              right: '5mm',
              bottom: '5mm',
              marginTop: 0,
              backgroundColor: '#ffffff',
            },
          },
        }}
      />

      <Box
        className="print-document-root"
        sx={{
          width: '100%',
          maxWidth: '100%',
          background: '#fff',
          color: '#111827',
          display: 'flex',
          flexDirection: 'column',
          p: 0,
          minHeight: orientation === 'landscape' ? 720 : 1040,

          '@media print': {
            width: '100%',
            maxWidth: '100%',
            background: '#fff',
            padding: 0,
            margin: 0,
            minHeight: 'auto',
          },
        }}
      >
        <PrintHeader identity={mergedIdentity} logoUrl={logoUrl} />

        <Box
          sx={{
            width: '100%',
            position: 'relative',
            overflow: 'visible',
            flex: 1,
            background: 'transparent',
            color: '#111827',
            border: 'none',
            borderRadius: 0,
            p: 0,
          }}
        >
          {showDocumentMeta && (
            <>
              <Box
                className="print-block-avoid-break"
                sx={{
                  mb: isPlainVariant ? 1.2 : 2,
                  px: 2,
                  py: 1.05,
                  border: '1.5px solid #0f274a',
                  borderRadius: 1.2,
                  backgroundColor: '#eef4ff',
                  textAlign: 'center',
                }}
              >
                <Typography
                  sx={{
                    fontSize: orientation === 'landscape' ? '1.08rem' : '1rem',
                    fontWeight: 900,
                    color: '#0f274a',
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                    lineHeight: 1.15,
                  }}
                >
                  {title}
                </Typography>
              </Box>
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
        borderRadius: 1.6,
        width: '100%',
        maxWidth: '100%',
        border: '1px solid rgba(15, 39, 74, 0.16)',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        '@media print': {
          borderRadius: 1.2,
        },
      }}
    >
      <Table
        sx={{
          minWidth,
          width: '100%',
          tableLayout: 'fixed',
          '& .MuiTableCell-root': {
            py: 1.1,
            px: 1.15,
            borderColor: 'rgba(15, 39, 74, 0.10)',
            verticalAlign: 'top',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            color: '#10233f',
          },
          '& .MuiTableHead-root': {
            backgroundColor: '#eaf2ff',
            '& .MuiTableCell-root': {
              color: '#0f274a',
              fontWeight: 800,
              textTransform: 'uppercase',
              fontSize: '0.7rem',
              letterSpacing: 0.5,
              py: 0.9,
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
              py: 0.65,
              px: 0.72,
              fontSize: '0.68rem',
              lineHeight: 1.2,
            },
            '& .MuiTableHead-root .MuiTableCell-root': {
              fontSize: '0.62rem',
              lineHeight: 1.1,
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
