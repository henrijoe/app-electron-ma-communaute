import { lazy, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { varAlpha } from 'src/theme/styles';
import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';


// ------------------------------
export const HomePage = lazy(() => import('src/pages/home'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const SignUpPage = lazy(() => import('src/pages/sign-up'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const SettingsPage = lazy(() => import('src/pages/settings'));
export const DesktopLockedPage = lazy(() => import('src/pages/desktop-locked'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

// -------------------------- Culte ------------------------------------
export const CultePage = lazy(() => import('src/pages/culte'));
export const CulteDetail= lazy(() => import('src/sections/culte/view/culte-detail/culte-detail'));
export const CulteEdit = lazy(() => import('src/sections/culte/view/culte-edit/culte-edit'))

// -------------------------  membre ------------------------------------
export const UserPage = lazy(() => import('src/pages/user'));
export const UserDetail = lazy(() => import('src/sections/user/view/user-detail/user-detail'));
export const UserEdit = lazy(() => import('src/sections/user/view/user-edit/user-edit'));
// ----------------------------------------------------------------------

// -------------------------- Departement ------------------------------------
export const DepartementPage = lazy(() => import('src/pages/departement'));
export const DepartementDetail= lazy(() => import('src/sections/departement/view/departement-detail/departement-detail'));
export const DepartementEdit = lazy(() => import('src/sections/departement/view/departement-edit/departement-edit'))

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
  const isLoggedIn = useSelector(
    (state: any) =>
      Boolean(state.application?.userLoggedIn) && Boolean(state.authentification?.connecter)
  );
  const desktopSecurityChecked = useSelector(
    (state: any) => Boolean(state.application?.desktopSecurityChecked)
  );
  const desktopSecurityBlocked = useSelector(
    (state: any) => Boolean(state.application?.desktopSecurityBlocked)
  );
  const isDesktop = Boolean((window as any)?.desktopApp?.isDesktop);
  const mustWaitDesktopSecurity = isDesktop && isLoggedIn && !desktopSecurityChecked;
  const mustShowDesktopLocked = isDesktop && isLoggedIn && desktopSecurityChecked && desktopSecurityBlocked;

  return useRoutes([
    {
      element: mustWaitDesktopSecurity ? (
        renderFallback
      ) : mustShowDesktopLocked ? (
        <Navigate to="/desktop-locked" replace />
      ) : isLoggedIn ? (
        <DashboardLayout>
          <Suspense fallback={renderFallback}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ) : (
        <Navigate to="/sign-in" replace />
      ),
      children: [
        { element: <HomePage />, index: true },
        { path: 'home', element: <HomePage /> },
        { path: 'user', element: <UserPage /> },
        { path: 'culte', element: <CultePage /> },
        { path: 'departement', element: <DepartementPage /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'settings', element: <SettingsPage /> },
        { path: 'blog', element: <BlogPage /> },
        {
          path: 'details',
          children: [
            { index: true, element: <UserPage /> }, // La liste des membres
            { path: ':id', element: <UserDetail /> }, // Détail d'un membre
             { path: 'edit/:id', element: <UserEdit /> },
          ],
        },
        {
          path: 'detailcultes',
          children: [
            { index: true, element: <CultePage /> }, // La liste des culte
            { path: ':id', element: <CulteDetail /> }, // Détail d'un culte
             { path: 'edit/:id', element: <CulteEdit /> },
          ],
        },
        {
          path: 'detaildepartement',
          children: [
            { index: true, element: <DepartementPage /> }, // La liste des departement
            { path: ':id', element: <DepartementDetail /> }, // Détail d'un departement
             { path: 'edit/:id', element: <DepartementEdit /> },
          ],
        },
      ],
    },
    {
      path: 'sign-in',
      element: mustShowDesktopLocked ? (
        <Navigate to="/desktop-locked" replace />
      ) : isLoggedIn ? (
        <Navigate to="/" replace />
      ) : (
        <AuthLayout>
          <SignInPage />
        </AuthLayout>
      ),
    },
    {
      path: 'sign-up',
      element: mustShowDesktopLocked ? (
        <Navigate to="/desktop-locked" replace />
      ) : isLoggedIn ? (
        <Navigate to="/" replace />
      ) : (
        <AuthLayout>
          <SignUpPage />
        </AuthLayout>
      ),
    },
    {
      path: 'desktop-locked',
      element: isLoggedIn ? (
        <AuthLayout>
          <DesktopLockedPage />
        </AuthLayout>
      ) : (
        <Navigate to="/sign-in" replace />
      ),
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);
}
