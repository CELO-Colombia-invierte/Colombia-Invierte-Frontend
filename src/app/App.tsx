import React, { Suspense } from 'react';
import { Redirect, Route, useLocation } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { routes } from '@/routes';
import { SplashScreen, LoadingScreen } from '@/components/layout';
import { OnboardingCarousel } from '@/components/onboarding';
import { BottomNavBar } from '@/components/navigation/bottomNavBar/BottomNavBar';
import { useSplash } from '@/hooks/use-splash';
import { useOnboarding } from '@/hooks/use-onboarding';

setupIonicReact();

const MainContent: React.FC = () => {
  const location = useLocation();
  const hideNavBar = location.pathname.startsWith('/mensajes/');

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
        <BottomNavBar
          onCentralButtonClick={() => console.log('Central button clicked!')}
        />
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
