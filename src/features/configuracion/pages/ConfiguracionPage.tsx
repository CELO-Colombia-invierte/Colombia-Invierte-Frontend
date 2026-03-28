import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useActiveWallet, useDisconnect } from 'thirdweb/react';
import { useAuth } from '@/hooks/use-auth';
import {
  SettingsHeader,
  SettingsSection,
  SettingsItem,
} from '@/components/settings';
import { PageTransition } from '@/components/ui';
import './ConfiguracionPage.css';

const ConfiguracionPage: React.FC = () => {
  const history = useHistory();
  const { logout, user } = useAuth();
  const activeWallet = useActiveWallet();
  const { disconnect } = useDisconnect();

  const handleBack = () => {
    history.goBack();
  };

  const handleQRClick = () => {
  };

  const handleProfileClick = () => {
    if (user?.username) {
      history.push(`/perfil/${user.username}`);
    } else {
      history.push('/perfil');
    }
  };

  const handleLogout = () => {
    if (activeWallet) {
      disconnect(activeWallet);
    }
    logout();
  };

  return (
    <IonPage>
      <IonContent fullscreen className="configuracion-page-content">
        <PageTransition>
          <SettingsHeader
            title="Configuración"
            onBack={handleBack}
            showQRButton
            onQRClick={handleQRClick}
          />

          <div className="configuracion-page-body">
            <SettingsSection title="General">
              <SettingsItem
                label="Idioma"
                value="English"
              />
              <SettingsItem label="Mi perfil" onClick={handleProfileClick} />
              <SettingsItem label="Contactanos" />
            </SettingsSection>

            <SettingsSection title="Seguridad">
              <SettingsItem
                label="Políticas de privacidad"
              />
            </SettingsSection>

            <SettingsSection>
              <SettingsItem
                label="Cerrar sesión"
                onClick={handleLogout}
                showChevron={false}
              />
            </SettingsSection>
          </div>
        </PageTransition>
      </IonContent>
    </IonPage>
  );
};

export default ConfiguracionPage;
