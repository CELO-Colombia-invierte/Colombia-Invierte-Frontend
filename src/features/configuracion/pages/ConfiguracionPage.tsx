import React, { useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
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
  const { logout } = useAuth();
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  const handleBack = () => {
    history.goBack();
  };

  const handleQRClick = () => {
    console.log('QR clicked');
  };

  const handleLanguageClick = () => {
    history.push('/configuracion/idioma');
  };

  const handleProfileClick = () => {
    history.push('/configuracion/perfil');
  };

  const handleContactClick = () => {
    history.push('/configuracion/contactanos');
  };

  const handleChangePasswordClick = () => {
    history.push('/configuracion/cambiar-contrasena');
  };

  const handlePrivacyPolicyClick = () => {
    history.push('/configuracion/politicas-privacidad');
  };

  const handleBiometricToggle = (enabled: boolean) => {
    setBiometricEnabled(enabled);
    console.log('Biometric enabled:', enabled);
  };

  const handleLogout = async () => {
    try {
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
              onClick={handleLanguageClick}
            />
            <SettingsItem label="Mi perfil" onClick={handleProfileClick} />
            <SettingsItem label="Contactanos" onClick={handleContactClick} />
          </SettingsSection>

          <SettingsSection title="Seguridad">
            <SettingsItem
              label="Cambiar contraseña"
              onClick={handleChangePasswordClick}
            />
            <SettingsItem
              label="Políticas de privacidad"
              onClick={handlePrivacyPolicyClick}
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
