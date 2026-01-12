import React from 'react';
import { IonButton } from '@ionic/react';

export const Button: React.FC<React.ComponentProps<typeof IonButton>> = (props) => {
  return <IonButton {...props} />;
};

