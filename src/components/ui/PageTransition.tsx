import React, { useRef } from 'react';
import { useIonViewWillEnter } from '@ionic/react';
import { motion, useAnimation } from 'framer-motion';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const controls = useAnimation();
  const isFirst = useRef(true);

  useIonViewWillEnter(() => {
    if (isFirst.current) {
      isFirst.current = false;
      controls.set({ opacity: 0, y: 14 });
    } else {
      controls.set({ opacity: 0, y: 10 });
    }
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] },
    });
  });

  return (
    <motion.div animate={controls}>
      {children}
    </motion.div>
  );
};
