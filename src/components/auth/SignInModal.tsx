import React, { useMemo } from 'react';
import { ConnectEmbed } from 'thirdweb/react';
import { useActiveAccount } from 'thirdweb/react';
import { createThirdwebClient } from 'thirdweb';
import { inAppWallet, createWallet } from 'thirdweb/wallets';
import { defineChain } from 'thirdweb/chains';
import './SignInModal.css';

const celo = defineChain({
  id: 42220,
  name: 'Celo',
  nativeCurrency: {
    name: 'Celo',
    symbol: 'CELO',
    decimals: 18,
  },
  rpc: 'https://forno.celo.org',
});

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose }) => {
  const account = useActiveAccount();
  
  const client = useMemo(() => {
    return createThirdwebClient({
      clientId: import.meta.env.VITE_THIRDWEB_CLIENT_ID || 'd0723b13ad08e9e6a2e45a381a1f2a81'
    });
  }, []);

  const wallets = useMemo(() => [
    inAppWallet({
      auth: {
        options: ['email', 'phone', 'google', 'apple', 'facebook', 'passkey']
      }
    }),
    createWallet('io.metamask')
  ], []);

  if (!isOpen) return null;

  const handleConnect = () => {
    if (account) {
      onClose();
    }
  };

  const getLogoPath = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/assets/images/colombia-flag-logo.svg`;
    }
    return '/assets/images/colombia-flag-logo.svg';
  };

  const getIconSize = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth <= 768) {
        return 48;
      }
      if (window.innerWidth >= 1440) {
        return 90;
      }
      if (window.innerWidth >= 1025) {
        return 82;
      }
      return 66;
    }
    return 48;
  };

  const connectEmbedProps = {
    client,
    wallets,
    chain: celo,
    theme: 'dark' as const,
    onConnect: handleConnect,
    showThirdwebBranding: false,
    modalSize: 'wide' as const,
    header: {
      title: 'COLOMBIA INVIERTE',
      titleIcon: getLogoPath(),
      iconSize: getIconSize()
    }
  };

  return <ConnectEmbed {...(connectEmbedProps as any)} />;
};

