import React from 'react';
import { IonIcon } from '@ionic/react';
import { useLocation, useHistory } from 'react-router-dom';
import {
  homeOutline,
  folderOutline,
  addCircle,
  chatbubbleOutline,
  settingsOutline,
} from 'ionicons/icons';
import { motion, AnimatePresence } from 'framer-motion';
import './BottomNavBar.css';

export interface NavTab {
  path: string;
  icon: string;
  label: string;
}

export interface BottomNavBarProps {
  onCentralButtonClick?: () => void;
  tabs?: NavTab[];
}

const defaultTabs: NavTab[] = [
  { path: '/home', icon: homeOutline, label: 'Inicio' },
  { path: '/portafolio', icon: folderOutline, label: 'Portafolio' },
  { path: '/mensajes', icon: chatbubbleOutline, label: 'Mensajes' },
  { path: '/configuracion', icon: settingsOutline, label: 'Config.' },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  onCentralButtonClick,
  tabs = defaultTabs,
}) => {
  const location = useLocation();
  const history = useHistory();

  const isActive = (path: string) => location.pathname === path;

  const handleTabClick = (path: string) => {
    history.push(path);
  };

  const handleCentralClick = () => {
    if (onCentralButtonClick) {
      onCentralButtonClick();
    }
  };

  const getActiveTabIndex = () => {
    const index = tabs.findIndex((tab) => tab.path === location.pathname);
    return index !== -1 ? index : 0;
  };

  const activeIndex = getActiveTabIndex();
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 430;

  const calculateTabPosition = () => {
    const tabWidth = screenWidth / 5;

    const positions = [
      tabWidth * 0.5,
      tabWidth * 1.5,
      tabWidth * 3.5,
      tabWidth * 4.5,
    ];

    const position = positions[activeIndex] || positions[0];
    const calculatedPosition = Math.min(
      Math.max(position, 50),
      screenWidth - 50
    );

    // Validar que el resultado sea un número válido
    return isNaN(calculatedPosition) ? tabWidth * 0.5 : calculatedPosition;
  };

  const activePosition = calculateTabPosition();
  const firstHalf = tabs.slice(0, 2);
  const secondHalf = tabs.slice(2);

  return (
    <nav className="bottom-navbar">
      <svg
        className="navbar-svg-background"
        viewBox={`0 0 ${screenWidth} 80`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="navbar-shadow">
            <feDropShadow
              dx="0"
              dy="-4"
              stdDeviation="10"
              floodOpacity="0.15"
            />
          </filter>
        </defs>
        <motion.path
          d={`M 0,0 L 0,80 L ${screenWidth},80 L ${screenWidth},0
              L ${activePosition + 60},0
              C ${activePosition + 50},0 ${activePosition + 45},8 ${activePosition + 38},18
              C ${activePosition + 31},28 ${activePosition + 20},42 ${activePosition},50
              C ${activePosition - 20},42 ${activePosition - 31},28 ${activePosition - 38},18
              C ${activePosition - 45},8 ${activePosition - 50},0 ${activePosition - 60},0
              L 0,0 Z`}
          fill="#4A5568"
          filter="url(#navbar-shadow)"
          animate={{
            d: `M 0,0 L 0,80 L ${screenWidth},80 L ${screenWidth},0
                L ${activePosition + 50},0
                C ${activePosition + 30},0 ${activePosition + 30},30 ${activePosition + 30},15
                C ${activePosition + 30},20 ${activePosition + 30},42 ${activePosition},60
                C ${activePosition - 30},60 ${activePosition - 30},30 ${activePosition - 30},15
                C ${activePosition - 30},8 ${activePosition - 30},0 ${activePosition - 50},0
                L 0,0 Z`,
          }}
          transition={{
            type: 'spring',
            stiffness: 180,
            damping: 20,
          }}
        />
      </svg>

      <div className="navbar-content">
        {firstHalf.map((tab) => (
          <button
            key={tab.path}
            className={`nav-tab ${isActive(tab.path) ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.path)}
          >
            <div className="tab-content">
              <AnimatePresence mode="wait">
                {isActive(tab.path) ? (
                  <motion.div
                    key="active"
                    className="active-tab-indicator"
                    initial={{ scale: 0, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0, y: 20 }}
                    transition={{
                      type: 'spring',
                      stiffness: 260,
                      damping: 20,
                    }}
                  >
                    <div className="active-circle">
                      <IonIcon icon={tab.icon} className="tab-icon active" />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="inactive"
                    className="inactive-tab-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <IonIcon icon={tab.icon} className="tab-icon" />
                    <span className="tab-label">{tab.label}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </button>
        ))}
        <div className="central-tab-button">
          <motion.button
            className="central-button"
            onClick={handleCentralClick}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <IonIcon icon={addCircle} className="central-icon" />
          </motion.button>
        </div>
        {secondHalf.map((tab) => (
          <button
            key={tab.path}
            className={`nav-tab ${isActive(tab.path) ? 'active' : ''}`}
            onClick={() => handleTabClick(tab.path)}
          >
            <div className="tab-content">
              <AnimatePresence mode="wait">
                {isActive(tab.path) ? (
                  <motion.div
                    key="active"
                    className="active-tab-indicator"
                    initial={{ scale: 0, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0, y: 20 }}
                    transition={{
                      type: 'spring',
                      stiffness: 260,
                      damping: 20,
                    }}
                  >
                    <div className="active-circle">
                      <IonIcon icon={tab.icon} className="tab-icon active" />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="inactive"
                    className="inactive-tab-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <IonIcon icon={tab.icon} className="tab-icon" />
                    <span className="tab-label">{tab.label}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </button>
        ))}
      </div>
    </nav>
  );
};
