import { forwardRef } from 'react';

import Box from '@mui/material/Box';

import { resolveStaticAssetUrl } from 'src/utils/asset-url';

import { svgColorClasses } from './classes';

import type { SvgColorProps } from './types';

// ----------------------------------------------------------------------

export const SvgColor = forwardRef<HTMLSpanElement, SvgColorProps>(
  ({ src, width = 24, height, className, sx, ...other }, ref) => {
    const resolvedSrc = resolveStaticAssetUrl(src);

    return (
      <Box
        ref={ref}
        component="span"
        className={svgColorClasses.root.concat(className ? ` ${className}` : '')}
        sx={{
          width,
          flexShrink: 0,
          height: height ?? width,
          display: 'inline-flex',
          bgcolor: 'currentColor',
          mask: `url(${resolvedSrc}) no-repeat center / contain`,
          WebkitMask: `url(${resolvedSrc}) no-repeat center / contain`,
          ...sx,
        }}
        {...other}
      />
    );
  }
);
