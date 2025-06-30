import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, RefreshCw } from 'lucide-react';
import { Button } from '../ui';
import { useWallet } from '../hooks/useWallet';
import WalletConnectModal from './WalletConnectModal';

interface WalletButtonProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
}

const WalletButton: React.FC<WalletButtonProps> = ({ className, size = 'medium' }) => {
  const { 
    isConnected, 
    account, 
    balance, 
    isConnecting, 
    disconnectWallet, 
    refreshBalance,
    formatAddress, 
    formatBalance 
  } = useWallet();
  
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCopyAddress = async () => {
    if (account?.address) {
      try {
        await navigator.clipboard.writeText(account.address);
        // You could add a toast notification here
      } catch (error) {
        console.error('Failed to copy address:', error);
      }
    }
  };

  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    try {
      await refreshBalance();
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectWallet();
      setShowDropdown(false);
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  };

  if (!isConnected) {
    return (
      <>
        <Button
          variant="brand-primary"
          size={size}
          onClick={() => setShowModal(true)}
          disabled={isConnecting}
          icon={isConnecting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Wallet className="w-4 h-4" />
          )}
          className={className}
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
        
        <WalletConnectModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
        />
      </>
    );
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowDropdown(!showDropdown)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center space-x-3 px-4 py-2 bg-neutral-800 border border-amber-800/30 rounded-[12px] hover:bg-neutral-700/50 transition-all duration-200 ${className}`}
      >
        <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center">
          <Wallet className="w-4 h-4 text-white" />
        </div>
        
        <div className="text-left min-w-0">
          <div className="font-['Montserrat'] text-[14px] font-[600] text-white truncate">
            {formatAddress(account?.address || '')}
          </div>
          <div className="font-['Montserrat'] text-[12px] text-white/60">
            {formatBalance(balance)} ALGO
          </div>
        </div>
        
        <ChevronDown className={`w-4 h-4 text-white/60 transition-transform duration-200 ${
          showDropdown ? 'rotate-180' : ''
        }`} />
      </motion.button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full right-0 mt-2 w-64 bg-neutral-800 border border-amber-800/30 rounded-[12px] shadow-lg z-50"
        >
          {/* Account Info */}
          <div className="p-4 border-b border-amber-800/20">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-brand-600 rounded-full flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-['Montserrat'] text-[14px] font-[600] text-white">
                  {account?.name || 'Algorand Account'}
                </div>
                <div className="font-['Montserrat'] text-[12px] text-white/60">
                  Connected
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-['Montserrat'] text-[12px] text-white/60">Address:</span>
                <div className="flex items-center space-x-1">
                  <span className="font-['Montserrat'] text-[12px] font-[500] text-white">
                    {formatAddress(account?.address || '')}
                  </span>
                  <button
                    onClick={handleCopyAddress}
                    className="p-1 hover:bg-neutral-700 rounded transition-colors"
                  >
                    <Copy className="w-3 h-3 text-white/60" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-['Montserrat'] text-[12px] text-white/60">Balance:</span>
                <div className="flex items-center space-x-1">
                  <span className="font-['Montserrat'] text-[12px] font-[500] text-white">
                    {formatBalance(balance)} ALGO
                  </span>
                  <button
                    onClick={handleRefreshBalance}
                    disabled={isRefreshing}
                    className="p-1 hover:bg-neutral-700 rounded transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 text-white/60 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-2">
            <button
              onClick={() => window.open('https://algoexplorer.io/address/' + account?.address, '_blank')}
              className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-neutral-700/50 rounded-lg transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-white/60" />
              <span className="font-['Montserrat'] text-[14px] text-white">View on Explorer</span>
            </button>
            
            <button
              onClick={handleDisconnect}
              className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-error-900/20 rounded-lg transition-colors text-error-400"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-['Montserrat'] text-[14px]">Disconnect</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default WalletButton;