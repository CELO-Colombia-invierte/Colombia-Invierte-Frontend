import React, { Suspense, useState } from 'react';
import { Redirect, Route, useHistory, useLocation } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
  IonIcon,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ThirdwebProvider } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';
import { walletOutline, businessOutline } from 'ionicons/icons';
import { routes } from '@/routes';
import { SplashScreen, LoadingScreen } from '@/components/layout';
import { OnboardingCarousel } from '@/components/onboarding';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { BottomNavBar } from '@/components/navigation/bottomNavBar/BottomNavBar';
import { BottomSlideModal } from '@/components/ui/BottomSlideModal';
import { useSplash } from '@/hooks/use-splash';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useCleanupThirdweb } from '@/hooks/use-cleanup-thirdweb';

setupIonicReact();

export const thirdwebClient = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || '',
});

const MainContent: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const hideNavBar =
    location.pathname.startsWith('/mensajes/') ||
    location.pathname.startsWith('/inversiones/') ||
    location.pathname === '/crear-natillera' ||
    location.pathname === '/crear-tokenizacion' ||
    location.pathname === '/complete-profile';
  const [isModalOpen, setIsModalOpen] = useState(false);

  const modalOptions = [
    {
      id: 'crear-natillera',
      title: 'Crear Natillera',
      description: 'Crea un proyecto de ahorro colectivo',
      icon: <IonIcon icon={walletOutline} />,
      onClick: () => {
        history.push('/crear-natillera');
      },
    },
    {
      id: 'crear-tokenizacion',
      title: 'Crear Tokenización',
      description: 'Tokeniza un activo o proyecto',
      icon: <IonIcon icon={businessOutline} />,
      onClick: () => {
        history.push('/crear-tokenizacion');
      },
    },
  ];

  return (
    <>
      <IonRouterOutlet>
        <Suspense
          fallback={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
              }}
            >
              Cargando...
            </div>
          }
        >
          <Route
            exact
            path="/auth"
            component={routes.find((r) => r.path === '/auth')?.component}
          />
          <Route
            exact
            path="/complete-profile"
            component={
              routes.find((r) => r.path === '/complete-profile')?.component
            }
          />
          {routes
            .filter(
              (route) =>
                route.path !== '/auth' && route.path !== '/complete-profile'
            )
            .map((route) => (
              <ProtectedRoute
                key={route.path}
                exact={route.exact}
                path={route.path}
                component={route.component}
              />
            ))}
          <Route exact path="/" render={() => <Redirect to="/home" />} />
        </Suspense>
      </IonRouterOutlet>
      {!hideNavBar && (
        <>
          <BottomNavBar onCentralButtonClick={() => setIsModalOpen(true)} />
          <BottomSlideModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            options={modalOptions}
            title="¿Qué deseas hacer?"
          />
        </>
      )}
    </>
  );
};

const AppRouter: React.FC = () => {
  return <MainContent />;
};

const OnboardingWrapper: React.FC = () => {
  const { showOnboarding, isLoading, completeOnboarding } = useOnboarding();
  const history = useHistory();

  const handleComplete = () => {
    completeOnboarding();
    history.push('/auth');
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        Cargando...
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingCarousel onComplete={handleComplete} />;
  }

  return <AppRouter />;
};

const AppContent: React.FC = () => {
  const { showSplash, showLoading, loadingProgress, isReady } = useSplash();
  useCleanupThirdweb();

  if (showSplash) {
    return <SplashScreen />;
  }

  if (showLoading) {
    return <LoadingScreen progress={loadingProgress} />;
  }

  if (isReady) {
    return (
      <ThirdwebProvider>
        <IonApp>
          <IonReactRouter>
            <OnboardingWrapper />
          </IonReactRouter>
        </IonApp>
      </ThirdwebProvider>
    );
  }

  return null;
};

const App: React.FC = () => <AppContent />;

export default App;
