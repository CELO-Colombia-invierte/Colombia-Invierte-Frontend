import React, { useState, useEffect, useRef } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { SignInModal } from '@/components/auth';
import { useAuth } from '@/hooks/use-auth';
import { isProfileComplete } from '@/utils/profile';
import { cleanupThirdwebBackdrop } from '@/utils/cleanup-thirdweb';
import './AuthPage.css';

const AuthPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const { isAuthenticated, user } = useAuth();
  const history = useHistory();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !hasRedirected.current) {
      hasRedirected.current = true;
      setIsModalOpen(false);
      cleanupThirdwebBackdrop();
      const redirectPath = isProfileComplete(user)
        ? '/home'
        : '/complete-profile';
      history.replace(redirectPath);
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
