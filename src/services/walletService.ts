interface WalletAccount {
  address: string;
  name?: string;
}

interface WalletInfo {
  id: string;
  name: string;
  icon: string;
  isInstalled: boolean;
}

export interface WalletState {
  isConnected: boolean;
  account: WalletAccount | null;
  balance: number;
  isConnecting: boolean;
  error: string | null;
}

class WalletService {
  private static instance: WalletService;
  private listeners: ((state: WalletState) => void)[] = [];
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
        isInstalled: this.isPeraWalletInstalled()
      },
      {
        id: 'myalgo',
        name: 'MyAlgo Wallet',
        icon: '🟦',
        isInstalled: this.isMyAlgoWalletInstalled()
      },
      {
        id: 'defly',
        name: 'Defly Wallet',
        icon: '🦋',
        isInstalled: this.isDeflyWalletInstalled()
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

  // Connect to wallet
  async connectWallet(walletId: string): Promise<void> {
    this.updateState({ isConnecting: true, error: null });

    try {
      switch (walletId) {
        case 'pera':
          await this.connectPeraWallet();
          break;
        case 'myalgo':
          await this.connectMyAlgoWallet();
          break;
        case 'defly':
          await this.connectDeflyWallet();
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
        account: null 
      });
      throw error;
    }
  }

  // Connect Pera Wallet
  private async connectPeraWallet(): Promise<void> {
    if (!this.isPeraWalletInstalled()) {
      throw new Error('Pera Wallet is not installed. Please install it from the browser extension store.');
    }

    try {
      // For demo purposes, we'll simulate the connection
      // In a real implementation, you would use the actual Pera Wallet SDK
      const mockAccount = {
        address: 'ALGORAND' + Math.random().toString(36).substring(2, 15).toUpperCase(),
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
        error: null
      });

      // Store connection in localStorage
      localStorage.setItem('walletConnection', JSON.stringify({
        walletId: 'pera',
        account: mockAccount,
        timestamp: Date.now()
      }));

    } catch (error) {
      throw new Error('Failed to connect to Pera Wallet');
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
        error: null
      });

      localStorage.setItem('walletConnection', JSON.stringify({
        walletId: 'myalgo',
        account: mockAccount,
        timestamp: Date.now()
      }));

    } catch (error) {
      throw new Error('Failed to connect to MyAlgo Wallet');
    }
  }

  // Connect Defly Wallet
  private async connectDeflyWallet(): Promise<void> {
    if (!this.isDeflyWalletInstalled()) {
      throw new Error('Defly Wallet is not installed. Please install it from defly.app');
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
        error: null
      });

      localStorage.setItem('walletConnection', JSON.stringify({
        walletId: 'defly',
        account: mockAccount,
        timestamp: Date.now()
      }));

    } catch (error) {
      throw new Error('Failed to connect to Defly Wallet');
    }
  }

  // Disconnect wallet
  async disconnectWallet(): Promise<void> {
    this.updateState({
      isConnected: false,
      account: null,
      balance: 0,
      isConnecting: false,
      error: null
    });

    // Clear stored connection
    localStorage.removeItem('walletConnection');
  }

  // Restore connection from localStorage
  async restoreConnection(): Promise<void> {
    try {
      const stored = localStorage.getItem('walletConnection');
      if (!stored) return;

      const { walletId, account, timestamp } = JSON.parse(stored);
      
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
        error: null
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