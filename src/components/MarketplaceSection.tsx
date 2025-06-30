import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users,
  TrendingUp,
  Zap,
  Star,
  Search,
  Crown,
  Heart,
  Dice6,
  Eye,
  MessageCircle,
  Filter,
  SortDesc,
  ShoppingCart,
  Wallet,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X,
  ArrowUpDown,
  DollarSign,
  BarChart3,
  Clock,
  Award,
  Sparkles
} from 'lucide-react';
import { Button } from '../ui';
import { useWallet } from '../hooks/useWallet';
import { MarketplaceAgent } from '../types';

interface MarketplaceSectionProps {
  setCurrentView: (view: string) => void;
}

const MarketplaceSection: React.FC<MarketplaceSectionProps> = ({ setCurrentView }) => {
  const { isConnected, balance, formatBalance } = useWallet();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [agents, setAgents] = useState<MarketplaceAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<MarketplaceAgent | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [marketStats, setMarketStats] = useState({
    totalAgents: 0,
    totalVolume: 0,
    activeTraders: 0,
    avgRating: 0
  });

  // Mock marketplace data
  const mockAgents: MarketplaceAgent[] = [
    {
      id: 'market_1',
      name: 'Luna the Influencer',
      type: 'influencer',
      creator: 'AlgoCreator',
      avatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Fashion and lifestyle influencer with 50K+ engaged followers. Specializes in brand partnerships and content creation.',
      price: 250,
      marketCap: '125K',
      holders: 1250,
      rating: 4.8,
      interactions: 15680,
      category: 'Fashion & Lifestyle',
      tags: ['Fashion', 'Lifestyle', 'Beauty', 'Brand Partnerships'],
      verified: true
    },
    {
      id: 'market_2',
      name: 'Sage the Companion',
      type: 'companion',
      creator: 'MindfulAI',
      avatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Empathetic AI companion specializing in mental wellness and support. Perfect for meaningful conversations.',
      price: 180,
      marketCap: '89K',
      holders: 890,
      rating: 4.9,
      interactions: 12450,
      category: 'Mental Health',
      tags: ['Mental Health', 'Support', 'Meditation', 'Wellness'],
      verified: true
    },
    {
      id: 'market_3',
      name: 'Dungeon Master Zyx',
      type: 'gamemaster',
      creator: 'RPGLegends',
      avatar: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Master storyteller creating epic D&D campaigns and adventures. Brings imagination to life.',
      price: 320,
      marketCap: '156K',
      holders: 1560,
      rating: 4.7,
      interactions: 9875,
      category: 'Gaming',
      tags: ['D&D', 'Storytelling', 'RPG', 'Adventure'],
      verified: true
    },
    {
      id: 'market_4',
      name: 'Crypto Analyst Pro',
      type: 'companion',
      creator: 'BlockchainGuru',
      avatar: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Expert cryptocurrency analyst with deep knowledge of DeFi, trading strategies, and market analysis.',
      price: 420,
      marketCap: '210K',
      holders: 2100,
      rating: 4.6,
      interactions: 18750,
      category: 'Finance',
      tags: ['Crypto', 'DeFi', 'Trading', 'Analysis'],
      verified: true
    },
    {
      id: 'market_5',
      name: 'Fitness Coach Maya',
      type: 'companion',
      creator: 'HealthTech',
      avatar: 'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Personal fitness coach and nutritionist. Helps you achieve your health and fitness goals.',
      price: 150,
      marketCap: '75K',
      holders: 750,
      rating: 4.5,
      interactions: 8920,
      category: 'Health & Fitness',
      tags: ['Fitness', 'Nutrition', 'Health', 'Coaching'],
      verified: false
    },
    {
      id: 'market_6',
      name: 'Chef Italiano',
      type: 'companion',
      creator: 'CulinaryAI',
      avatar: 'https://images.pexels.com/photos/3814446/pexels-photo-3814446.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Master chef specializing in Italian cuisine. Teaches cooking techniques and shares authentic recipes.',
      price: 200,
      marketCap: '100K',
      holders: 1000,
      rating: 4.4,
      interactions: 11200,
      category: 'Culinary',
      tags: ['Cooking', 'Italian', 'Recipes', 'Culinary'],
      verified: false
    }
  ];

  useEffect(() => {
    // Simulate loading marketplace data
    const loadMarketplace = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setAgents(mockAgents);
      setMarketStats({
        totalAgents: mockAgents.length,
        totalVolume: mockAgents.reduce((sum, agent) => sum + (agent.price * agent.holders), 0),
        activeTraders: mockAgents.reduce((sum, agent) => sum + agent.holders, 0),
        avgRating: mockAgents.reduce((sum, agent) => sum + agent.rating, 0) / mockAgents.length
      });
      setLoading(false);
    };

    loadMarketplace();
  }, []);

  // Filter and sort agents
  const filteredAgents = agents
    .filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           agent.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = typeFilter === 'all' || agent.type === typeFilter;
      
      const matchesPrice = priceFilter === 'all' || 
                          (priceFilter === 'low' && agent.price < 200) ||
                          (priceFilter === 'mid' && agent.price >= 200 && agent.price <= 350) ||
                          (priceFilter === 'high' && agent.price > 350);
      
      return matchesSearch && matchesType && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'new':
          return b.interactions - a.interactions; // Using interactions as proxy for newness
        case 'popular':
        default:
          return b.holders - a.holders;
      }
    });

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'influencer':
        return <Crown className="w-5 h-5 text-brand-600" />;
      case 'companion':
        return <Heart className="w-5 h-5 text-error-600" />;
      case 'gamemaster':
        return <Dice6 className="w-5 h-5 text-success-600" />;
      default:
        return <Zap className="w-5 h-5 text-brand-600" />;
    }
  };

  const handlePurchase = async (agent: MarketplaceAgent) => {
    if (!isConnected) {
      alert('Please connect your wallet to purchase agents');
      return;
    }

    if (balance < agent.price) {
      alert(`Insufficient balance. You need ${agent.price} ALGO but only have ${formatBalance(balance)} ALGO`);
      return;
    }

    setSelectedAgent(agent);
    setShowPurchaseModal(true);
  };

  const confirmPurchase = async () => {
    if (!selectedAgent) return;

    setPurchasing(true);
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update agent holders count
      setAgents(prev => prev.map(agent => 
        agent.id === selectedAgent.id 
          ? { ...agent, holders: agent.holders + 1 }
          : agent
      ));

      setShowPurchaseModal(false);
      setSelectedAgent(null);
      
      // Show success message
      alert(`Successfully purchased ${selectedAgent.name}! The agent has been added to your collection.`);
      
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleViewDetails = (agent: MarketplaceAgent) => {
    // In a real app, this would navigate to a detailed agent page
    alert(`Viewing details for ${agent.name}\n\nCreator: ${agent.creator}\nRating: ${agent.rating}★\nHolders: ${agent.holders}\nInteractions: ${agent.interactions.toLocaleString()}`);
  };

  const handleChatWithAgent = (agent: MarketplaceAgent) => {
    // Navigate to chat with this agent
    setCurrentView('chat');
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="font-['Montserrat'] text-[20px] font-[700] text-white">
            Loading Marketplace
          </h3>
          <p className="font-['Montserrat'] text-[14px] text-white/60">
            Discovering amazing AI agents...
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
          Agent Marketplace
        </h1>
        <p className="font-['Montserrat'] text-[18px] font-[400] text-white/60 max-w-2xl mx-auto">
          Discover, invest in, and interact with AI agents created by the community
        </p>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { 
            label: 'Total Agents', 
            value: marketStats.totalAgents.toLocaleString(), 
            icon: Users, 
            color: 'text-brand-600',
            bg: 'bg-brand-900/20'
          },
          { 
            label: 'Total Volume', 
            value: `$${(marketStats.totalVolume / 1000).toFixed(1)}K`, 
            icon: TrendingUp, 
            color: 'text-success-400',
            bg: 'bg-success-900/20'
          },
          { 
            label: 'Active Traders', 
            value: marketStats.activeTraders.toLocaleString(), 
            icon: Zap, 
            color: 'text-brand-400',
            bg: 'bg-brand-900/20'
          },
          { 
            label: 'Avg Rating', 
            value: `${marketStats.avgRating.toFixed(1)}★`, 
            icon: Star, 
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

      {/* Search and Filters */}
      <div className="bg-neutral-800 rounded-[20px] border border-amber-900/20 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Search agents, creators, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-neutral-700 border border-amber-800/30 rounded-[12px] text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-brand-600 font-['Montserrat'] text-[14px]"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="text-white/40 w-4 h-4" />
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-neutral-700 border border-amber-800/30 rounded-[12px] text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-600 font-['Montserrat'] text-[14px]"
              >
                <option value="all">All Types</option>
                <option value="influencer">Social Influencer</option>
                <option value="companion">AI Companion</option>
                <option value="gamemaster">Game Master</option>
              </select>
            </div>

            <select 
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="bg-neutral-700 border border-amber-800/30 rounded-[12px] text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-600 font-['Montserrat'] text-[14px]"
            >
              <option value="all">All Prices</option>
              <option value="low">Under 200 ALGO</option>
              <option value="mid">200-350 ALGO</option>
              <option value="high">350+ ALGO</option>
            </select>

            <div className="flex items-center space-x-2">
              <SortDesc className="text-white/40 w-4 h-4" />
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-neutral-700 border border-amber-800/30 rounded-[12px] text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-600 font-['Montserrat'] text-[14px]"
              >
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="new">Newest</option>
              </select>
            </div>
          </div>
        </div>
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
                Connect Wallet to Purchase
              </h4>
              <p className="font-['Montserrat'] text-[13px] text-white/60">
                Connect your Algorand wallet to purchase and interact with AI agents from the marketplace.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Featured Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredAgents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="bg-neutral-800 rounded-[20px] border border-amber-900/20 overflow-hidden hover:border-brand-600/50 transition-all duration-300 cursor-pointer group"
            >
              <div className="relative">
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    agent.type === 'influencer' ? 'bg-brand-600' : 
                    agent.type === 'companion' ? 'bg-error-600' : 'bg-success-600'
                  }`}>
                    {getAgentIcon(agent.type)}
                  </div>
                </div>
                {agent.verified && (
                  <div className="absolute top-4 right-4 w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <h3 className="font-['Montserrat'] text-[20px] font-[700] text-white">{agent.name}</h3>
                  <p className="font-['Montserrat'] text-[14px] text-white/80">by {agent.creator}</p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <p className="font-['Montserrat'] text-[14px] text-white/80 leading-relaxed line-clamp-2">
                  {agent.description}
                </p>

                <div className="flex flex-wrap gap-1">
                  {agent.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-brand-900/20 border border-brand-600/30 rounded-lg text-xs text-brand-400 font-['Montserrat']"
                    >
                      {tag}
                    </span>
                  ))}
                  {agent.tags.length > 3 && (
                    <span className="px-2 py-1 bg-neutral-600/20 border border-neutral-500/30 rounded-lg text-xs text-neutral-400 font-['Montserrat']">
                      +{agent.tags.length - 3}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-['Montserrat'] text-[12px] text-white/60">Market Cap</span>
                    <span className="font-['Montserrat'] text-[12px] font-[600] text-white">${agent.marketCap}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-['Montserrat'] text-[12px] text-white/60">Holders</span>
                    <span className="font-['Montserrat'] text-[12px] font-[600] text-white">{agent.holders.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-['Montserrat'] text-[12px] text-white/60">Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-warning-400 fill-current" />
                      <span className="font-['Montserrat'] text-[12px] font-[600] text-white">{agent.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-['Montserrat'] text-[12px] text-white/60">Interactions</span>
                    <span className="font-['Montserrat'] text-[12px] font-[600] text-white">{agent.interactions.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-amber-900/20">
                  <div>
                    <p className="font-['Montserrat'] text-[20px] font-[700] text-white">{agent.price} ALGO</p>
                    <p className="font-['Montserrat'] text-[12px] text-white/60">Current Price</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="neutral-secondary"
                      size="small"
                      onClick={() => handleViewDetails(agent)}
                      icon={<Eye className="w-4 h-4" />}
                    />
                    <Button
                      variant="neutral-secondary"
                      size="small"
                      onClick={() => handleChatWithAgent(agent)}
                      icon={<MessageCircle className="w-4 h-4" />}
                    />
                    <Button
                      variant="brand-primary"
                      size="small"
                      onClick={() => handlePurchase(agent)}
                      disabled={!isConnected || balance < agent.price}
                      icon={<ShoppingCart className="w-4 h-4" />}
                    >
                      Buy
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* No Results */}
      {filteredAgents.length === 0 && !loading && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="font-['Montserrat'] text-[24px] font-[700] text-white mb-2">
            No agents found
          </h3>
          <p className="font-['Montserrat'] text-[16px] text-white/60 mb-6">
            Try adjusting your search criteria or filters
          </p>
          <Button
            variant="neutral-secondary"
            onClick={() => {
              setSearchTerm('');
              setTypeFilter('all');
              setPriceFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && selectedAgent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-neutral-800 rounded-[20px] border border-amber-900/20 p-6 w-full max-w-md"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-['Montserrat'] text-[20px] font-[700] text-white">
                Purchase Agent
              </h3>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-neutral-700/30 rounded-lg">
                <img
                  src={selectedAgent.avatar}
                  alt={selectedAgent.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-['Montserrat'] text-[18px] font-[600] text-white">
                    {selectedAgent.name}
                  </h4>
                  <p className="font-['Montserrat'] text-[14px] text-white/60">
                    by {selectedAgent.creator}
                  </p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Star className="w-3 h-3 text-warning-400 fill-current" />
                    <span className="font-['Montserrat'] text-[12px] text-white/80">
                      {selectedAgent.rating} ({selectedAgent.holders} holders)
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-['Montserrat'] text-[14px] text-white/60">Price</span>
                  <span className="font-['Montserrat'] text-[14px] font-[600] text-white">
                    {selectedAgent.price} ALGO
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-['Montserrat'] text-[14px] text-white/60">Your Balance</span>
                  <span className="font-['Montserrat'] text-[14px] font-[600] text-white">
                    {formatBalance(balance)} ALGO
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-['Montserrat'] text-[14px] text-white/60">Transaction Fee</span>
                  <span className="font-['Montserrat'] text-[14px] font-[600] text-white">
                    0.001 ALGO
                  </span>
                </div>
                <div className="border-t border-amber-900/20 pt-3">
                  <div className="flex justify-between">
                    <span className="font-['Montserrat'] text-[16px] font-[600] text-white">Total</span>
                    <span className="font-['Montserrat'] text-[16px] font-[700] text-white">
                      {(selectedAgent.price + 0.001).toFixed(3)} ALGO
                    </span>
                  </div>
                </div>
              </div>

              {balance < selectedAgent.price && (
                <div className="p-3 bg-error-900/20 border border-error-600/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-error-400" />
                    <span className="font-['Montserrat'] text-[13px] text-error-400">
                      Insufficient balance to complete this purchase
                    </span>
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <Button
                  variant="neutral-secondary"
                  onClick={() => setShowPurchaseModal(false)}
                  disabled={purchasing}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="brand-primary"
                  onClick={confirmPurchase}
                  disabled={purchasing || balance < selectedAgent.price}
                  icon={purchasing ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShoppingCart className="w-4 h-4" />
                  )}
                  className="flex-1"
                >
                  {purchasing ? 'Processing...' : 'Purchase'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceSection;