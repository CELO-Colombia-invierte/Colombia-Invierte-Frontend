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
import { useSplash } from '@/hooks/use-splash';

setupIonicReact();

const AppContent: React.FC = () => {
  const { showSplash, showLoading, loadingProgress, isReady } = useSplash();

  if (isReady) {
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

  if (showSplash) {
    return <SplashScreen />;
  }

  if (showLoading) {
    return <LoadingScreen progress={loadingProgress} />;
  }

  return null;
};

const App: React.FC = () => <AppContent />;

export default App;

