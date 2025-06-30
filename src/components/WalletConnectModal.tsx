import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '../ui';
import { useWallet } from '../hooks/useWallet';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ isOpen, onClose }) => {
  const { connectWallet, isConnecting, error } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);

  const wallets = [
    {
      id: 'pera',
      name: 'Pera Wallet',
      description: 'The most popular Algorand wallet',
      icon: '🔷',
      downloadUrl: 'https://perawallet.app/',
      isInstalled: typeof window !== 'undefined' && 'algorand' in window
    },
    {
      id: 'myalgo',
      name: 'MyAlgo Wallet',
      description: 'Web-based Algorand wallet',
      icon: '🟦',
      downloadUrl: 'https://wallet.myalgo.com/',
      isInstalled: typeof window !== 'undefined' && 'MyAlgoConnect' in window
    },
    {
      id: 'defly',
      name: 'Defly Wallet',
      description: 'DeFi-focused Algorand wallet',
      icon: '🦋',
      downloadUrl: 'https://defly.app/',
      isInstalled: typeof window !== 'undefined' && 'defly' in window
    }
  ];

  const handleConnect = async (walletId: string) => {
    setSelectedWallet(walletId);
    try {
      await connectWallet(walletId);
      onClose();
    } catch (error) {
      console.error('Connection failed:', error);
      setSelectedWallet(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-neutral-800 rounded-[20px] border border-amber-900/20 p-6 w-full max-w-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-['Montserrat'] text-[20px] font-[700] text-white">
                  Connect Wallet
                </h2>
                <p className="font-['Montserrat'] text-[14px] text-white/60">
                  Choose your Algorand wallet
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-error-900/20 border border-error-600/30 rounded-lg flex items-center space-x-2"
            >
              <AlertCircle className="w-4 h-4 text-error-400 flex-shrink-0" />
              <p className="font-['Montserrat'] text-[13px] text-error-400">{error}</p>
            </motion.div>
          )}

          {/* Wallet Options */}
          <div className="space-y-3">
            {wallets.map((wallet) => (
              <motion.div
                key={wallet.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-[12px] border cursor-pointer transition-all duration-200 ${
                  wallet.isInstalled
                    ? 'border-amber-800/30 bg-neutral-700/30 hover:bg-neutral-700/50'
                    : 'border-neutral-600/30 bg-neutral-700/10 opacity-60'
                }`}
                onClick={() => wallet.isInstalled && handleConnect(wallet.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{wallet.icon}</div>
                    <div>
                      <h3 className="font-['Montserrat'] text-[16px] font-[600] text-white">
                        {wallet.name}
                      </h3>
                      <p className="font-['Montserrat'] text-[12px] text-white/60">
                        {wallet.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {wallet.isInstalled ? (
                      <>
                        {isConnecting && selectedWallet === wallet.id ? (
                          <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-success-400" />
                        )}
                      </>
                    ) : (
                      <a
                        href={wallet.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center space-x-1 text-brand-400 hover:text-brand-300 transition-colors"
                      >
                        <span className="font-['Montserrat'] text-[12px] font-[500]">Install</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Info */}
          <div className="mt-6 p-4 bg-brand-900/20 border border-brand-600/30 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-['Montserrat'] text-[13px] text-brand-400 font-[500] mb-1">
                  New to Algorand?
                </p>
                <p className="font-['Montserrat'] text-[12px] text-white/60">
                  You'll need an Algorand wallet to create and manage AI agents. 
                  We recommend Pera Wallet for beginners.
                </p>
              </div>
            </div>
          </div>

          {/* Cancel Button */}
          <div className="mt-6 flex justify-end">
            <Button
              variant="neutral-secondary"
              onClick={onClose}
              disabled={isConnecting}
            >
              Cancel
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WalletConnectModal;