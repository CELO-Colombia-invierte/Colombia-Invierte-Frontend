import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { Suspense } from 'react';

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
        <Suspense fallback={<div>Cargando...</div>}>
          <div className="ion-padding">
            <h1>Bienvenido</h1>
          </div>
        </Suspense>
      </IonContent>
    </IonPage>
  );
};

export default HomePage;

