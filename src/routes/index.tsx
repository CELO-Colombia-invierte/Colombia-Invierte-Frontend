import { RouteConfig } from '@/types';
import { lazy } from 'react';

const HomePage = lazy(() => import('@/features/home/pages/HomePage'));
const AuthPage = lazy(() => import('@/features/auth/pages/AuthPage'));
const InversionesPage = lazy(
  () => import('@/features/inversiones/pages/InversionesPage')
);
const PerfilPage = lazy(() => import('@/features/perfil/pages/PerfilPage'));

export const routes: RouteConfig[] = [
  {
    path: '/home',
    component: HomePage,
    exact: true,
  },
  {
    path: '/auth',
    component: AuthPage,
    exact: true,
  },
  {
    path: '/inversiones',
    component: InversionesPage,
    exact: true,
  },
  {
    path: '/perfil',
    component: PerfilPage,
    exact: true,
  },
];

