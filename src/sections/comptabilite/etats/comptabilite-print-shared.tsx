import type { ComptabiliteType, IComptabiliteItem } from 'src/store/comptabiliteSlice';

import React from 'react';

import { Box, Chip, Stack, Typography } from '@mui/material';

export const comptabiliteCurrencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'XOF',
  maximumFractionDigits: 0,
});

export const getComptabiliteTypeLabel = (type: ComptabiliteType): string =>
  type === 'entree' ? 'Entree' : 'Sortie';

export const formatComptabiliteDate = (value?: string | null): string => {
  const normalized = String(value || '').trim();
  if (!normalized) {
    return '--';
  }

  const slashMatch = normalized.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (slashMatch) {
    return normalized;
  }

  const isoMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${day}/${month}/${year}`;
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return normalized;
  }

  return parsed.toLocaleDateString('fr-FR');
};

export const buildComptabiliteMetaLabel = (search: string, filterLabel: string): string => {
  const normalizedSearch = search.trim();
  if (normalizedSearch) {
    return `Recherche: ${normalizedSearch} | Filtre: ${filterLabel}`;
  }

  return `Filtre: ${filterLabel}`;
};

export const computeComptabiliteTotals = (items: IComptabiliteItem[]) => {
  const entree = items.reduce((sum, item) => sum + Number(item.entreeComptabilite || 0), 0);
  const sortie = items.reduce((sum, item) => sum + Number(item.sortieComptabilite || 0), 0);

  return {
    entree,
    sortie,
    solde: entree - sortie,
  };
};

export function ComptabilitePrintHero({
  title,
  description,
  chips,
  variant = 'default',
}: {
  title: string;
  description: string;
  chips: string[];
  variant?: 'default' | 'plain';
}) {
  const isPlainVariant = variant === 'plain';

  return (
    <Box
      className="print-block-avoid-break"
      sx={{
        mb: 3,
        p: isPlainVariant ? 0 : 2.5,
        borderRadius: isPlainVariant ? 0 : 4,
        background: isPlainVariant
          ? 'transparent'
          : 'linear-gradient(135deg, rgba(12, 74, 110, 0.08) 0%, rgba(37, 99, 235, 0.04) 100%)',
        border: isPlainVariant ? 'none' : '1px solid rgba(59, 130, 246, 0.16)',
      }}
    >
      <Typography variant="h6" sx={{ color: '#0f274a', fontWeight: 800, mb: 0.75 }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: '#38506a', mb: 1.5, maxWidth: 860 }}>
        {description}
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {chips.map((chip) => (
          <Chip key={chip} size="small" label={chip} />
        ))}
      </Stack>
    </Box>
  );
}

export function ComptabiliteSummaryCards({
  totals,
  highlightedLabel,
  variant = 'default',
}: {
  totals: { entree: number; sortie: number; solde: number };
  highlightedLabel?: string;
  variant?: 'default' | 'plain';
}) {
  const isPlainVariant = variant === 'plain';
  const cards = [
    {
      label: 'Entrees',
      value: comptabiliteCurrencyFormatter.format(totals.entree),
      color: '#16a34a',
      bg: 'rgba(22, 163, 74, 0.10)',
    },
    {
      label: 'Sorties',
      value: comptabiliteCurrencyFormatter.format(totals.sortie),
      color: '#dc2626',
      bg: 'rgba(220, 38, 38, 0.10)',
    },
    {
      label: highlightedLabel || 'Solde disponible',
      value: comptabiliteCurrencyFormatter.format(totals.solde),
      color: '#1d4ed8',
      bg: 'rgba(29, 78, 216, 0.10)',
    },
  ];

  return (
    <Box
      className="print-block-avoid-break"
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: 2,
        mb: 3,
        '@media print': {
          gap: 1.25,
        },
      }}
    >
      {cards.map((card) => (
        <Box
          key={card.label}
          sx={{
            p: isPlainVariant ? 0 : 2,
            borderRadius: isPlainVariant ? 0 : 3,
            border: isPlainVariant ? 'none' : '1px solid rgba(15, 23, 42, 0.10)',
            backgroundColor: isPlainVariant ? 'transparent' : '#fff',
          }}
        >
          <Typography variant="caption" sx={{ color: '#5c6f82', textTransform: 'uppercase', letterSpacing: 0.6 }}>
            {card.label}
          </Typography>
          <Box
            sx={{
              mt: 1.2,
              display: 'inline-flex',
              px: 1.5,
              py: 0.8,
              borderRadius: 999,
              bgcolor: card.bg,
              color: card.color,
              fontWeight: 800,
              fontSize: '1rem',
            }}
          >
            {card.value}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export const filterComptabiliteByType = (items: IComptabiliteItem[], type: ComptabiliteType) =>
  items.filter((item) => item.typeComptabilite === type);