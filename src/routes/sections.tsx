import { lazy, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { varAlpha } from 'src/theme/styles';
import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

export const HomePage = lazy(() => import('src/pages/home'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const SignUpPage = lazy(() => import('src/pages/sign-up'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const SettingsPage = lazy(() => import('src/pages/settings'));
export const DesktopLockedPage = lazy(() => import('src/pages/desktop-locked'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));
export const SocialPage = lazy(() => import('src/pages/cas-sociaux'));
export const GaleriePage = lazy(() => import('src/pages/galerie'));
export const AgendaPage = lazy(() => import('src/pages/agenda'));
export const ComptabilitePage = lazy(() => import('src/pages/comptabilite'));

export const CultePage = lazy(() => import('src/pages/culte'));
export const CulteDetail = lazy(() => import('src/sections/culte/view/culte-detail/culte-detail'));
export const CulteEdit = lazy(() => import('src/sections/culte/view/culte-edit/culte-edit'));

export const UserPage = lazy(() => import('src/pages/user'));
export const UserImportPage = lazy(() => import('src/pages/user-import'));
export const UserDetail = lazy(() => import('src/sections/user/view/user-detail/user-detail'));
export const UserEdit = lazy(() => import('src/sections/user/view/user-edit/user-edit'));

export const DepartementPage = lazy(() => import('src/pages/departement'));
export const DepartementDetail = lazy(() => import('src/sections/departement/view/departement-detail/departement-detail'));
export const DepartementEdit = lazy(() => import('src/sections/departement/view/departement-edit/departement-edit'));

export const CellulePage = lazy(() => import('src/pages/cellule'));
export const CelluleDetail = lazy(() => import('src/sections/cellule/view/cellule-detail/cellule-detail'));
export const CelluleEdit = lazy(() => import('src/sections/cellule/view/cellule-edit/cellule-edit'));

export const GroupePage = lazy(() => import('src/pages/groupe'));
export const GroupeDetail = lazy(() => import('src/sections/groupe/view/groupe-detail/groupe-detail'));
export const GroupeEdit = lazy(() => import('src/sections/groupe/view/groupe-edit/groupe-edit'));

const renderFallback = (
  <Box display="flex" alignItems="center" justifyContent="center" flex="1 1 auto">
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export function Router() {
  const isLoggedIn = useSelector((state: any) => Boolean(state.application?.userLoggedIn) && Boolean(state.authentification?.connecter));
  const desktopSecurityChecked = useSelector((state: any) => Boolean(state.application?.desktopSecurityChecked));
  const desktopSecurityBlocked = useSelector((state: any) => Boolean(state.application?.desktopSecurityBlocked));
  const isDesktop = Boolean((window as any)?.desktopApp?.isDesktop);
  const mustWaitDesktopSecurity = isDesktop && isLoggedIn && !desktopSecurityChecked;
  const mustShowDesktopLocked = isDesktop && isLoggedIn && desktopSecurityChecked && desktopSecurityBlocked;

  return useRoutes([
    {
      element: mustWaitDesktopSecurity ? renderFallback : mustShowDesktopLocked ? <Navigate to="/desktop-locked" replace /> : isLoggedIn ? (
        <DashboardLayout>
          <Suspense fallback={renderFallback}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ) : <Navigate to="/sign-in" replace />,
      children: [
        { element: <HomePage />, index: true },
        { path: 'home', element: <HomePage /> },
        { path: 'user', element: <UserPage /> },
        { path: 'user/import', element: <UserImportPage /> },
        { path: 'culte', element: <CultePage /> },
        { path: 'departement', element: <DepartementPage /> },
        { path: 'cellule', element: <CellulePage /> },
        { path: 'groupe', element: <GroupePage /> },
        { path: 'cas-sociaux', element: <SocialPage /> },
        { path: 'galerie', element: <GaleriePage /> },
        { path: 'agenda', element: <AgendaPage /> },
        { path: 'comptabilite', element: <ComptabilitePage /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'settings', element: <SettingsPage /> },
        { path: 'blog', element: <BlogPage /> },
        {
          path: 'details',
          children: [
            { index: true, element: <UserPage /> },
            { path: ':id', element: <UserDetail /> },
            { path: 'edit/:id', element: <UserEdit /> },
          ],
        },
        {
          path: 'detailcultes',
          children: [
            { index: true, element: <CultePage /> },
            { path: ':id', element: <CulteDetail /> },
            { path: 'edit/:id', element: <CulteEdit /> },
          ],
        },
        {
          path: 'detaildepartement',
          children: [
            { index: true, element: <DepartementPage /> },
            { path: ':id', element: <DepartementDetail /> },
            { path: 'edit/:id', element: <DepartementEdit /> },
          ],
        },
        {
          path: 'detailcellule',
          children: [
            { index: true, element: <CellulePage /> },
            { path: ':id', element: <CelluleDetail /> },
            { path: 'edit/:id', element: <CelluleEdit /> },
          ],
        },
        {
          path: 'detailgroupe',
          children: [
            { index: true, element: <GroupePage /> },
            { path: ':id', element: <GroupeDetail /> },
            { path: 'edit/:id', element: <GroupeEdit /> },
          ],
        },
      ],
    },
    {
      path: 'sign-in',
      element: mustShowDesktopLocked ? <Navigate to="/desktop-locked" replace /> : isLoggedIn ? <Navigate to="/" replace /> : <AuthLayout><SignInPage /></AuthLayout>,
    },
    {
      path: 'sign-up',
      element: mustShowDesktopLocked ? <Navigate to="/desktop-locked" replace /> : isLoggedIn ? <Navigate to="/" replace /> : <AuthLayout><SignUpPage /></AuthLayout>,
    },
    {
      path: 'desktop-locked',
      element: isLoggedIn ? <AuthLayout><DesktopLockedPage /></AuthLayout> : <Navigate to="/sign-in" replace />,
    },
    { path: '404', element: <Page404 /> },
    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
