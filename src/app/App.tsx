import React, { Suspense, useState } from 'react';
import { Redirect, Route, useLocation, useHistory } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
  IonIcon,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { walletOutline, businessOutline } from 'ionicons/icons';
import { routes } from '@/routes';
import { SplashScreen, LoadingScreen } from '@/components/layout';
import { OnboardingCarousel } from '@/components/onboarding';
import { BottomNavBar } from '@/components/navigation/bottomNavBar/BottomNavBar';
import { BottomSlideModal } from '@/components/ui/BottomSlideModal';
import { useSplash } from '@/hooks/use-splash';
import { useOnboarding } from '@/hooks/use-onboarding';

setupIonicReact();

const MainContent: React.FC = () => {
  const location = useLocation();
  const history = useHistory();
  const hideNavBar =
    location.pathname.startsWith('/mensajes/') ||
    location.pathname === '/crear-natillera' ||
    location.pathname === '/crear-tokenizacion';
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
          {routes.map((route) => (
            <Route
              key={route.path}
              exact={route.exact}
              path={route.path}
              component={route.component}
            />
          ))}
          <Redirect exact from="/" to="/home" />
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

const AppContent: React.FC = () => {
  const { showSplash, showLoading, loadingProgress, isReady } = useSplash();
  const {
    showOnboarding,
    isLoading: onboardingLoading,
    completeOnboarding,
  } = useOnboarding();

  if (showSplash) {
    return <SplashScreen />;
  }

  if (showLoading) {
    return <LoadingScreen progress={loadingProgress} />;
  }

  if (isReady && !onboardingLoading && showOnboarding) {
    return <OnboardingCarousel onComplete={completeOnboarding} />;
  }

  if (isReady && !onboardingLoading) {
    return (
      <IonApp>
        <IonReactRouter>
          <MainContent />
        </IonReactRouter>
      </IonApp>
    );
  }

  return null;
};

const App: React.FC = () => <AppContent />;

export default App;
