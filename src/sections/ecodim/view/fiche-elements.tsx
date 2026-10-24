import type { ReactNode } from 'react';

import { Box, Card, Stack, alpha, useTheme, Typography } from '@mui/material';

// ----------------------------------------------------------------------
// Briques communes aux pages de détail de l'Ecodim — enfant, classe, moniteur.
//
// Les trois pages se lisent de la même façon : une bannière colorée, puis des
// cartes de faits « libellé à gauche, valeur à droite ».

export const VALEUR_ABSENTE = 'Non renseigné';

export const valeurOuDefaut = (valeur?: string | null): string => {
  const texte = String(valeur ?? '').trim();
  return texte || VALEUR_ABSENTE;
};

export const formaterDate = (date?: string | null): string => {
  if (!date) return '';

  const valeur = new Date(date);
  if (Number.isNaN(valeur.getTime())) return String(date);

  return valeur.toLocaleDateString('fr-FR');
};

/**
 * Une information de la fiche.
 *
 * Libellé à gauche, valeur à droite sur la même ligne : empilés, ils doublaient
 * la hauteur des cartes alors que toute la moitié droite restait vide.
 */
export const Fait = ({
  icone,
  libelle,
  valeur,
}: {
  icone: ReactNode;
  libelle: string;
  valeur?: string | null;
}) => (
  <Stack direction="row" spacing={1.5} alignItems="center">
    <Box sx={{ color: 'primary.main', display: 'flex' }}>{icone}</Box>
    <Typography
      variant="subtitle1"
      color="text.secondary"
      sx={{ flexShrink: 0, minWidth: { sm: 150 } }}
    >
      {libelle}
    </Typography>
    <Typography
      variant="h6"
      sx={{ fontWeight: 600, wordBreak: 'break-word', textAlign: 'right', flexGrow: 1 }}
    >
      {valeurOuDefaut(valeur)}
    </Typography>
  </Stack>
);

/** Carte thématique d'une fiche. */
export const CarteFiche = ({ titre, children }: { titre: string; children: ReactNode }) => (
  <Card sx={{ p: 3, borderRadius: 3, height: 1 }}>
    <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
      {titre}
    </Typography>
    <Stack spacing={1.25}>{children}</Stack>
  </Card>
);

/** Bannière de tête, reprise de la fiche de l'enfant. */
export const BanniereFiche = ({
  surtitre,
  titre,
  children,
}: {
  surtitre: string;
  titre: string;
  children?: ReactNode;
}) => {
  const theme = useTheme();

  return (
    <>
      <Box
        sx={{
          height: { xs: 120, md: 160 },
          background: `
            radial-gradient(circle at top left, ${alpha(theme.palette.common.white, 0.22)} 0, transparent 30%),
            radial-gradient(circle at bottom right, ${alpha(theme.palette.info.light, 0.4)} 0, transparent 28%),
            linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 52%, ${theme.palette.info.main} 100%)
          `,
        }}
      />

      <Stack spacing={1} alignItems="center" sx={{ px: 3, pt: 3, pb: 1 }}>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.4 }}>
          {surtitre}
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 800, textAlign: 'center' }}>
          {titre}
        </Typography>
        {children}
      </Stack>
    </>
  );
};
