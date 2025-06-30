import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, AlertCircle, CheckCircle, ExternalLink, Smartphone, Monitor, QrCode, ArrowLeft } from 'lucide-react';
import { Button } from '../ui';
import { useWallet } from '../hooks/useWallet';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WalletConnectModal: React.FC<WalletConnectModalProps> = ({ isOpen, onClose }) => {
  const { connectWallet, cancelQRConnection, isConnecting, error, qrCode } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  const [connectionMethod, setConnectionMethod] = useState<'extension' | 'mobile' | null>(null);
  const [showMethodSelection, setShowMethodSelection] = useState(false);

  const wallets = [
    {
      id: 'pera',
      name: 'Pera Wallet',
      description: 'The most popular Algorand wallet',
      icon: '🔷',
      downloadUrl: 'https://perawallet.app/',
      isInstalled: typeof window !== 'undefined' && 'algorand' in window,
      supportsMobile: true
    },
    {
      id: 'myalgo',
      name: 'MyAlgo Wallet',
      description: 'Web-based Algorand wallet',
      icon: '🟦',
      downloadUrl: 'https://wallet.myalgo.com/',
      isInstalled: typeof window !== 'undefined' && 'MyAlgoConnect' in window,
      supportsMobile: false
    },
    {
      id: 'defly',
      name: 'Defly Wallet',
      description: 'DeFi-focused Algorand wallet',
      icon: '🦋',
      downloadUrl: 'https://defly.app/',
      isInstalled: typeof window !== 'undefined' && 'defly' in window,
      supportsMobile: true
    }
  ];

  const handleWalletSelect = (walletId: string) => {
    const wallet = wallets.find(w => w.id === walletId);
    if (!wallet) return;

    setSelectedWallet(walletId);

    // If wallet supports mobile and is not installed, show method selection
    if (wallet.supportsMobile && !wallet.isInstalled) {
      setShowMethodSelection(true);
    } else if (wallet.isInstalled) {
      // If installed, show method selection for supported wallets
      if (wallet.supportsMobile) {
        setShowMethodSelection(true);
      } else {
        // Connect directly with extension
        handleConnect(walletId, 'extension');
      }
    }
  };

  const handleConnect = async (walletId: string, method: 'extension' | 'mobile') => {
    setConnectionMethod(method);
    setShowMethodSelection(false);
    
    try {
      await connectWallet(walletId, method);
      if (!qrCode) {
        onClose();
      }
    } catch (error) {
      console.error('Connection failed:', error);
      setSelectedWallet(null);
      setConnectionMethod(null);
    }
  };

  const handleCancel = () => {
    if (qrCode) {
      cancelQRConnection();
    }
    setSelectedWallet(null);
    setConnectionMethod(null);
    setShowMethodSelection(false);
  };

  const handleClose = () => {
    handleCancel();
    onClose();
  };

  const handleBack = () => {
    setShowMethodSelection(false);
    setSelectedWallet(null);
    setConnectionMethod(null);
  };

  if (!isOpen) return null;

  const selectedWalletInfo = wallets.find(w => w.id === selectedWallet);

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
              {showMethodSelection && (
                <button
                  onClick={handleBack}
                  className="p-1 hover:bg-neutral-700 rounded-lg transition-colors mr-2"
                >
                  <ArrowLeft className="w-4 h-4 text-white/60" />
                </button>
              )}
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-['Montserrat'] text-[20px] font-[700] text-white">
                  {showMethodSelection ? 'Connection Method' : 'Connect Wallet'}
                </h2>
                <p className="font-['Montserrat'] text-[14px] text-white/60">
                  {showMethodSelection 
                    ? `Choose how to connect ${selectedWalletInfo?.name}`
                    : 'Choose your Algorand wallet'
                  }
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
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

          {/* QR Code Display */}
          {qrCode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4"
            >
              <div className="w-64 h-64 mx-auto bg-white rounded-lg p-4 flex items-center justify-center">
                <img src={qrCode} alt="QR Code" className="w-full h-full" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-['Montserrat'] text-[18px] font-[600] text-white">
                  Scan with {selectedWalletInfo?.name}
                </h3>
                <p className="font-['Montserrat'] text-[14px] text-white/60">
                  Open {selectedWalletInfo?.name} on your mobile device and scan this QR code to connect
                </p>
              </div>

              <div className="flex items-center justify-center space-x-2 text-brand-400">
                <div className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
                <span className="font-['Montserrat'] text-[14px] font-[500]">
                  Waiting for connection...
                </span>
              </div>

              <Button
                variant="neutral-secondary"
                onClick={handleCancel}
                className="w-full"
              >
                Cancel
              </Button>
            </motion.div>
          )}

          {/* Method Selection */}
          {showMethodSelection && !qrCode && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-3"
            >
              {/* Extension Method */}
              {selectedWalletInfo?.isInstalled && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleConnect(selectedWallet!, 'extension')}
                  className="p-4 rounded-[12px] border border-amber-800/30 bg-neutral-700/30 hover:bg-neutral-700/50 cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-['Montserrat'] text-[16px] font-[600] text-white">
                          Browser Extension
                        </h3>
                        <p className="font-['Montserrat'] text-[12px] text-white/60">
                          Connect using the installed browser extension
                        </p>
                      </div>
                    </div>
                    {isConnecting && connectionMethod === 'extension' ? (
                      <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-success-400" />
                    )}
                  </div>
                </motion.div>
              )}

              {/* Mobile Method */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleConnect(selectedWallet!, 'mobile')}
                className="p-4 rounded-[12px] border border-amber-800/30 bg-neutral-700/30 hover:bg-neutral-700/50 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                      <QrCode className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-['Montserrat'] text-[16px] font-[600] text-white">
                        Mobile App (QR Code)
                      </h3>
                      <p className="font-['Montserrat'] text-[12px] text-white/60">
                        Scan QR code with your mobile wallet app
                      </p>
                    </div>
                  </div>
                  {isConnecting && connectionMethod === 'mobile' ? (
                    <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Smartphone className="w-5 h-5 text-brand-400" />
                  )}
                </div>
              </motion.div>

              {/* Download Link for Mobile */}
              {!selectedWalletInfo?.isInstalled && (
                <div className="mt-4 p-3 bg-brand-900/20 border border-brand-600/30 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Smartphone className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-['Montserrat'] text-[13px] text-brand-400 font-[500] mb-1">
                        Don't have {selectedWalletInfo?.name}?
                      </p>
                      <a
                        href={selectedWalletInfo?.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-['Montserrat'] text-[12px] text-white/60 hover:text-white transition-colors flex items-center space-x-1"
                      >
                        <span>Download from App Store or Google Play</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Wallet Selection */}
          {!showMethodSelection && !qrCode && (
            <div className="space-y-3">
              {wallets.map((wallet) => (
                <motion.div
                  key={wallet.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-[12px] border cursor-pointer transition-all duration-200 ${
                    wallet.isInstalled || wallet.supportsMobile
                      ? 'border-amber-800/30 bg-neutral-700/30 hover:bg-neutral-700/50'
                      : 'border-neutral-600/30 bg-neutral-700/10 opacity-60'
                  }`}
                  onClick={() => (wallet.isInstalled || wallet.supportsMobile) && handleWalletSelect(wallet.id)}
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
                      {wallet.isInstalled || wallet.supportsMobile ? (
                        <>
                          {isConnecting && selectedWallet === wallet.id ? (
                            <div className="w-5 h-5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <div className="flex items-center space-x-1">
                              {wallet.isInstalled && (
                                <div className="w-6 h-6 bg-success-600 rounded-full flex items-center justify-center">
                                  <Monitor className="w-3 h-3 text-white" />
                                </div>
                              )}
                              {wallet.supportsMobile && (
                                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                                  <Smartphone className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
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
          )}

          {/* Info */}
          {!showMethodSelection && !qrCode && (
            <div className="mt-6 p-4 bg-brand-900/20 border border-brand-600/30 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-['Montserrat'] text-[13px] text-brand-400 font-[500] mb-1">
                    New to Algorand?
                  </p>
                  <p className="font-['Montserrat'] text-[12px] text-white/60">
                    You'll need an Algorand wallet to create and manage AI agents. 
                    We recommend Pera Wallet for beginners. You can use either the browser extension or mobile app.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cancel Button */}
          {!qrCode && (
            <div className="mt-6 flex justify-end">
              <Button
                variant="neutral-secondary"
                onClick={handleClose}
                disabled={isConnecting}
              >
                Cancel
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WalletConnectModal;