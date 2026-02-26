import React, { useMemo, useEffect, useRef } from 'react';
import { ConnectEmbed } from 'thirdweb/react';
import { useActiveAccount } from 'thirdweb/react';
import { inAppWallet, createWallet, getUserEmail } from 'thirdweb/wallets';
import { defineChain } from 'thirdweb/chains';
import { thirdwebClient } from '@/app/App';
import { useAuth } from '@/hooks/use-auth';
import { cleanupThirdwebBackdrop } from '@/utils/cleanup-thirdweb';
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

export const SignInModal: React.FC<SignInModalProps> = ({
  isOpen,
  onClose,
}) => {
  const account = useActiveAccount();
  const { verifyThirdweb, isLoading, isAuthenticated } = useAuth();
  const verifyingRef = useRef(false);
  const lastAddressRef = useRef<string | null>(null);
  const verifyThirdwebRef = useRef(verifyThirdweb);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    verifyThirdwebRef.current = verifyThirdweb;
  }, [verifyThirdweb]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const wallets = useMemo(
    () => [
      inAppWallet({
        auth: {
          options: ['email', 'phone', 'google', 'apple', 'facebook', 'passkey'],
        },
      }),
      createWallet('io.metamask'),
    ],
    []
  );

  useEffect(() => {
    if (isAuthenticated) {
      cleanupThirdwebBackdrop();
      setTimeout(cleanupThirdwebBackdrop, 100);
      setTimeout(cleanupThirdwebBackdrop, 300);
      setTimeout(cleanupThirdwebBackdrop, 500);

      onCloseRef.current();
      return;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!account?.address || isAuthenticated) return;
    if (verifyingRef.current) return;
    if (lastAddressRef.current === account.address) return;

    const handleVerify = async () => {
      verifyingRef.current = true;
      lastAddressRef.current = account.address!;

      try {
        let userEmail: string | undefined;
        try {
          userEmail = await getUserEmail({ client: thirdwebClient });
        } catch (emailError) {
          console.error('Error getting email:', emailError);
        }

        await verifyThirdwebRef.current({
          wallet_address: account.address!,
          thirdweb_user_id: account.address!,
          chain_id: celo.id,
          email: userEmail,
        });

        onCloseRef.current();
      } catch (error) {
        console.error('Error verifying account:', error);
        lastAddressRef.current = null;
      } finally {
        verifyingRef.current = false;
      }
    };

    handleVerify();
  }, [account?.address, isAuthenticated]);

  useEffect(() => {
    return () => {
      cleanupThirdwebBackdrop();
    };
  }, []);

  if (!isOpen) return null;

  const handleConnect = () => {
    
    if (account?.address && !isLoading) {
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
    client: thirdwebClient,
    wallets,
    chain: celo,
    theme: 'dark' as const,
    onConnect: handleConnect,
    showThirdwebBranding: false,
    modalSize: 'wide' as const,
    header: {
      title: 'COLOMBIA INVIERTE',
      titleIcon: getLogoPath(),
      iconSize: getIconSize(),
    },
  };

  return <ConnectEmbed {...(connectEmbedProps as any)} />;
};
