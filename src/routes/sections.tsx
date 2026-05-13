import { lazy, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { getSessionUser, canAccessModule, canManageModule } from 'src/utils/access-control';

import { varAlpha } from 'src/theme/styles';
import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

export const HomePage = lazy(() => import('src/pages/home'));
export const BlogPage = lazy(() => import('src/pages/blog'));
export const SignInPage = lazy(() => import('src/pages/sign-in'));
export const SignUpPage = lazy(() => import('src/pages/sign-up'));
export const ProductsPage = lazy(() => import('src/pages/products'));
export const SettingsPage = lazy(() => import('src/pages/settings'));
export const ResponsabilitesPage = lazy(() => import('src/pages/responsabilites'));
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

function GuardedPage({
  permission,
  element,
  requireManage = false,
}: {
  permission: any;
  element: React.ReactNode;
  requireManage?: boolean;
}) {
  const sessionUser = useSelector((state: any) => getSessionUser(state));

  if (!canAccessModule(sessionUser, permission)) {
    return <Navigate to="/" replace />;
  }

  if (requireManage && !canManageModule(sessionUser, permission)) {
    return <Navigate to="/" replace />;
  }

  return <>{element}</>;
}

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
        { element: <GuardedPage permission="dashboard" element={<HomePage />} />, index: true },
        { path: 'home', element: <GuardedPage permission="dashboard" element={<HomePage />} /> },
        { path: 'user', element: <GuardedPage permission="user" element={<UserPage />} /> },
        { path: 'user/import', element: <GuardedPage permission="user" element={<UserImportPage />} requireManage /> },
        { path: 'culte', element: <GuardedPage permission="culte" element={<CultePage />} /> },
        { path: 'departement', element: <GuardedPage permission="departement" element={<DepartementPage />} /> },
        { path: 'cellule', element: <GuardedPage permission="cellule" element={<CellulePage />} /> },
        { path: 'groupe', element: <GuardedPage permission="groupe" element={<GroupePage />} /> },
        { path: 'cas-sociaux', element: <GuardedPage permission="social" element={<SocialPage />} /> },
        { path: 'galerie', element: <GuardedPage permission="galerie" element={<GaleriePage />} /> },
        { path: 'agenda', element: <GuardedPage permission="agenda" element={<AgendaPage />} /> },
        { path: 'comptabilite', element: <GuardedPage permission="comptabilite" element={<ComptabilitePage />} /> },
        { path: 'responsabilites', element: <GuardedPage permission="settings" element={<ResponsabilitesPage />} /> },
        { path: 'products', element: <ProductsPage /> },
        { path: 'settings', element: <GuardedPage permission="settings" element={<SettingsPage />} /> },
        { path: 'blog', element: <BlogPage /> },
        {
          path: 'details',
          children: [
            { index: true, element: <GuardedPage permission="user" element={<UserPage />} /> },
            { path: ':id', element: <GuardedPage permission="user" element={<UserDetail />} /> },
            { path: 'edit/:id', element: <GuardedPage permission="user" element={<UserEdit />} requireManage /> },
          ],
        },
        {
          path: 'detailcultes',
          children: [
            { index: true, element: <GuardedPage permission="culte" element={<CultePage />} /> },
            { path: ':id', element: <GuardedPage permission="culte" element={<CulteDetail />} /> },
            { path: 'edit/:id', element: <GuardedPage permission="culte" element={<CulteEdit />} requireManage /> },
          ],
        },
        {
          path: 'detaildepartement',
          children: [
            { index: true, element: <GuardedPage permission="departement" element={<DepartementPage />} /> },
            { path: ':id', element: <GuardedPage permission="departement" element={<DepartementDetail />} /> },
            { path: 'edit/:id', element: <GuardedPage permission="departement" element={<DepartementEdit />} requireManage /> },
          ],
        },
        {
          path: 'detailcellule',
          children: [
            { index: true, element: <GuardedPage permission="cellule" element={<CellulePage />} /> },
            { path: ':id', element: <GuardedPage permission="cellule" element={<CelluleDetail />} /> },
            { path: 'edit/:id', element: <GuardedPage permission="cellule" element={<CelluleEdit />} requireManage /> },
          ],
        },
        {
          path: 'detailgroupe',
          children: [
            { index: true, element: <GuardedPage permission="groupe" element={<GroupePage />} /> },
            { path: ':id', element: <GuardedPage permission="groupe" element={<GroupeDetail />} /> },
            { path: 'edit/:id', element: <GuardedPage permission="groupe" element={<GroupeEdit />} requireManage /> },
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
