import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpDown,
  ChevronDown,
  RefreshCw,
  ArrowRight,
  DollarSign,
  TrendingUp,
  BarChart3,
  Clock,
  Zap,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Copy,
  Settings,
  Info,
  Wallet
} from 'lucide-react';
import { Button } from '../ui';
import { useWallet } from '../hooks/useWallet';

interface Token {
  id: string;
  symbol: string;
  name: string;
  icon: string;
  price: number;
  balance: number;
  decimals: number;
  verified: boolean;
  marketCap?: string;
  volume24h?: string;
  change24h?: number;
}

interface SwapTransaction {
  id: string;
  fromToken: string;
  toToken: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
}

interface LiquidityPool {
  id: string;
  pair: string;
  tvl: string;
  apr: number;
  volume24h: string;
  fees24h: string;
}

const TokenSwapSection: React.FC = () => {
  const { isConnected, balance, formatBalance } = useWallet();
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [showFromTokens, setShowFromTokens] = useState(false);
  const [showToTokens, setShowToTokens] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [swapTransactions, setSwapTransactions] = useState<SwapTransaction[]>([]);
  const [liquidityPools, setLiquidityPools] = useState<LiquidityPool[]>([]);
  const [marketStats, setMarketStats] = useState({
    totalVolume: 0,
    totalTVL: 0,
    activePairs: 0,
    avgAPR: 0
  });
  const [loading, setLoading] = useState(true);
  const [swapRoute, setSwapRoute] = useState<string[]>([]);
  const [priceImpact, setPriceImpact] = useState(0);

  // Mock token data
  const tokens: Token[] = [
    {
      id: 'algo',
      symbol: 'ALGO',
      name: 'Algorand',
      icon: '🔷',
      price: 0.25,
      balance: balance,
      decimals: 6,
      verified: true,
      marketCap: '$1.8B',
      volume24h: '$45M',
      change24h: 2.5
    },
    {
      id: 'usdc',
      symbol: 'USDC',
      name: 'USD Coin',
      icon: '💰',
      price: 1.00,
      balance: Math.floor(Math.random() * 5000) + 1000,
      decimals: 6,
      verified: true,
      marketCap: '$24.2B',
      volume24h: '$2.1B',
      change24h: 0.1
    },
    {
      id: 'char',
      symbol: 'CHAR',
      name: 'Character Token',
      icon: '🤖',
      price: 0.05,
      balance: Math.floor(Math.random() * 10000) + 2000,
      decimals: 6,
      verified: true,
      marketCap: '$12M',
      volume24h: '$850K',
      change24h: 8.2
    },
    {
      id: 'game',
      symbol: 'GAME',
      name: 'Game Token',
      icon: '🎮',
      price: 0.15,
      balance: Math.floor(Math.random() * 8000) + 500,
      decimals: 6,
      verified: true,
      marketCap: '$8.5M',
      volume24h: '$420K',
      change24h: -1.8
    },
    {
      id: 'defi',
      symbol: 'DEFI',
      name: 'DeFi Token',
      icon: '⚡',
      price: 0.32,
      balance: Math.floor(Math.random() * 3000) + 100,
      decimals: 6,
      verified: true,
      marketCap: '$15M',
      volume24h: '$1.2M',
      change24h: 5.7
    },
    {
      id: 'nft',
      symbol: 'NFT',
      name: 'NFT Token',
      icon: '🎨',
      price: 0.08,
      balance: Math.floor(Math.random() * 15000) + 1000,
      decimals: 6,
      verified: false,
      marketCap: '$3.2M',
      volume24h: '$180K',
      change24h: -3.2
    }
  ];

  useEffect(() => {
    // Initialize with default tokens
    setFromToken(tokens[0]); // ALGO
    setToToken(tokens[2]); // CHAR
    
    // Load mock data
    loadMarketData();
  }, []);

  useEffect(() => {
    // Calculate swap amount when input changes
    if (fromToken && toToken && fromAmount) {
      calculateSwapAmount();
    } else {
      setToAmount('');
      setSwapRoute([]);
      setPriceImpact(0);
    }
  }, [fromAmount, fromToken, toToken]);

  const loadMarketData = async () => {
    setLoading(true);
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock swap transactions
    const mockTransactions: SwapTransaction[] = [
      {
        id: '1',
        fromToken: 'ALGO',
        toToken: 'CHAR',
        fromAmount: 100,
        toAmount: 500,
        rate: 5.0,
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        status: 'completed',
        txHash: 'ABC123...DEF456'
      },
      {
        id: '2',
        fromToken: 'CHAR',
        toToken: 'USDC',
        fromAmount: 500,
        toAmount: 25,
        rate: 0.05,
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        status: 'completed',
        txHash: 'GHI789...JKL012'
      },
      {
        id: '3',
        fromToken: 'USDC',
        toToken: 'ALGO',
        fromAmount: 75,
        toAmount: 300,
        rate: 4.0,
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        status: 'completed',
        txHash: 'MNO345...PQR678'
      },
      {
        id: '4',
        fromToken: 'GAME',
        toToken: 'CHAR',
        fromAmount: 200,
        toAmount: 600,
        rate: 3.0,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      }
    ];

    // Mock liquidity pools
    const mockPools: LiquidityPool[] = [
      {
        id: '1',
        pair: 'ALGO/USDC',
        tvl: '$2.5M',
        apr: 12.5,
        volume24h: '$850K',
        fees24h: '$2.1K'
      },
      {
        id: '2',
        pair: 'CHAR/ALGO',
        tvl: '$850K',
        apr: 18.2,
        volume24h: '$420K',
        fees24h: '$1.8K'
      },
      {
        id: '3',
        pair: 'GAME/USDC',
        tvl: '$620K',
        apr: 15.7,
        volume24h: '$280K',
        fees24h: '$1.2K'
      },
      {
        id: '4',
        pair: 'CHAR/USDC',
        tvl: '$445K',
        apr: 22.1,
        volume24h: '$180K',
        fees24h: '$950'
      },
      {
        id: '5',
        pair: 'DEFI/ALGO',
        tvl: '$320K',
        apr: 28.5,
        volume24h: '$120K',
        fees24h: '$680'
      }
    ];

    setSwapTransactions(mockTransactions);
    setLiquidityPools(mockPools);
    setMarketStats({
      totalVolume: 1850000,
      totalTVL: 4735000,
      activePairs: mockPools.length,
      avgAPR: mockPools.reduce((sum, pool) => sum + pool.apr, 0) / mockPools.length
    });
    setLoading(false);
  };

  const calculateSwapAmount = () => {
    if (!fromToken || !toToken || !fromAmount) return;

    const amount = parseFloat(fromAmount);
    if (isNaN(amount) || amount <= 0) return;

    // Simple rate calculation (in real app, this would use AMM formulas)
    const rate = fromToken.price / toToken.price;
    const outputAmount = amount * rate;
    
    // Calculate price impact (simplified)
    const impact = Math.min((amount / 10000) * 100, 15); // Max 15% impact
    setPriceImpact(impact);
    
    // Apply slippage
    const finalAmount = outputAmount * (1 - slippage / 100);
    setToAmount(finalAmount.toFixed(6));
    
    // Set swap route
    setSwapRoute([fromToken.symbol, toToken.symbol]);
  };

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    
    // Swap amounts
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleMaxClick = () => {
    if (fromToken) {
      setFromAmount(fromToken.balance.toString());
    }
  };

  const handleSwap = async () => {
    if (!isConnected) {
      alert('Please connect your wallet to swap tokens');
      return;
    }

    if (!fromToken || !toToken || !fromAmount || !toAmount) {
      alert('Please enter swap amounts');
      return;
    }

    const amount = parseFloat(fromAmount);
    if (amount > fromToken.balance) {
      alert(`Insufficient ${fromToken.symbol} balance`);
      return;
    }

    setIsSwapping(true);

    try {
      // Simulate swap transaction
      await new Promise(resolve => setTimeout(resolve, 3000));

      const newTransaction: SwapTransaction = {
        id: Date.now().toString(),
        fromToken: fromToken.symbol,
        toToken: toToken.symbol,
        fromAmount: amount,
        toAmount: parseFloat(toAmount),
        rate: parseFloat(toAmount) / amount,
        timestamp: new Date().toISOString(),
        status: 'completed',
        txHash: 'TX' + Math.random().toString(36).substring(2, 15).toUpperCase()
      };

      setSwapTransactions(prev => [newTransaction, ...prev]);
      
      // Reset form
      setFromAmount('');
      setToAmount('');
      
      alert(`Successfully swapped ${amount} ${fromToken.symbol} for ${parseFloat(toAmount).toFixed(6)} ${toToken.symbol}!`);
      
    } catch (error) {
      console.error('Swap failed:', error);
      alert('Swap failed. Please try again.');
    } finally {
      setIsSwapping(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="font-['Montserrat'] text-[20px] font-[700] text-white">
            Loading Token Swap
          </h3>
          <p className="font-['Montserrat'] text-[14px] text-white/60">
            Fetching market data and liquidity pools...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="font-['Montserrat'] text-[48px] font-[900] text-white leading-[48px]">
          Token Swap
        </h1>
        <p className="font-['Montserrat'] text-[18px] font-[400] text-white/60 max-w-2xl mx-auto">
          Seamlessly swap tokens on the Algorand blockchain with optimal rates and low fees
        </p>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { 
            label: 'Total Volume (24h)', 
            value: `$${(marketStats.totalVolume / 1000000).toFixed(1)}M`, 
            icon: BarChart3, 
            color: 'text-brand-600',
            bg: 'bg-brand-900/20'
          },
          { 
            label: 'Total Value Locked', 
            value: `$${(marketStats.totalTVL / 1000000).toFixed(1)}M`, 
            icon: DollarSign, 
            color: 'text-success-400',
            bg: 'bg-success-900/20'
          },
          { 
            label: 'Active Pairs', 
            value: marketStats.activePairs, 
            icon: TrendingUp, 
            color: 'text-brand-400',
            bg: 'bg-brand-900/20'
          },
          { 
            label: 'Average APR', 
            value: `${marketStats.avgAPR.toFixed(1)}%`, 
            icon: Zap, 
            color: 'text-warning-400',
            bg: 'bg-warning-900/20'
          }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-neutral-800 rounded-[20px] border border-amber-900/20 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <div>
              <p className="font-['Montserrat'] text-[14px] font-[500] text-white/60">{stat.label}</p>
              <p className={`font-['Montserrat'] text-[28px] font-[700] ${stat.color}`}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Wallet Connection Warning */}
      {!isConnected && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-warning-900/20 border border-warning-600/30 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-['Montserrat'] text-[14px] font-[600] text-warning-400 mb-1">
                Connect Wallet to Swap
              </h4>
              <p className="font-['Montserrat'] text-[13px] text-white/60">
                Connect your Algorand wallet to start swapping tokens with optimal rates.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Swap Interface */}
        <div className="space-y-6">
          <div className="bg-neutral-800 rounded-[20px] border border-amber-900/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-['Montserrat'] text-[24px] font-[700] text-white">Swap Tokens</h3>
              <button
                onClick={() => setSlippage(slippage === 0.5 ? 1.0 : 0.5)}
                className="flex items-center space-x-2 px-3 py-1 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4 text-white/60" />
                <span className="font-['Montserrat'] text-[12px] text-white/60">
                  {slippage}% slippage
                </span>
              </button>
            </div>
            
            {/* From Token */}
            <div className="space-y-4">
              <div className="bg-neutral-700 rounded-[12px] p-4">
                <label className="font-['Montserrat'] text-[12px] font-[500] text-white/60 mb-2 block">From</label>
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    placeholder="0.0"
                    value={fromAmount}
                    onChange={(e) => setFromAmount(e.target.value)}
                    className="bg-transparent text-white text-[24px] font-[700] placeholder-white/40 outline-none flex-1"
                  />
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setShowFromTokens(true)}
                      className="flex items-center space-x-2 bg-neutral-600 hover:bg-neutral-500 rounded-lg px-3 py-2 transition-colors"
                    >
                      {fromToken ? (
                        <>
                          <span className="text-xl">{fromToken.icon}</span>
                          <span className="font-['Montserrat'] text-[16px] font-[600] text-white">{fromToken.symbol}</span>
                        </>
                      ) : (
                        <span className="font-['Montserrat'] text-[16px] font-[600] text-white">Select</span>
                      )}
                      <ChevronDown className="w-4 h-4 text-white/60" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="font-['Montserrat'] text-[12px] text-white/60">
                    Balance: {fromToken ? formatBalance(fromToken.balance) : '0'} {fromToken?.symbol}
                  </p>
                  {fromToken && (
                    <button
                      onClick={handleMaxClick}
                      className="font-['Montserrat'] text-[12px] font-[600] text-brand-400 hover:text-brand-300 transition-colors"
                    >
                      MAX
                    </button>
                  )}
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <button
                  onClick={handleSwapTokens}
                  className="w-10 h-10 bg-neutral-700 hover:bg-neutral-600 rounded-full flex items-center justify-center transition-colors"
                >
                  <ArrowUpDown className="w-5 h-5 text-white" />
                </button>
              </div>

              {/* To Token */}
              <div className="bg-neutral-700 rounded-[12px] p-4">
                <label className="font-['Montserrat'] text-[12px] font-[500] text-white/60 mb-2 block">To</label>
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    placeholder="0.0"
                    value={toAmount}
                    readOnly
                    className="bg-transparent text-white text-[24px] font-[700] placeholder-white/40 outline-none flex-1"
                  />
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setShowToTokens(true)}
                      className="flex items-center space-x-2 bg-neutral-600 hover:bg-neutral-500 rounded-lg px-3 py-2 transition-colors"
                    >
                      {toToken ? (
                        <>
                          <span className="text-xl">{toToken.icon}</span>
                          <span className="font-['Montserrat'] text-[16px] font-[600] text-white">{toToken.symbol}</span>
                        </>
                      ) : (
                        <span className="font-['Montserrat'] text-[16px] font-[600] text-white">Select</span>
                      )}
                      <ChevronDown className="w-4 h-4 text-white/60" />
                    </button>
                  </div>
                </div>
                <p className="font-['Montserrat'] text-[12px] text-white/60 mt-2">
                  Balance: {toToken ? formatBalance(toToken.balance) : '0'} {toToken?.symbol}
                </p>
              </div>

              {/* Swap Details */}
              {fromToken && toToken && fromAmount && toAmount && (
                <div className="bg-neutral-700/30 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Rate</span>
                    <span className="text-white">
                      1 {fromToken.symbol} = {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toToken.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Price Impact</span>
                    <span className={`${priceImpact > 5 ? 'text-error-400' : 'text-white'}`}>
                      {priceImpact.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Slippage Tolerance</span>
                    <span className="text-white">{slippage}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Network Fee</span>
                    <span className="text-white">0.001 ALGO</span>
                  </div>
                  {swapRoute.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/60">Route</span>
                      <span className="text-white">{swapRoute.join(' → ')}</span>
                    </div>
                  )}
                </div>
              )}

              <Button 
                variant="brand-primary" 
                className="w-full" 
                onClick={handleSwap}
                disabled={!isConnected || !fromToken || !toToken || !fromAmount || !toAmount || isSwapping}
                icon={isSwapping ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : undefined}
              >
                {isSwapping ? 'Swapping...' : !isConnected ? 'Connect Wallet' : 'Swap Tokens'}
              </Button>
            </div>
          </div>
        </div>

        {/* Market Info & Activity */}
        <div className="space-y-6">
          {/* Recent Swaps */}
          <div className="bg-neutral-800 rounded-[20px] border border-amber-900/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-['Montserrat'] text-[20px] font-[700] text-white">Recent Swaps</h3>
              <RefreshCw 
                className="w-5 h-5 text-white/60 cursor-pointer hover:text-white transition-colors" 
                onClick={loadMarketData}
              />
            </div>

            <div className="space-y-4">
              {swapTransactions.slice(0, 5).map((swap) => (
                <div key={swap.id} className="flex items-center justify-between p-4 bg-neutral-700/30 rounded-[12px]">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-['Montserrat'] text-[14px] font-[600] text-white">{swap.fromToken}</span>
                      <ArrowRight className="w-4 h-4 text-white/60" />
                      <span className="font-['Montserrat'] text-[14px] font-[600] text-white">{swap.toToken}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-['Montserrat'] text-[14px] font-[600] text-white">
                      {swap.fromAmount} → {swap.toAmount.toFixed(2)}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${
                        swap.status === 'completed' ? 'bg-success-500' : 
                        swap.status === 'pending' ? 'bg-warning-500' : 'bg-error-500'
                      }`} />
                      <span className="font-['Montserrat'] text-[12px] text-white/60">
                        {formatTimeAgo(swap.timestamp)}
                      </span>
                      {swap.txHash && (
                        <button
                          onClick={() => copyToClipboard(swap.txHash!)}
                          className="p-1 hover:bg-neutral-600 rounded transition-colors"
                        >
                          <Copy className="w-3 h-3 text-white/60" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Liquidity Pools */}
          <div className="bg-neutral-800 rounded-[20px] border border-amber-900/20 p-6">
            <h3 className="font-['Montserrat'] text-[20px] font-[700] text-white mb-4 flex items-center space-x-2">
              <DollarSign className="w-6 h-6" />
              <span>Top Liquidity Pools</span>
            </h3>
            
            <div className="space-y-3">
              {liquidityPools.map((pool) => (
                <div 
                  key={pool.id} 
                  className="flex items-center justify-between p-3 bg-neutral-700/30 rounded-[12px] hover:bg-neutral-700/50 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-['Montserrat'] text-[16px] font-[600] text-white">{pool.pair}</p>
                    <div className="flex items-center space-x-4 text-xs text-white/60">
                      <span>TVL: {pool.tvl}</span>
                      <span>Vol: {pool.volume24h}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-['Montserrat'] text-[16px] font-[600] text-success-400">{pool.apr}% APR</p>
                    <p className="font-['Montserrat'] text-[12px] text-white/60">Fees: {pool.fees24h}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Market Info */}
          <div className="bg-neutral-800 rounded-[20px] border border-amber-900/20 p-6">
            <h3 className="font-['Montserrat'] text-[20px] font-[700] text-white mb-4">Market Information</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-brand-900/20 border border-brand-600/30 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-['Montserrat'] text-[14px] font-[600] text-brand-400 mb-1">
                      About Token Swaps
                    </h4>
                    <p className="font-['Montserrat'] text-[12px] text-white/60">
                      Our DEX uses automated market makers (AMM) to provide liquidity and enable seamless token swaps 
                      with minimal slippage and competitive rates.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-neutral-700/30 rounded-lg">
                  <p className="font-['Montserrat'] text-[12px] text-white/60">Network</p>
                  <p className="font-['Montserrat'] text-[14px] font-[600] text-white">Algorand</p>
                </div>
                <div className="p-3 bg-neutral-700/30 rounded-lg">
                  <p className="font-['Montserrat'] text-[12px] text-white/60">Fee</p>
                  <p className="font-['Montserrat'] text-[14px] font-[600] text-white">0.3%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Token Selection Modals */}
      {/* From Token Modal */}
      {showFromTokens && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-neutral-800 rounded-[20px] border border-amber-900/20 p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-['Montserrat'] text-[20px] font-[700] text-white">Select Token</h3>
              <button
                onClick={() => setShowFromTokens(false)}
                className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="space-y-2">
              {tokens.map((token) => (
                <button
                  key={token.id}
                  onClick={() => {
                    setFromToken(token);
                    setShowFromTokens(false);
                  }}
                  className="w-full flex items-center justify-between p-4 hover:bg-neutral-700/50 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{token.icon}</span>
                    <div className="text-left">
                      <div className="flex items-center space-x-2">
                        <span className="font-['Montserrat'] text-[16px] font-[600] text-white">{token.symbol}</span>
                        {token.verified && <CheckCircle className="w-4 h-4 text-success-400" />}
                      </div>
                      <span className="font-['Montserrat'] text-[12px] text-white/60">{token.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-['Montserrat'] text-[14px] font-[600] text-white">
                      {formatBalance(token.balance)}
                    </p>
                    <p className="font-['Montserrat'] text-[12px] text-white/60">
                      ${token.price.toFixed(3)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* To Token Modal */}
      {showToTokens && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-neutral-800 rounded-[20px] border border-amber-900/20 p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-['Montserrat'] text-[20px] font-[700] text-white">Select Token</h3>
              <button
                onClick={() => setShowToTokens(false)}
                className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="space-y-2">
              {tokens.filter(token => token.id !== fromToken?.id).map((token) => (
                <button
                  key={token.id}
                  onClick={() => {
                    setToToken(token);
                    setShowToTokens(false);
                  }}
                  className="w-full flex items-center justify-between p-4 hover:bg-neutral-700/50 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{token.icon}</span>
                    <div className="text-left">
                      <div className="flex items-center space-x-2">
                        <span className="font-['Montserrat'] text-[16px] font-[600] text-white">{token.symbol}</span>
                        {token.verified && <CheckCircle className="w-4 h-4 text-success-400" />}
                      </div>
                      <span className="font-['Montserrat'] text-[12px] text-white/60">{token.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-['Montserrat'] text-[14px] font-[600] text-white">
                      {formatBalance(token.balance)}
                    </p>
                    <p className="font-['Montserrat'] text-[12px] text-white/60">
                      ${token.price.toFixed(3)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TokenSwapSection;