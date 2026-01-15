import { RouteConfig } from '@/types';
import { lazy } from 'react';

const HomePage = lazy(() => import('@/features/home/pages/HomePage'));
const AuthPage = lazy(() => import('@/features/auth/pages/AuthPage'));
const PortafolioPage = lazy(
  () => import('@/features/portafolio/pages/PortafolioPage')
);
const MensajesPage = lazy(
  () => import('@/features/mensajes/pages/MensajesPage')
);
const ChatConversationPage = lazy(
  () => import('@/features/mensajes/pages/ChatConversationPage')
);
const PerfilPage = lazy(() => import('@/features/perfil/pages/PerfilPage'));
const CrearNatilleraPage = lazy(
  () => import('@/features/natillera/pages/CrearNatilleraPage')
);
const JoinNatilleraPage = lazy(
  () => import('@/features/natillera/pages/JoinNatilleraPage')
);
const CrearTokenizacionPage = lazy(
  () => import('@/features/tokenizacion/pages/CrearTokenizacionPage')
);
const ConfiguracionPage = lazy(
  () => import('@/features/configuracion/pages/ConfiguracionPage')
);

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
    path: '/portafolio',
    component: PortafolioPage,
    exact: true,
  },
  {
    path: '/mensajes',
    component: MensajesPage,
    exact: true,
  },
  {
    path: '/mensajes/:userId',
    component: ChatConversationPage,
    exact: true,
  },
  {
    path: '/perfil',
    component: PerfilPage,
    exact: true,
  },
  {
    path: '/crear-natillera',
    component: CrearNatilleraPage,
    exact: true,
  },
  {
    path: '/natillera/:slug',
    component: JoinNatilleraPage,
    exact: true,
  },
  {
    path: '/crear-tokenizacion',
    component: CrearTokenizacionPage,
    exact: true,
  },
  {
    path: '/configuracion',
    component: ConfiguracionPage,
    exact: true,
  },
];
