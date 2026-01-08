import React, { useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { SignInModal } from '@/components/auth';
import './AuthPage.css';

const AuthPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <IonPage className="auth-page">
      <IonContent fullscreen className="auth-content">
        <div className="auth-background" />
        <div className="auth-container">
          <SignInModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AuthPage;

