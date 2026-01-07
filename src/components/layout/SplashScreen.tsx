import React from 'react';
import { IonSpinner } from '@ionic/react';
import './SplashScreen.css';

export const SplashScreen: React.FC = () => {
  return (
    <div className="splash-screen">
      <div className="splash-background">
        <div className="splash-band splash-band-yellow"></div>
        <div className="splash-band splash-band-blue">
          <div className="splash-title">
            <div className="splash-title-line">COLOMBIA</div>
            <div className="splash-title-line">INVIERTE</div>
          </div>
        </div>
        <div className="splash-band splash-band-red"></div>
      </div>
      <div className="splash-loader">
        <div className="splash-spinner-wrapper">
          <IonSpinner name="circular" className="splash-spinner" />
        </div>
      </div>
    </div>
  );
};

