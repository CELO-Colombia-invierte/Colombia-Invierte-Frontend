import React, { Suspense } from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { routes } from '@/routes';
import { SplashScreen, LoadingScreen } from '@/components/layout';
import { OnboardingCarousel } from '@/components/onboarding';
import { useSplash } from '@/hooks/use-splash';
import { useOnboarding } from '@/hooks/use-onboarding';

setupIonicReact();

const AppContent: React.FC = () => {
  const { showSplash, showLoading, loadingProgress, isReady } = useSplash();
  const { showOnboarding, isLoading: onboardingLoading, completeOnboarding } = useOnboarding();

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
          <IonRouterOutlet>
            <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Cargando...</div>}>
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
        </IonReactRouter>
      </IonApp>
    );
  }

  return null;
};

const App: React.FC = () => <AppContent />;

export default App;

