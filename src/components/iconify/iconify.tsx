import { forwardRef } from 'react';
import type { ElementType } from 'react';
import { Icon, disableCache } from '@iconify/react';
import {
  Add as AddIcon,
  ArrowForwardIos as ArrowForwardIosIcon,
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  FilterList as FilterListIcon,
  Home as HomeIcon,
  MoreVert as MoreVertIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Share as ShareIcon,
  ShoppingCart as ShoppingCartIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  X as XIcon,
  Refresh as RefreshIcon,
  AccessTime as AccessTimeIcon,
  MarkEmailRead as MarkEmailReadIcon,
  Facebook as FacebookIcon,
  GitHub as GitHubIcon,
  LinkedIn as LinkedInIcon,
  Google as GoogleIcon,
  CameraAlt as CameraAltIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

import Box from '@mui/material/Box';

import { iconifyClasses } from './classes';

import type { IconifyProps } from './types';

// ----------------------------------------------------------------------

const localIconMap: Record<string, ElementType> = {
  'mingcute:add-line': AddIcon,
  'mingcute:close-line': CloseIcon,
  'mdi:account': PersonIcon,
  'mdi:camera': CameraAltIcon,
  'mdi:close': CloseIcon,
  'eva:more-vertical-fill': MoreVertIcon,
  'eva:arrow-ios-forward-fill': ArrowForwardIosIcon,
  'eva:checkmark-fill': CheckIcon,
  'eva:search-fill': SearchIcon,
  'eva:facebook-fill': FacebookIcon,
  'eva:github-fill': GitHubIcon,
  'eva:linkedin-fill': LinkedInIcon,
  'ri:twitter-x-fill': XIcon,
  'logos:google-icon': GoogleIcon,
  'ic:round-filter-list': FilterListIcon,
  'solar:eye-bold': VisibilityIcon,
  'solar:pen-bold': EditIcon,
  'solar:trash-bin-trash-bold': DeleteIcon,
  'solar:bell-bing-bold-duotone': NotificationsIcon,
  'solar:cart-3-bold': ShoppingCartIcon,
  'solar:check-circle-bold': CheckCircleIcon,
  'solar:check-read-outline': MarkEmailReadIcon,
  'solar:clock-circle-outline': AccessTimeIcon,
  'solar:home-angle-bold-duotone': HomeIcon,
  'solar:refresh-linear': RefreshIcon,
  'solar:settings-bold-duotone': SettingsIcon,
  'solar:share-bold': ShareIcon,
};

export const Iconify = forwardRef<SVGElement, IconifyProps>(
  ({ className, width = 20, sx, icon, ...other }, ref) => {
    const iconName = typeof icon === 'string' ? icon : undefined;
    const LocalIcon = iconName ? localIconMap[iconName] : undefined;

    if (LocalIcon) {
      return (
        <Box
          ref={ref}
          component={LocalIcon}
          className={iconifyClasses.root.concat(className ? ` ${className}` : '')}
          sx={{
            width,
            height: width,
            flexShrink: 0,
            display: 'inline-flex',
            ...sx,
          }}
          {...other}
        />
      );
    }

    return (
      <Box
        ssr
        ref={ref}
        component={Icon}
        className={iconifyClasses.root.concat(className ? ` ${className}` : '')}
        sx={{
          width,
          height: width,
          flexShrink: 0,
          display: 'inline-flex',
          ...sx,
        }}
        icon={icon}
        {...other}
      />
    );
  }
);

// https://iconify.design/docs/iconify-icon/disable-cache.html
disableCache('local');
