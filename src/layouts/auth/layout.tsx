import type { Theme, SxProps, Breakpoint } from '@mui/material/styles';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { resolveStaticAssetUrl } from 'src/utils/asset-url';

import { Main } from './main';
import { HeaderSection } from '../core/header-section';
import { LayoutSection } from '../core/layout-section';

export type AuthLayoutProps = {
  sx?: SxProps<Theme>;
  children: React.ReactNode;
  header?: {
    sx?: SxProps<Theme>;
  };
};

export function AuthLayout({ sx, children, header }: AuthLayoutProps) {
  const layoutQuery: Breakpoint = 'md';
  const location = useLocation();
  const logoUrl = resolveStaticAssetUrl('/assets/images/logoCom1.png');
  const isRegisterPage = location.pathname === '/sign-up';

  const heroContent = useMemo(
    () =>
      isRegisterPage
        ? {
          eyebrow: "Création d'église",
          title: 'Creez votre espace eglise en quelques minutes.',
          description:
            'Inscription simple, prise en main immediate pour votre communaute.',
        }
        : {
          eyebrow: 'Connexion securisée',
          title: 'Retrouvez votre communaute et vos membres.',
          description:
            'Connectez-vous rapidement pour acceder aux membres, departements, cultes.',
        },
    [isRegisterPage]
  );

  return (
    <LayoutSection
      headerSection={
        <HeaderSection
          layoutQuery={layoutQuery}
          slotProps={{
            container: { maxWidth: false },
            toolbar: { sx: { bgcolor: 'transparent', backdropFilter: 'unset' } },
          }}
          sx={{
            position: { [layoutQuery]: 'fixed' },
            ...header?.sx,
          }}
          slots={{
            topArea: (
              <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
                 Ceci est une alerte d&apos;information
              </Alert>
            ),
            leftArea: null,
            rightArea: null,
          }}
        />
      }
      footerSection={null}
      cssVars={{ '--layout-auth-content-width': '1380px' }}
      sx={{
        minHeight: '100vh',
        overflow: 'hidden',
        bgcolor: '#f5f7fb',
        '&::after': {
          content: "''",
          position: 'fixed',
          inset: 0,
          zIndex: -1,
          background:
            'radial-gradient(circle at top left, rgba(67,97,238,0.08), transparent 26%), radial-gradient(circle at bottom right, rgba(16,185,129,0.08), transparent 20%)',
        },
        ...sx,
      }}
    >
      <Main layoutQuery={layoutQuery}>
        <Box
          sx={{
            width: 1,
            display: 'grid',
            overflow: 'hidden',
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: '1px solid rgba(148, 163, 184, 0.22)',
            boxShadow: '0 28px 80px rgba(15, 23, 42, 0.10)',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 0.95fr)' },
          }}
        >
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              minHeight: 720,
              position: 'relative',
              overflow: 'hidden',
              borderRight: '1px solid rgba(148, 163, 184, 0.20)',
              background: 'linear-gradient(180deg, rgba(248,250,255,0.96), rgba(240,245,255,0.98))',
            }}
          >
            <Stack
              spacing={4}
              sx={{
                position: 'relative',
                zIndex: 1,
                width: 1,
                px: 7,
                py: 8,
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}
            >
              <Stack spacing={2.5} sx={{ maxWidth: 520, alignItems: 'center' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    component="img"
                    src={logoUrl}
                    alt="Ma Communaute"
                    sx={{ width: 56, height: 56, objectFit: 'contain' }}
                  />
                  <Typography variant="h3" sx={{ fontSize: 28 }}>
                    Ma Communauté
                  </Typography>
                </Stack>
                <Typography variant="overline" sx={{ letterSpacing: 2.6, color: 'text.secondary', fontWeight: 700 }}>
                  {heroContent.eyebrow}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 460 }}>
                  {heroContent.description}
                </Typography>
              </Stack>

              <Box sx={{ position: 'relative', width: 400, height: 420, }} alignItems="center">
                <Box
                  sx={{
                    position: 'absolute',
                    left: 44,
                    top: 16,
                    width: 238,
                    height: 430,
                    borderRadius: 10,
                    bgcolor: 'rgba(255,255,255,0.96)',
                    border: '6px solid rgb(79, 152, 247)',
                    boxShadow: '0 20px 40px rgba(15, 23, 42, 0.08)',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    left: 86,
                    top: 106,
                    width: 130,
                    height: 99,
                    borderRadius: 1.5,
                    border: '1px solid rgba(203,213,225,1)',
                    backgroundColor: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Stack direction="row" spacing={1}>
                    <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#d4d4d8' }} />
                    <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#a1a1aa' }} />
                    <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#4361ee' }} />
                  </Stack>
                </Box>
                <Box sx={{ position: 'absolute', left: 78, top: 240, width: 120, height: 2, bgcolor: '#cbd5e1', boxShadow: '0 34px 0 #cbd5e1' }} />
                <Box sx={{ position: 'absolute', left: 82, top: 228, width: 8, height: 8, borderRadius: '50%', bgcolor: '#4361ee', boxShadow: '14px 0 0 #4361ee, 28px 0 0 #4361ee, 0 36px 0 #4361ee, 14px 36px 0 #4361ee, 28px 36px 0 #4361ee' }} />
                <Box sx={{ position: 'absolute', left: 146, bottom: 100, width: 40, height: 18, borderRadius: 0.75, bgcolor: '#4361ee' }} />
              </Box>

              <Typography variant="h2" sx={{ fontSize: 25, lineHeight: 1.05, maxWidth: 560 }}>
                {heroContent.title}
              </Typography>
            </Stack>
          </Box>

          <Box
            sx={{
              px: { xs: 3, sm: 5, md: 6 },
              py: { xs: 4, sm: 5, md: 7 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ width: 1, maxWidth: 520 }}>{children}</Box>
          </Box>
        </Box>
      </Main>
    </LayoutSection>
  );
}
