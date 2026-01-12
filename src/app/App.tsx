import React, { Suspense } from 'react';
import { Redirect, Route, useHistory } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact,
  IonIcon,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ThirdwebProvider } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';
import { defineChain } from 'thirdweb/chains';
import { routes } from '@/routes';
import { SplashScreen, LoadingScreen } from '@/components/layout';
import { OnboardingCarousel } from '@/components/onboarding';
import { BottomNavBar } from '@/components/navigation/bottomNavBar/BottomNavBar';
import { BottomSlideModal } from '@/components/ui/BottomSlideModal';
import { useSplash } from '@/hooks/use-splash';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useAuth } from '@/hooks/use-auth';

setupIonicReact();

const celo = defineChain({
  id: 42220,
  name: 'Celo',
  nativeCurrency: {
    name: 'Celo',
    symbol: 'CELO',
    decimals: 18,
  },
  rpc: 'https://forno.celo.org',
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
    const client = createThirdwebClient({
      clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || 'd0723b13ad08e9e6a2e45a381a1f2a81'
    });

    return (
      <ThirdwebProvider client={client}>
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
