import React from 'react';
import { IonIcon } from '@ionic/react';
import { useLocation, useHistory } from 'react-router-dom';
import { useUnreadMessages } from '@/hooks/use-unread-messages';
import {
  homeOutline,
  home,
  folderOutline,
  folder,
  addOutline,
  chatbubbleOutline,
  chatbubble,
  settingsOutline,
  settings,
} from 'ionicons/icons';
import { motion, AnimatePresence } from 'framer-motion';
import './BottomNavBar.css';

export interface NavTab {
  path: string;
  icon: string;
  activeIcon: string;
  label: string;
}

export interface BottomNavBarProps {
  onCentralButtonClick?: () => void;
  tabs?: NavTab[];
}

const defaultTabs: NavTab[] = [
  { path: '/home', icon: homeOutline, activeIcon: home, label: 'Inicio' },
  { path: '/portafolio', icon: folderOutline, activeIcon: folder, label: 'Portafolio' },
  { path: '/mensajes', icon: chatbubbleOutline, activeIcon: chatbubble, label: 'Mensajes' },
  { path: '/configuracion', icon: settingsOutline, activeIcon: settings, label: 'Config.' },
];

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  onCentralButtonClick,
  tabs = defaultTabs,
}) => {
  const location = useLocation();
  const history = useHistory();
  const { totalUnread } = useUnreadMessages();

  const isActive = (path: string) => location.pathname === path;

  const handleTabClick = (path: string) => {
    history.push(path);
  };

  const handleCentralClick = () => {
    if (onCentralButtonClick) {
      onCentralButtonClick();
    }
  };

  const firstHalf = tabs.slice(0, 2);
  const secondHalf = tabs.slice(2);

  const renderTab = (tab: NavTab) => {
    const showBadge = tab.path === '/mensajes' && totalUnread > 0;

    return (
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
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <div className="active-circle">
                  <IonIcon icon={tab.activeIcon} className="tab-icon active" />
                  <span className="tab-active-label">{tab.label}</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="inactive"
                className="inactive-tab-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <div className="tab-icon-wrapper">
                  <IonIcon icon={tab.icon} className="tab-icon" />
                  {showBadge && (
                    <span className="tab-badge">
                      {totalUnread > 99 ? '99+' : totalUnread}
                    </span>
                  )}
                </div>
                <span className="tab-label">{tab.label}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </button>
    );
  };

  return (
    <nav className="bottom-navbar">
      <div className="navbar-background">
        <svg
          viewBox="0 0 400 72"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,16 Q0,0 16,0 L155,0 C165,0 170,0 175,5 Q185,18 200,18 Q215,18 225,5 C230,0 235,0 245,0 L384,0 Q400,0 400,16 L400,72 L0,72 Z"
            fill="#1e293b"
          />
        </svg>
      </div>
      <div className="navbar-content">
        {firstHalf.map(renderTab)}
        <div className="central-tab-button">
          <motion.button
            className="central-button"
            onClick={handleCentralClick}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <IonIcon icon={addOutline} className="central-icon" />
          </motion.button>
        </div>
        {secondHalf.map(renderTab)}
      </div>
    </nav>
  );
};
