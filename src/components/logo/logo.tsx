import type { BoxProps } from '@mui/material/Box';

import { forwardRef, useEffect, useId, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';
import type { IReduxState } from 'src/store/store';
import { getSessionUser } from 'src/utils/access-control';
import { resolveStaticAssetUrl } from 'src/utils/asset-url';
import { buildChurchLogoUrl } from 'src/utils/apiClient';

import { logoClasses } from './classes';

export type LogoProps = BoxProps & {
  href?: string;
  isSingle?: boolean;
  disableLink?: boolean;
};

const getLogoImageUrl = (logoEglise?: string, cacheKey?: string | number): string => {
  if (!logoEglise) {
    return resolveStaticAssetUrl('/assets/images/logoCom1.png');
  }

  if (/^(data:|https?:|blob:|file:)/i.test(logoEglise)) {
    return logoEglise;
  }

  return buildChurchLogoUrl(logoEglise, cacheKey);
};

export const Logo = forwardRef<HTMLDivElement, LogoProps>(
  (
    { width, href = '/', height, isSingle = true, disableLink = false, className, sx, ...other },
    ref
  ) => {
    const theme = useTheme();
    const sessionUser = useSelector((state: IReduxState) => getSessionUser(state));
    const [hasImageError, setHasImageError] = useState(false);
    const gradientId = useId();
    const logoImageUrl = useMemo(
      () => getLogoImageUrl(sessionUser?.logoEglise, sessionUser?.__syncAt),
      [sessionUser?.__syncAt, sessionUser?.logoEglise]
    );

    useEffect(() => {
      setHasImageError(false);
    }, [logoImageUrl]);

    const PRIMARY_LIGHT = theme.vars.palette.primary.light;
    const PRIMARY_MAIN = theme.vars.palette.primary.main;
    const PRIMARY_DARKER = theme.vars.palette.primary.dark;

    // On utilise l'image publique si elle est disponible, sinon on retombe sur un SVG interne.
    const fullLogo = (
      <Box
        alt="Logo"
        component="img"
        src={logoImageUrl}
        width="100%"
        height="100%"
        onError={() => setHasImageError(true)}
        sx={{ objectFit: 'contain' }}
      />
    );

    const fallbackLogo = (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill={`url(#${`${gradientId}-1`})`}
          d="M86.352 246.358C137.511 214.183 161.836 245.017 183.168 285.573C165.515 317.716 153.837 337.331 148.132 344.418C137.373 357.788 125.636 367.911 111.202 373.752C80.856 388.014 43.132 388.681 14 371.048L86.352 246.358Z"
        />
        <path
          fill={`url(#${`${gradientId}-2`})`}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M444.31 229.726C398.04 148.77 350.21 72.498 295.267 184.382C287.751 198.766 282.272 226.719 270 226.719V226.577C257.728 226.577 252.251 198.624 244.735 184.24C189.79 72.356 141.96 148.628 95.689 229.584C92.207 235.69 88.862 241.516 86 246.58C192.038 179.453 183.11 382.247 270 383.858V384C356.891 382.389 347.962 179.595 454 246.72C451.139 241.658 447.794 235.832 444.31 229.726Z"
        />
        <path
          fill={`url(#${`${gradientId}-3`})`}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M450 384C476.509 384 498 362.509 498 336C498 309.491 476.509 288 450 288C423.491 288 402 309.491 402 336C402 362.509 423.491 384 450 384Z"
        />
        <defs>
          <linearGradient id={`${gradientId}-1`} x1="152" y1="167.79" x2="65.523" y2="259.624" gradientUnits="userSpaceOnUse">
            <stop stopColor={PRIMARY_DARKER} />
            <stop offset="1" stopColor={PRIMARY_MAIN} />
          </linearGradient>
          <linearGradient id={`${gradientId}-2`} x1="86" y1="128" x2="86" y2="384" gradientUnits="userSpaceOnUse">
            <stop stopColor={PRIMARY_LIGHT} />
            <stop offset="1" stopColor={PRIMARY_MAIN} />
          </linearGradient>
          <linearGradient id={`${gradientId}-3`} x1="402" y1="288" x2="402" y2="384" gradientUnits="userSpaceOnUse">
            <stop stopColor={PRIMARY_LIGHT} />
            <stop offset="1" stopColor={PRIMARY_MAIN} />
          </linearGradient>
        </defs>
      </svg>
    );

    const baseSize = {
      width: width ?? 40,
      height: height ?? 40,
      ...(!isSingle && {
        width: width ?? 102,
        height: height ?? 36,
      }),
    };

    return (
      <Box
        ref={ref}
        component={RouterLink}
        href={href}
        className={logoClasses.root.concat(className ? ` ${className}` : '')}
        aria-label="Logo"
        sx={{
          ...baseSize,
          flexShrink: 0,
          display: 'inline-flex',
          verticalAlign: 'middle',
          ...(disableLink && { pointerEvents: 'none' }),
          ...sx,
        }}
        {...other}
      >
        {hasImageError ? fallbackLogo : fullLogo}
      </Box>
    );
  }
);
