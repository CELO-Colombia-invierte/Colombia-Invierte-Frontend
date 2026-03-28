import { useEffect, useRef } from 'react';
import { useActiveWallet, useDisconnect } from 'thirdweb/react';
import { useAuth } from '@/hooks/use-auth';

const IDLE_TIMEOUT_MS = 5 * 60 * 1000; 
const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll'];

export const useIdleTimeout = () => {
  const { logout, isAuthenticated } = useAuth();
  const activeWallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const logoutRef = useRef(logout);
  const walletRef = useRef(activeWallet);
  const disconnectRef = useRef(disconnect);

  useEffect(() => { logoutRef.current = logout; }, [logout]);
  useEffect(() => { walletRef.current = activeWallet; }, [activeWallet]);
  useEffect(() => { disconnectRef.current = disconnect; }, [disconnect]);

  useEffect(() => {
    if (!isAuthenticated) return;

    let timer: ReturnType<typeof setTimeout> | null = null;

    const resetTimer = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        if (walletRef.current) {
          disconnectRef.current(walletRef.current);
        }
        logoutRef.current();
      }, IDLE_TIMEOUT_MS);
    };

    resetTimer();

    ACTIVITY_EVENTS.forEach((event) => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      if (timer) clearTimeout(timer);
      ACTIVITY_EVENTS.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated]);
};
