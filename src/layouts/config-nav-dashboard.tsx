import type { ModulePermissionKey } from 'src/store/userSlice';

import {
  HomeRounded,
  BadgeRounded,
  ChurchRounded,
  GroupsRounded,
  SettingsRounded,
  ApartmentRounded,
  DashboardRounded,
  Diversity1Rounded,
  Diversity3Rounded,
  PhotoLibraryRounded,
  WarningAmberRounded,
  EventAvailableRounded,
  VolunteerActivismRounded,
  HealthAndSafetyRounded,
  AccountBalanceWalletRounded,
} from '@mui/icons-material';

export type DashboardNavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  permissionKey?: ModulePermissionKey;
  info?: React.ReactNode;
};

export const navData: DashboardNavItem[] = [
  {
    title: 'Dashboard',
    path: '/',
    icon: <DashboardRounded />,
    permissionKey: 'dashboard',
  },
  {
    title: 'Membre',
    path: '/user',
    icon: <GroupsRounded />,
    permissionKey: 'user',
  },
  {
    title: 'Culte',
    path: '/culte',
    icon: <ChurchRounded />,
    permissionKey: 'culte',
  },
  {
    title: 'Département',
    path: '/departement',
    icon: <ApartmentRounded />,
    permissionKey: 'departement',
  },
  {
    title: 'Cellule',
    path: '/cellule',
    icon: <HomeRounded />,
    permissionKey: 'cellule',
  },
  {
    title: 'Groupe',
    path: '/groupe',
    icon: <Diversity3Rounded />,
    permissionKey: 'groupe',
  },
  {
    title: 'Famille de jeunesse',
    path: '/famille-jeunesse',
    icon: <Diversity1Rounded />,
    permissionKey: 'familleJeunesse',
  },
  {
    title: 'Cas sociaux',
    path: '/cas-sociaux',
    icon: <VolunteerActivismRounded />,
    permissionKey: 'social',
  },
  {
    title: 'Pastoral',
    path: '/pastoral',
    icon: <HealthAndSafetyRounded />,
    permissionKey: 'social',
  },
  {
    title: 'Galerie',
    path: '/galerie',
    icon: <PhotoLibraryRounded />,
    permissionKey: 'galerie',
  },
  {
    title: 'Agenda',
    path: '/agenda',
    icon: <EventAvailableRounded />,
    permissionKey: 'agenda',
  },
  {
    title: 'Comptabilité',
    path: '/comptabilite',
    icon: <AccountBalanceWalletRounded />,
    permissionKey: 'comptabilite',
  },
  {
    title: 'Responsabilités',
    path: '/responsabilites',
    icon: <BadgeRounded />,
    permissionKey: 'settings',
  },
  {
    title: 'Paramètres',
    path: '/settings',
    icon: <SettingsRounded />,
    permissionKey: 'settings',
  },
  // {
  //   title: 'Not found',
  //   path: '/404',
  //   icon: <WarningAmberRounded />,
  // },
];
