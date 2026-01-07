import React from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

const HomePage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Colombia Invierte</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Colombia Invierte</IonTitle>
          </IonToolbar>
        </IonHeader>
        <div className="ion-padding">
          <h1>Bienvenido</h1>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default HomePage;

