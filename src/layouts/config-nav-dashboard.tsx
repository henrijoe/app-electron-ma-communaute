import {
  AccountBalanceWalletRounded,
  ApartmentRounded,
  ChurchRounded,
  DashboardRounded,
  Diversity3Rounded,
  GroupsRounded,
  HomeRounded,
  PhotoLibraryRounded,
  EventAvailableRounded,
  PersonRounded,
  VolunteerActivismRounded,
  WarningAmberRounded,
  SettingsRounded,
} from '@mui/icons-material';

export const navData = [
  {
    title: 'Dashboard',
    path: '/',
    icon: <DashboardRounded />,
  },
  {
    title: 'Membre',
    path: '/user',
    icon: <GroupsRounded />,
  },
  {
    title: 'Culte',
    path: '/culte',
    icon: <ChurchRounded />,
  },
  {
    title: 'Departement',
    path: '/departement',
    icon: <ApartmentRounded />,
  },
  {
    title: 'Cellule',
    path: '/cellule',
    // Une cellule correspond ici a une maison de priere.
    icon: <HomeRounded />,
  },
  {
    title: 'Groupe',
    path: '/groupe',
    icon: <Diversity3Rounded />,
  },
  {
    title: 'Cas sociaux',
    path: '/cas-sociaux',
    icon: <VolunteerActivismRounded />,
  },
  {
    title: 'Galerie',
    path: '/galerie',
    icon: <PhotoLibraryRounded />,
  },
  {
    title: 'Agenda',
    path: '/agenda',
    icon: <EventAvailableRounded />,
  },
  {
    title: 'Comptabilite',
    path: '/comptabilite',
    icon: <AccountBalanceWalletRounded />,
  },
  {
    title: 'Parametres',
    path: '/settings',
    icon: <SettingsRounded />,
  },
  {
    title: 'Not found',
    path: '/404',
    icon: <WarningAmberRounded />,
  },
];
