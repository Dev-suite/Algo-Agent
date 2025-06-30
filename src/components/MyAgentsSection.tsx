import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  TrendingUp,
  Search,
  Filter,
  SortDesc,
  MessageCircle,
  Settings,
  Bot,
  Crown,
  Heart,
  Dice6,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  Play,
  Pause,
  BarChart3,
  Zap,
  Users,
  Clock
} from 'lucide-react';
import { Button } from '../ui';
import { Character } from '../types';
import { useCharacters } from '../hooks/useCharacters';
import AgentSettingsModal from './AgentSettingsModal';

interface MyAgentsSectionProps {
  characters: Character[];
  setCurrentView: (view: string) => void;
}

const MyAgentsSection: React.FC<MyAgentsSectionProps> = ({
  characters,
  setCurrentView
}) => {
  const { updateCharacter, deleteCharacter } = useCharacters();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedAgent, setSelectedAgent] = useState<Character | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(null);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Filter and sort characters
  const filteredCharacters = characters
    .filter(character => {
      const matchesSearch = character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           character.personality.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || character.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'level':
          return b.level - a.level;
        case 'winRate':
          return b.winRate - a.winRate;
        case 'lastActivity':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  const getAgentIcon = (agentType?: string) => {
    switch (agentType) {
      case 'influencer':
        return <Crown className="w-5 h-5 text-brand-600" />;
      case 'companion':
        return <Heart className="w-5 h-5 text-error-600" />;
      case 'gamemaster':
        return <Dice6 className="w-5 h-5 text-success-600" />;
      default:
        return <Bot className="w-5 h-5 text-brand-600" />;
    }
  };

  const getStatusColor = (status: Character['status']) => {
    switch (status) {
      case 'active':
        return 'bg-success-900/20 text-success-400';
      case 'training':
        return 'bg-warning-900/20 text-warning-400';
      case 'idle':
        return 'bg-neutral-900/20 text-neutral-400';
      case 'offline':
        return 'bg-error-900/20 text-error-400';
      default:
        return 'bg-neutral-900/20 text-neutral-400';
    }
  };

  const handleStatusToggle = async (character: Character) => {
    const newStatus = character.status === 'active' ? 'idle' : 'active';
    await updateCharacter(character.id, { 
      status: newStatus,
      lastActivity: newStatus === 'active' ? 'Just activated' : 'Just deactivated'
    });
    setShowDropdown(null);
  };

  const handleDeleteAgent = async (character: Character) => {
    if (window.confirm(`Are you sure you want to delete ${character.name}? This action cannot be undone.`)) {
      await deleteCharacter(character.id);
    }
    setShowDropdown(null);
  };

  const handleSettingsClick = (character: Character) => {
    setSelectedAgent(character);
    setShowSettingsModal(true);
    setShowDropdown(null);
  };

  const handleSaveSettings = async (updates: Partial<Character>) => {
    if (selectedAgent) {
      await updateCharacter(selectedAgent.id, updates);
      setShowSettingsModal(false);
      setSelectedAgent(null);
    }
  };

  const handleDropdownToggle = (characterId: string) => {
    setShowDropdown(showDropdown === characterId ? null : characterId);
  };

  const stats = [
    { 
      label: 'Total Agents', 
      value: characters.length, 
      color: 'text-brand-600',
      icon: Bot,
      bg: 'bg-brand-900/20'
    },
    { 
      label: 'Active Agents', 
      value: characters.filter(c => c.status === 'active').length, 
      color: 'text-success-400',
      icon: Zap,
      bg: 'bg-success-900/20'
    },
    { 
      label: 'Total Interactions', 
      value: characters.reduce((sum, c) => sum + c.gamesPlayed, 0), 
      color: 'text-brand-400',
      icon: Users,
      bg: 'bg-brand-900/20'
    },
    { 
      label: 'Avg Performance', 
      value: `${(characters.reduce((sum, c) => sum + c.winRate, 0) / characters.length || 0).toFixed(1)}%`, 
      color: 'text-warning-400',
      icon: TrendingUp,
      bg: 'bg-warning-900/20'
    }
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="font-['Montserrat'] text-[32px] sm:text-[40px] lg:text-[48px] font-[900] text-white leading-[1.1]">
            My AI Agents
          </h1>
          <p className="font-['Montserrat'] text-[16px] sm:text-[18px] font-[400] text-white/60 mt-2">
            Manage and interact with your deployed AI agents
          </p>
        </div>
        
        <Button
          variant="brand-primary"
          size={window.innerWidth < 640 ? "medium" : "large"}
          onClick={() => setCurrentView('create')}
          icon={<Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
          className="w-full sm:w-auto"
        >
          <span className="hidden sm:inline">Create New Agent</span>
          <span className="sm:hidden">Create Agent</span>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-neutral-800 rounded-[16px] sm:rounded-[20px] border border-amber-900/20 p-4 sm:p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 ${stat.bg} rounded-lg sm:rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
              </div>
            </div>
            <div>
              <p className="font-['Montserrat'] text-[12px] sm:text-[14px] font-[500] text-white/60 mb-1">
                {stat.label}
              </p>
              <p className="font-['Montserrat'] text-[24px] sm:text-[28px] font-[700] text-white">
                {stat.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="bg-neutral-800 rounded-[16px] sm:rounded-[20px] border border-amber-900/20 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-neutral-700 border border-amber-800/30 rounded-[12px] text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-brand-600 font-['Montserrat'] text-[14px]"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Filter className="text-white/40 w-4 h-4 sm:w-5 sm:h-5" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-neutral-700 border border-amber-800/30 rounded-[12px] text-white px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:ring-2 focus:ring-brand-600 font-['Montserrat'] text-[13px] sm:text-[14px]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="idle">Idle</option>
              <option value="training">Training</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <SortDesc className="text-white/40 w-4 h-4 sm:w-5 sm:h-5" />
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-neutral-700 border border-amber-800/30 rounded-[12px] text-white px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:ring-2 focus:ring-brand-600 font-['Montserrat'] text-[13px] sm:text-[14px]"
            >
              <option value="name">Sort by Name</option>
              <option value="level">Sort by Level</option>
              <option value="winRate">Sort by Performance</option>
              <option value="lastActivity">Sort by Activity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        <AnimatePresence>
          {filteredCharacters.map((character, index) => (
            <motion.div
              key={character.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className="relative group bg-neutral-800 rounded-[16px] sm:rounded-[20px] border border-amber-900/20 overflow-hidden hover:border-brand-600/50 transition-all duration-300"
            >
              {/* Agent Header */}
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4 mb-4">
                  <div className="relative">
                    <img
                      src={character.avatar}
                      alt={character.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-[10px] sm:rounded-[12px] object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1">
                      {getAgentIcon(character.agentType)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-['Montserrat'] text-[16px] sm:text-[20px] font-[700] text-white truncate">
                      {character.name}
                    </h3>
                    <p className="font-['Montserrat'] text-[12px] sm:text-[14px] font-[400] text-white/60 truncate">
                      {character.agentType ? character.agentType.charAt(0).toUpperCase() + character.agentType.slice(1) : 'Agent'}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium ${getStatusColor(character.status)}`}>
                      {character.status}
                    </div>
                    
                    {/* More Options */}
                    <div className="relative" ref={showDropdown === character.id ? dropdownRef : null}>
                      <button
                        onClick={() => handleDropdownToggle(character.id)}
                        className="p-1 hover:bg-neutral-700 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-white/60" />
                      </button>
                      
                      <AnimatePresence>
                        {showDropdown === character.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-1 w-48 bg-neutral-700 border border-amber-800/30 rounded-lg shadow-lg z-50"
                          >
                            <div className="py-1">
                              <button
                                onClick={() => handleSettingsClick(character)}
                                className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-neutral-600 transition-colors text-left"
                              >
                                <Settings className="w-4 h-4 text-white/60" />
                                <span className="font-['Montserrat'] text-[14px] text-white">Settings</span>
                              </button>
                              
                              <button
                                onClick={() => setCurrentView('chat')}
                                className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-neutral-600 transition-colors text-left"
                              >
                                <MessageCircle className="w-4 h-4 text-white/60" />
                                <span className="font-['Montserrat'] text-[14px] text-white">Chat</span>
                              </button>
                              
                              <button
                                onClick={() => handleStatusToggle(character)}
                                className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-neutral-600 transition-colors text-left"
                              >
                                {character.status === 'active' ? (
                                  <>
                                    <Pause className="w-4 h-4 text-white/60" />
                                    <span className="font-['Montserrat'] text-[14px] text-white">Deactivate</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-4 h-4 text-white/60" />
                                    <span className="font-['Montserrat'] text-[14px] text-white">Activate</span>
                                  </>
                                )}
                              </button>
                              
                              <div className="border-t border-amber-800/20 my-1" />
                              
                              <button
                                onClick={() => handleDeleteAgent(character)}
                                className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-error-900/20 transition-colors text-left text-error-400"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span className="font-['Montserrat'] text-[14px]">Delete</span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Agent Stats */}
                <div className="space-y-2 sm:space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="font-['Montserrat'] text-[12px] sm:text-[14px] font-[500] text-white/60">Level</span>
                    <span className="font-['Montserrat'] text-[12px] sm:text-[14px] font-[600] text-white">{character.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-['Montserrat'] text-[12px] sm:text-[14px] font-[500] text-white/60">Interactions</span>
                    <span className="font-['Montserrat'] text-[12px] sm:text-[14px] font-[600] text-white">{character.gamesPlayed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-['Montserrat'] text-[12px] sm:text-[14px] font-[500] text-white/60">Win Rate</span>
                    <span className="font-['Montserrat'] text-[12px] sm:text-[14px] font-[600] text-white">{character.winRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-['Montserrat'] text-[12px] sm:text-[14px] font-[500] text-white/60">Balance</span>
                    <span className="font-['Montserrat'] text-[12px] sm:text-[14px] font-[600] text-white">{character.tokenBalance.toFixed(2)} ALGO</span>
                  </div>
                </div>

                {/* Last Activity */}
                <div className="flex items-center space-x-2 text-xs text-gray-400 mb-4">
                  <Clock className="w-3 h-3" />
                  <span className="font-['Montserrat'] text-[11px] sm:text-[12px]">
                    Last active: {character.lastActivity}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="brand-primary"
                    size="small"
                    onClick={() => setCurrentView('chat')}
                    icon={<MessageCircle className="w-3 h-3 sm:w-4 sm:h-4" />}
                    className="flex-1"
                  >
                    <span className="text-[12px] sm:text-[14px]">Chat</span>
                  </Button>
                  <Button
                    variant="neutral-secondary"
                    size="small"
                    onClick={() => handleSettingsClick(character)}
                    icon={<Settings className="w-3 h-3 sm:w-4 sm:h-4" />}
                    className="px-2 sm:px-3"
                  >
                    <span className="hidden sm:inline text-[12px] sm:text-[14px]">Settings</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredCharacters.length === 0 && characters.length > 0 && (
        <div className="text-center py-8 sm:py-12">
          <Search className="w-10 h-10 sm:w-12 sm:h-12 text-white/40 mx-auto mb-3 sm:mb-4" />
          <div className="font-['Montserrat'] text-[18px] sm:text-[20px] font-[600] text-white/60 mb-3 sm:mb-4">
            No agents found
          </div>
          <p className="font-['Montserrat'] text-[14px] text-white/40 mb-4">
            Try adjusting your search or filter criteria
          </p>
          <Button
            variant="neutral-secondary"
            size="medium"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* No Agents State */}
      {characters.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <Bot className="w-10 h-10 sm:w-12 sm:h-12 text-white/40 mx-auto mb-3 sm:mb-4" />
          <div className="font-['Montserrat'] text-[18px] sm:text-[20px] font-[600] text-white/60 mb-3 sm:mb-4">
            No agents created yet
          </div>
          <p className="font-['Montserrat'] text-[14px] text-white/40 mb-6">
            Create your first AI agent to get started with the platform
          </p>
          <Button
            variant="brand-primary"
            size={window.innerWidth < 640 ? "medium" : "large"}
            onClick={() => setCurrentView('create')}
            icon={<Plus className="w-4 h-4 sm:w-5 sm:h-5" />}
            className="w-full sm:w-auto max-w-xs"
          >
            <span className="hidden sm:inline">Create Your First Agent</span>
            <span className="sm:hidden">Create First Agent</span>
          </Button>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && selectedAgent && (
        <AgentSettingsModal
          agent={selectedAgent}
          isOpen={showSettingsModal}
          onClose={() => {
            setShowSettingsModal(false);
            setSelectedAgent(null);
          }}
          onSave={handleSaveSettings}
        />
      )}
    </div>
  );
};

export default MyAgentsSection;