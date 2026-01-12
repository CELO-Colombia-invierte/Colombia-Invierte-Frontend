import React, { Suspense } from 'react';
import { Redirect, Route, useHistory } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ThirdwebProvider } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';
import { routes } from '@/routes';
import { SplashScreen, LoadingScreen } from '@/components/layout';
import { OnboardingCarousel } from '@/components/onboarding';
import { useSplash } from '@/hooks/use-splash';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useAuth } from '@/hooks/use-auth';

setupIonicReact();

export const thirdwebClient = createThirdwebClient({
  clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || ''
});

const AppRouter: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
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
        <Route
          exact
          path="/"
          render={() => {
            if (!isAuthenticated) {
              return <Redirect to="/auth" />;
            }
            return <Redirect to="/home" />;
          }}
        />
      </Suspense>
    </IonRouterOutlet>
  );
};

const OnboardingWrapper: React.FC = () => {
  const { showOnboarding, isLoading, completeOnboarding } = useOnboarding();
  const history = useHistory();

  const handleComplete = () => {
    completeOnboarding();
    history.push('/auth');
  };

  if (isLoading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Cargando...</div>;
  }

  if (showOnboarding) {
    return <OnboardingCarousel onComplete={handleComplete} />;
  }

  return <AppRouter />;
};

const AppContent: React.FC = () => {
  const { showSplash, showLoading, loadingProgress, isReady } = useSplash();

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

