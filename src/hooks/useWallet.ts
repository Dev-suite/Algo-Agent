import { useState, useEffect } from 'react';
import { walletService, WalletState } from '../services/walletService';

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>(walletService.getState());

  useEffect(() => {
    // Subscribe to wallet state changes
    const unsubscribe = walletService.subscribe(setWalletState);

    // Try to restore previous connection on mount
    walletService.restoreConnection();

    return unsubscribe;
  }, []);

  const connectWallet = async (walletId: string) => {
    try {
      await walletService.connectWallet(walletId);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    try {
      await walletService.disconnectWallet();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  };

  const refreshBalance = async () => {
    try {
      await walletService.refreshBalance();
    } catch (error) {
      console.error('Failed to refresh balance:', error);
      throw error;
    }
  };

  const getAvailableWallets = () => {
    return walletService.getAvailableWallets();
  };

  const formatAddress = (address: string) => {
    return walletService.formatAddress(address);
  };

  const formatBalance = (balance: number) => {
    return walletService.formatBalance(balance);
  };

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    getAvailableWallets,
    formatAddress,
    formatBalance
  };
};