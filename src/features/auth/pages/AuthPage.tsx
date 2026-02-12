import React, { useState, useEffect } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { SignInModal } from '@/components/auth';
import { useAuth } from '@/hooks/use-auth';
import { cleanupThirdwebBackdrop } from '@/utils/cleanup-thirdweb';
import './AuthPage.css';

const AuthPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const { isAuthenticated } = useAuth();

  // Cerrar el modal cuando el usuario se autentica
  // Esto asegura que el overlay de Thirdweb se elimine correctamente
  useEffect(() => {
    if (isAuthenticated) {
      setIsModalOpen(false);

      setTimeout(cleanupThirdwebBackdrop, 200);
      setTimeout(cleanupThirdwebBackdrop, 500);
      setTimeout(cleanupThirdwebBackdrop, 1000);
    }
  }, [isAuthenticated]);

  return (
    <IonPage className="auth-page">
      <IonContent fullscreen className="auth-content">
        <div className="auth-background" />
        <div className="auth-container">
          <SignInModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AuthPage;
