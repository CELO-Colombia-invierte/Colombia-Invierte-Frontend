import React, { useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useActiveWallet, useDisconnect } from 'thirdweb/react';
import { useAuth } from '@/hooks/use-auth';
import {
  SettingsHeader,
  SettingsSection,
  SettingsItem,
  SettingsToggle,
} from '@/components/settings';
import './ConfiguracionPage.css';

const ConfiguracionPage: React.FC = () => {
  const history = useHistory();
  const { logout, user } = useAuth();
  const activeWallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const [biometricEnabled, setBiometricEnabled] = useState(true);

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

  const handleBiometricToggle = (enabled: boolean) => {
    setBiometricEnabled(enabled);
  };

  const handleLogout = async () => {
    try {
      if (activeWallet) {
        disconnect(activeWallet);
      }
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen className="configuracion-page-content">
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
              label="Cambiar contraseña"
            />
            <SettingsItem
              label="Políticas de privacidad"
            />
            <SettingsToggle
              label="Datos biométricos"
              description="Choose what data you share with us"
              checked={biometricEnabled}
              onChange={handleBiometricToggle}
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
      </IonContent>
    </IonPage>
  );
};

export default ConfiguracionPage;
