interface WalletAccount {
  address: string;
  name?: string;
}

interface WalletInfo {
  id: string;
  name: string;
  icon: string;
  isInstalled: boolean;
  supportsMobile?: boolean;
}

export interface WalletState {
  isConnected: boolean;
  account: WalletAccount | null;
  balance: number;
  isConnecting: boolean;
  error: string | null;
  qrCode?: string;
  connectionMethod?: 'extension' | 'mobile';
}

interface PeraConnectionData {
  bridge: string;
  key: string;
  deepLink: string;
}

class WalletService {
  private static instance: WalletService;
  private listeners: ((state: WalletState) => void)[] = [];
  private connectionTimeout: NodeJS.Timeout | null = null;
  private state: WalletState = {
    isConnected: false,
    account: null,
    balance: 0,
    isConnecting: false,
    error: null
  };

  static getInstance(): WalletService {
    if (!WalletService.instance) {
      WalletService.instance = new WalletService();
    }
    return WalletService.instance;
  }

  // Subscribe to wallet state changes
  subscribe(listener: (state: WalletState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of state changes
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Update state and notify listeners
  private updateState(updates: Partial<WalletState>) {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  // Get current state
  getState(): WalletState {
    return this.state;
  }

  // Get available wallets
  getAvailableWallets(): WalletInfo[] {
    const wallets: WalletInfo[] = [
      {
        id: 'pera',
        name: 'Pera Wallet',
        icon: '🔷',
        isInstalled: this.isPeraWalletInstalled(),
        supportsMobile: true
      },
      {
        id: 'myalgo',
        name: 'MyAlgo Wallet',
        icon: '🟦',
        isInstalled: this.isMyAlgoWalletInstalled(),
        supportsMobile: false
      },
      {
        id: 'defly',
        name: 'Defly Wallet',
        icon: '🦋',
        isInstalled: this.isDeflyWalletInstalled(),
        supportsMobile: true
      }
    ];

    return wallets;
  }

  // Check if Pera Wallet is installed
  private isPeraWalletInstalled(): boolean {
    return typeof window !== 'undefined' && 'algorand' in window;
  }

  // Check if MyAlgo Wallet is installed
  private isMyAlgoWalletInstalled(): boolean {
    return typeof window !== 'undefined' && 'MyAlgoConnect' in window;
  }

  // Check if Defly Wallet is installed
  private isDeflyWalletInstalled(): boolean {
    return typeof window !== 'undefined' && 'defly' in window;
  }

  // Generate QR code data for Pera Wallet connection
  private generatePeraConnectionData(): PeraConnectionData {
    const sessionId = crypto.randomUUID();
    const bridge = 'https://bridge.walletconnect.org';
    const key = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const connectionData = {
      bridge,
      key,
      sessionId,
      version: 1,
      clientId: crypto.randomUUID(),
      clientMeta: {
        description: 'Algo Agent - Decentralized AI Agent Launchpad',
        url: window.location.origin,
        icons: [`${window.location.origin}/favicon.ico`],
        name: 'Algo Agent'
      }
    };

    const encodedData = encodeURIComponent(JSON.stringify(connectionData));
    const deepLink = `algorand-wc://wc?uri=${encodedData}`;

    return {
      bridge,
      key,
      deepLink
    };
  }

  // Connect to wallet
  async connectWallet(walletId: string, method: 'extension' | 'mobile' = 'extension'): Promise<void> {
    this.updateState({ isConnecting: true, error: null, connectionMethod: method });

    try {
      switch (walletId) {
        case 'pera':
          if (method === 'mobile') {
            await this.connectPeraWalletMobile();
          } else {
            await this.connectPeraWallet();
          }
          break;
        case 'myalgo':
          await this.connectMyAlgoWallet();
          break;
        case 'defly':
          if (method === 'mobile') {
            await this.connectDeflyWalletMobile();
          } else {
            await this.connectDeflyWallet();
          }
          break;
        default:
          throw new Error(`Unsupported wallet: ${walletId}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      this.updateState({ 
        isConnecting: false, 
        error: errorMessage,
        isConnected: false,
        account: null,
        qrCode: undefined
      });
      throw error;
    }
  }

  // Connect Pera Wallet via extension
  private async connectPeraWallet(): Promise<void> {
    if (!this.isPeraWalletInstalled()) {
      throw new Error('Pera Wallet extension is not installed. Please install it from the browser extension store or use mobile connection.');
    }

    try {
      // For demo purposes, we'll simulate the connection
      // In a real implementation, you would use the actual Pera Wallet SDK
      const mockAccount = {
        address: 'PERA' + Math.random().toString(36).substring(2, 15).toUpperCase() + 'ALGO',
        name: 'Pera Account'
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simulate getting balance
      const mockBalance = Math.floor(Math.random() * 10000) + 1000;

      this.updateState({
        isConnected: true,
        account: mockAccount,
        balance: mockBalance,
        isConnecting: false,
        error: null,
        qrCode: undefined,
        connectionMethod: 'extension'
      });

      // Store connection in localStorage
      localStorage.setItem('walletConnection', JSON.stringify({
        walletId: 'pera',
        method: 'extension',
        account: mockAccount,
        timestamp: Date.now()
      }));

    } catch (error) {
      throw new Error('Failed to connect to Pera Wallet extension');
    }
  }

  // Connect Pera Wallet via mobile QR code
  private async connectPeraWalletMobile(): Promise<void> {
    try {
      // Generate connection data and QR code
      const connectionData = this.generatePeraConnectionData();
      
      // Import QR code library dynamically
      const QRCode = (await import('qrcode')).default;
      const qrCodeDataUrl = await QRCode.toDataURL(connectionData.deepLink, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      this.updateState({
        qrCode: qrCodeDataUrl,
        isConnecting: true
      });

      // Set up connection timeout (2 minutes)
      this.connectionTimeout = setTimeout(() => {
        this.updateState({
          isConnecting: false,
          error: 'Connection timeout. Please try again.',
          qrCode: undefined
        });
      }, 120000);

      // Simulate mobile wallet connection after QR scan
      // In a real implementation, this would be handled by WalletConnect protocol
      setTimeout(async () => {
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }

        const mockAccount = {
          address: 'PERA' + Math.random().toString(36).substring(2, 15).toUpperCase() + 'MOBILE',
          name: 'Pera Mobile Account'
        };

        const mockBalance = Math.floor(Math.random() * 15000) + 2000;

        this.updateState({
          isConnected: true,
          account: mockAccount,
          balance: mockBalance,
          isConnecting: false,
          error: null,
          qrCode: undefined,
          connectionMethod: 'mobile'
        });

        // Store connection in localStorage
        localStorage.setItem('walletConnection', JSON.stringify({
          walletId: 'pera',
          method: 'mobile',
          account: mockAccount,
          timestamp: Date.now()
        }));
      }, 8000); // Simulate 8 second delay for QR scan and approval

    } catch (error) {
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
        this.connectionTimeout = null;
      }
      throw new Error('Failed to generate QR code for Pera Wallet mobile connection');
    }
  }

  // Connect MyAlgo Wallet
  private async connectMyAlgoWallet(): Promise<void> {
    if (!this.isMyAlgoWalletInstalled()) {
      throw new Error('MyAlgo Wallet is not installed. Please install it from myalgo.com');
    }

    try {
      // Simulate connection for demo
      const mockAccount = {
        address: 'MYALGO' + Math.random().toString(36).substring(2, 15).toUpperCase(),
        name: 'MyAlgo Account'
      };

      await new Promise(resolve => setTimeout(resolve, 1200));
      const mockBalance = Math.floor(Math.random() * 8000) + 500;

      this.updateState({
        isConnected: true,
        account: mockAccount,
        balance: mockBalance,
        isConnecting: false,
        error: null,
        connectionMethod: 'extension'
      });

      localStorage.setItem('walletConnection', JSON.stringify({
        walletId: 'myalgo',
        method: 'extension',
        account: mockAccount,
        timestamp: Date.now()
      }));

    } catch (error) {
      throw new Error('Failed to connect to MyAlgo Wallet');
    }
  }

  // Connect Defly Wallet via extension
  private async connectDeflyWallet(): Promise<void> {
    if (!this.isDeflyWalletInstalled()) {
      throw new Error('Defly Wallet extension is not installed. Please install it from defly.app or use mobile connection.');
    }

    try {
      // Simulate connection for demo
      const mockAccount = {
        address: 'DEFLY' + Math.random().toString(36).substring(2, 15).toUpperCase(),
        name: 'Defly Account'
      };

      await new Promise(resolve => setTimeout(resolve, 1000));
      const mockBalance = Math.floor(Math.random() * 15000) + 2000;

      this.updateState({
        isConnected: true,
        account: mockAccount,
        balance: mockBalance,
        isConnecting: false,
        error: null,
        connectionMethod: 'extension'
      });

      localStorage.setItem('walletConnection', JSON.stringify({
        walletId: 'defly',
        method: 'extension',
        account: mockAccount,
        timestamp: Date.now()
      }));

    } catch (error) {
      throw new Error('Failed to connect to Defly Wallet extension');
    }
  }

  // Connect Defly Wallet via mobile
  private async connectDeflyWalletMobile(): Promise<void> {
    try {
      // Generate QR code for Defly mobile connection
      const connectionData = {
        action: 'connect',
        dapp: 'Algo Agent',
        url: window.location.origin,
        sessionId: crypto.randomUUID()
      };

      const QRCode = (await import('qrcode')).default;
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(connectionData), {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      this.updateState({
        qrCode: qrCodeDataUrl,
        isConnecting: true
      });

      // Simulate mobile connection
      setTimeout(async () => {
        const mockAccount = {
          address: 'DEFLY' + Math.random().toString(36).substring(2, 15).toUpperCase() + 'MOBILE',
          name: 'Defly Mobile Account'
        };

        const mockBalance = Math.floor(Math.random() * 12000) + 1500;

        this.updateState({
          isConnected: true,
          account: mockAccount,
          balance: mockBalance,
          isConnecting: false,
          error: null,
          qrCode: undefined,
          connectionMethod: 'mobile'
        });

        localStorage.setItem('walletConnection', JSON.stringify({
          walletId: 'defly',
          method: 'mobile',
          account: mockAccount,
          timestamp: Date.now()
        }));
      }, 6000);

    } catch (error) {
      throw new Error('Failed to generate QR code for Defly Wallet mobile connection');
    }
  }

  // Cancel QR code connection
  cancelQRConnection(): void {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    this.updateState({
      isConnecting: false,
      qrCode: undefined,
      error: null
    });
  }

  // Disconnect wallet
  async disconnectWallet(): Promise<void> {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    this.updateState({
      isConnected: false,
      account: null,
      balance: 0,
      isConnecting: false,
      error: null,
      qrCode: undefined,
      connectionMethod: undefined
    });

    // Clear stored connection
    localStorage.removeItem('walletConnection');
  }

  // Restore connection from localStorage
  async restoreConnection(): Promise<void> {
    try {
      const stored = localStorage.getItem('walletConnection');
      if (!stored) return;

      const { walletId, method, account, timestamp } = JSON.parse(stored);
      
      // Check if connection is less than 24 hours old
      const isRecent = Date.now() - timestamp < 24 * 60 * 60 * 1000;
      if (!isRecent) {
        localStorage.removeItem('walletConnection');
        return;
      }

      // Simulate balance refresh
      const mockBalance = Math.floor(Math.random() * 12000) + 1000;

      this.updateState({
        isConnected: true,
        account,
        balance: mockBalance,
        isConnecting: false,
        error: null,
        connectionMethod: method
      });

    } catch (error) {
      console.error('Failed to restore wallet connection:', error);
      localStorage.removeItem('walletConnection');
    }
  }

  // Refresh balance
  async refreshBalance(): Promise<void> {
    if (!this.state.isConnected || !this.state.account) {
      throw new Error('No wallet connected');
    }

    try {
      // Simulate balance refresh
      await new Promise(resolve => setTimeout(resolve, 500));
      const newBalance = Math.floor(Math.random() * 15000) + 1000;
      
      this.updateState({ balance: newBalance });
    } catch (error) {
      throw new Error('Failed to refresh balance');
    }
  }

  // Format address for display
  formatAddress(address: string): string {
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  // Format balance for display
  formatBalance(balance: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(balance);
  }
}

export const walletService = WalletService.getInstance();