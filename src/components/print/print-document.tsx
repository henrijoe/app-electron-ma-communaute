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



// Aucune hauteur imposée à html et body : la feuille entière dépasse de la zone
// imprimable une fois les marges retirées, ce qui ajoutait une page vide à la fin.
export const PRINT_LANDSCAPE_PAGE_STYLE = `
@page {
  size: A4 landscape;
  margin: 12mm;
}

@media print {
  html, body {
    margin:0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
`;

export const PRINT_PORTRAIT_PAGE_STYLE = `
  @page {
    size: A4 portrait;
    margin: 12mm;
  }

  @media print {
    html,
    body {
      margin: 0;
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

export const getPrintableLogoUrl = (identity?: PrintIdentity): string | null => {
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
        border: '1px solid #000',
        borderBottom: '2px solid #000',
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
          // La bordure n'encadre que s'il y a quelque chose à encadrer. Sans
          // logo, elle laisserait un carré noir vide — plus voyant encore que
          // la pastille « MC » qu'on vient de retirer. L'emplacement reste
          // réservé pour que le titre ne se décale pas d'un état à l'autre.
          border: logoUrl ? '1px solid #000' : 'none',
        }}
      >
        {logoUrl ? (
          <Box
            component="img"
            src={logoUrl}
            alt="Logo église"
            sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : null}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: '1.08rem',
            fontWeight: 700,
            lineHeight: 1.15,
            color: '#000',
            overflowWrap: 'anywhere',
          }}
        >
          {identity.nomEgliseCourt || identity.nomTemple || 'Communauté locale'}
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
        borderTop: '1px solid #000',
        color: '#000',
        fontSize: '0.72rem',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <Typography variant="caption" sx={{ color: 'inherit' }}>
          {contactLine}
        </Typography>
        {/* Plus de « Page 1 » écrit en dur : le vrai numéro de page s'imprime
            dans la marge pour tous les états (« Page 1 / 3 », voir global.css). */}
        <Box />
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
  // Toute la largeur imprimable : une largeur fixe en millimètres, plus large ou
  // plus étroite que la zone réelle, faisait réduire la page ou laissait un vide
  // à droite.
  const printPageWidth = '100%';
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
            margin: '12mm',
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
            <Box
                className="print-block-avoid-break"
                sx={{
                  mb: isPlainVariant ? 1.2 : 2,
                  px: 2,
                  py: 1.05,
                  border: '1.5px solid #000',
                  borderRadius: 1.2,
                  backgroundColor: '#fff',
                  textAlign: 'center',
                }}
              >
                <Typography
                  sx={{
                    fontSize: orientation === 'landscape' ? '1.08rem' : '1rem',
                    fontWeight: 700,
                    color: '#000',
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                    lineHeight: 1.15,
                  }}
                >
                  {title}
                </Typography>
              </Box>
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
    // Pas de « print-block-avoid-break » ici : un long tableau sauterait d'un bloc à la
    // page suivante. Ce sont ses lignes qui ne se coupent pas.
    // Tableau quadrillé, texte noir, en Arial Narrow : les anciens traits gris très
    // clairs et le texte bleu-gris de 9 à 10 px sortaient pâles à l'impression.
    <TableContainer
      sx={{
        width: '100%',
        maxWidth: '100%',
        border: '1px solid #000',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
      }}
    >
      <Table
        sx={{
          minWidth,
          width: '100%',
          tableLayout: 'fixed',
          borderCollapse: 'collapse',
          fontFamily: 'var(--police-etat)',
          '& .MuiTableCell-root': {
            py: 0.6,
            px: 0.9,
            border: '1px solid #000',
            verticalAlign: 'middle',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            color: '#000',
            fontFamily: 'var(--police-etat)',
            fontSize: '0.9rem',
            lineHeight: 1.25,
          },
          '& .MuiTableHead-root': {
            backgroundColor: '#fff',
            '& .MuiTableCell-root': {
              color: '#000',
              fontWeight: 700,
              textTransform: 'uppercase',
              fontSize: '0.85rem',
              letterSpacing: 0,
              py: 0.7,
              // Un titre de colonne passe à la ligne entre deux mots, jamais au
              // milieu d'un mot (« PRÉDICATIO / N »).
              wordBreak: 'normal',
              overflowWrap: 'normal',
              hyphens: 'manual',
            },
          },
          '& .MuiTableBody-root .MuiTableRow-root': {
            backgroundColor: '#fff',
          },
          '& .MuiTableRow-root': {
            breakInside: 'avoid',
            pageBreakInside: 'avoid',
          },
          '@media print': {
            minWidth: '100%',
            '& .MuiTableCell-root': {
              py: 0.45,
              px: 0.7,
              fontSize: '10.5pt',
              lineHeight: 1.2,
            },
            '& .MuiTableHead-root .MuiTableCell-root': {
              fontSize: '10pt',
              lineHeight: 1.15,
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
