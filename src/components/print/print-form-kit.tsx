import React from 'react';
import { Box, Checkbox, FormControlLabel, Stack, Typography } from '@mui/material';

type PrintFormSectionProps = {
  title: string;
  children: React.ReactNode;
};

type PrintFieldLineProps = {
  label: string;
  value?: React.ReactNode;
  flex?: number;
};

type PrintCheckboxItemProps = {
  label: string;
  checked?: boolean;
};

export function PrintFormSection({ title, children }: PrintFormSectionProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(15, 23, 42, 0.08)',
        borderRadius: 4,
        p: 2.5,
        background:
          'linear-gradient(180deg, rgba(252,253,255,1) 0%, rgba(247,250,255,1) 100%)',
        boxShadow: '0 10px 24px rgba(15, 23, 42, 0.04)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: 6,
          height: '100%',
          background: 'linear-gradient(180deg, #0f274a 0%, #1673c7 100%)',
        },
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 800,
          color: '#0f274a',
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          mb: 1.75,
        }}
      >
        {title}
      </Typography>
      <Stack spacing={1.25}>{children}</Stack>
    </Box>
  );
}

export function PrintFieldLine({ label, value, flex = 1 }: PrintFieldLineProps) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="baseline">
      <Typography
        variant="body2"
        sx={{
          minWidth: 150,
          fontWeight: 700,
          color: '#27415f',
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          flex,
          minHeight: 30,
          borderBottom: '1.5px dashed rgba(22, 115, 199, 0.42)',
          display: 'flex',
          alignItems: 'center',
          pb: 0.25,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
          {value || ' '}
        </Typography>
      </Box>
    </Stack>
  );
}

export function PrintCheckboxItem({ label, checked = false }: PrintCheckboxItemProps) {
  return (
    <FormControlLabel
      control={
        <Checkbox
          size="small"
          checked={checked}
          readOnly
          sx={{
            color: '#1c5380',
            p: 0.5,
            '& .MuiSvgIcon-root': { fontSize: '1.15rem' },
          }}
        />
      }
      label={label}
      sx={{
        mr: 2,
        '& .MuiTypography-root': {
          fontSize: '0.9rem',
          fontWeight: 500,
          color: '#20354d',
        },
      }}
    />
  );
}
