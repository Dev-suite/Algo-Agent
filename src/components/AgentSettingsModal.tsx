import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Settings, 
  User, 
  Brain, 
  Mic, 
  Coins, 
  Save,
  AlertCircle,
  Crown,
  Heart,
  Dice6,
  Bot,
  Upload,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { Button, Switch } from '../ui';
import { Character } from '../types';

interface AgentSettingsModalProps {
  agent: Character;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Character>) => Promise<void>;
}

const AgentSettingsModal: React.FC<AgentSettingsModalProps> = ({
  agent,
  isOpen,
  onClose,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<Partial<Character>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (agent) {
      setFormData({
        name: agent.name,
        personality: agent.personality,
        backstory: agent.backstory,
        skills: agent.skills,
        avatar: agent.avatar,
        voiceId: agent.voiceId,
        agentType: agent.agentType,
        traits: { ...agent.traits }
      });
      setHasChanges(false);
    }
  }, [agent]);

  const handleInputChange = (field: keyof Character, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleTraitChange = (trait: keyof Character['traits'], value: number) => {
    setFormData(prev => ({
      ...prev,
      traits: {
        ...prev.traits,
        [trait]: Math.max(0, Math.min(100, value))
      }
    }));
    setHasChanges(true);
  };

  const handleSkillsChange = (skillsString: string) => {
    const skills = skillsString.split(',').map(s => s.trim()).filter(s => s.length > 0);
    handleInputChange('skills', skills);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        lastActivity: 'Settings updated'
      });
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (agent) {
      setFormData({
        name: agent.name,
        personality: agent.personality,
        backstory: agent.backstory,
        skills: agent.skills,
        avatar: agent.avatar,
        voiceId: agent.voiceId,
        agentType: agent.agentType,
        traits: { ...agent.traits }
      });
      setHasChanges(false);
    }
  };

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

  const tabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'personality', label: 'Personality', icon: Brain },
    { id: 'voice', label: 'Voice', icon: Mic },
    { id: 'advanced', label: 'Advanced', icon: Settings }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-neutral-800 rounded-[20px] border border-amber-900/20 w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-amber-900/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-['Montserrat'] text-[20px] font-[700] text-white">
                  Agent Settings
                </h2>
                <p className="font-['Montserrat'] text-[14px] text-white/60">
                  Configure {agent.name}
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

          <div className="flex h-[calc(90vh-120px)]">
            {/* Sidebar */}
            <div className="w-64 border-r border-amber-900/20 p-4">
              {/* Agent Preview */}
              <div className="mb-6 p-4 bg-neutral-700/30 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={formData.avatar || agent.avatar}
                    alt={formData.name || agent.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-['Montserrat'] text-[16px] font-[600] text-white truncate">
                      {formData.name || agent.name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {getAgentIcon(formData.agentType || agent.agentType)}
                      <span className="font-['Montserrat'] text-[12px] text-white/60">
                        {(formData.agentType || agent.agentType || 'agent').charAt(0).toUpperCase() + 
                         (formData.agentType || agent.agentType || 'agent').slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-['Montserrat'] text-[14px] font-[600] text-white">
                    Level {agent.level}
                  </p>
                  <p className="font-['Montserrat'] text-[12px] text-white/60">
                    {agent.experience.toLocaleString()} XP
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-brand-600 text-white'
                        : 'text-white/60 hover:bg-neutral-700/50 hover:text-white'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="font-['Montserrat'] text-[14px] font-[500]">
                      {tab.label}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {/* General Tab */}
                {activeTab === 'general' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-['Montserrat'] text-[18px] font-[600] text-white mb-4">
                        Basic Information
                      </h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block font-['Montserrat'] text-[14px] font-[500] text-white mb-2">
                            Agent Name
                          </label>
                          <input
                            type="text"
                            value={formData.name || ''}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="w-full px-4 py-3 bg-neutral-700 border border-amber-800/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-brand-600"
                          />
                        </div>

                        <div>
                          <label className="block font-['Montserrat'] text-[14px] font-[500] text-white mb-2">
                            Agent Type
                          </label>
                          <select
                            value={formData.agentType || ''}
                            onChange={(e) => handleInputChange('agentType', e.target.value)}
                            className="w-full px-4 py-3 bg-neutral-700 border border-amber-800/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-600"
                          >
                            <option value="companion">AI Companion</option>
                            <option value="influencer">Social Influencer</option>
                            <option value="gamemaster">Game Master</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-['Montserrat'] text-[14px] font-[500] text-white mb-2">
                            Backstory
                          </label>
                          <textarea
                            value={formData.backstory || ''}
                            onChange={(e) => handleInputChange('backstory', e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 bg-neutral-700 border border-amber-800/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-brand-600 resize-none"
                          />
                        </div>

                        <div>
                          <label className="block font-['Montserrat'] text-[14px] font-[500] text-white mb-2">
                            Skills (comma-separated)
                          </label>
                          <input
                            type="text"
                            value={formData.skills?.join(', ') || ''}
                            onChange={(e) => handleSkillsChange(e.target.value)}
                            placeholder="e.g., Strategy, Analysis, Communication"
                            className="w-full px-4 py-3 bg-neutral-700 border border-amber-800/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-brand-600"
                          />
                        </div>

                        <div>
                          <label className="block font-['Montserrat'] text-[14px] font-[500] text-white mb-2">
                            Avatar
                          </label>
                          <div className="flex items-center space-x-4">
                            <img
                              src={formData.avatar || agent.avatar}
                              alt="Avatar"
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <Button
                              variant="neutral-secondary"
                              size="small"
                              icon={<Upload className="w-4 h-4" />}
                            >
                              Change Avatar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Personality Tab */}
                {activeTab === 'personality' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-['Montserrat'] text-[18px] font-[600] text-white mb-4">
                        Personality Configuration
                      </h3>
                      
                      <div className="space-y-4 mb-6">
                        <div>
                          <label className="block font-['Montserrat'] text-[14px] font-[500] text-white mb-2">
                            Personality Traits
                          </label>
                          <input
                            type="text"
                            value={formData.personality || ''}
                            onChange={(e) => handleInputChange('personality', e.target.value)}
                            placeholder="e.g., Analytical, Strategic, Competitive"
                            className="w-full px-4 py-3 bg-neutral-700 border border-amber-800/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-brand-600"
                          />
                        </div>
                      </div>

                      <h4 className="font-['Montserrat'] text-[16px] font-[600] text-white mb-4">
                        Trait Levels
                      </h4>
                      
                      <div className="space-y-4">
                        {formData.traits && Object.entries(formData.traits).map(([trait, value]) => (
                          <div key={trait}>
                            <div className="flex items-center justify-between mb-2">
                              <label className="font-['Montserrat'] text-[14px] font-[500] text-white capitalize">
                                {trait}
                              </label>
                              <span className="font-['Montserrat'] text-[14px] font-[600] text-brand-400">
                                {value}%
                              </span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={value}
                                onChange={(e) => handleTraitChange(trait as keyof Character['traits'], parseInt(e.target.value))}
                                className="flex-1 h-2 bg-neutral-600 rounded-lg appearance-none cursor-pointer slider"
                              />
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={value}
                                onChange={(e) => handleTraitChange(trait as keyof Character['traits'], parseInt(e.target.value) || 0)}
                                className="w-16 px-2 py-1 bg-neutral-700 border border-amber-800/30 rounded text-white text-center text-sm focus:outline-none focus:ring-1 focus:ring-brand-600"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Voice Tab */}
                {activeTab === 'voice' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-['Montserrat'] text-[18px] font-[600] text-white mb-4">
                        Voice Settings
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-neutral-700/30 rounded-lg">
                          <div>
                            <h4 className="font-['Montserrat'] text-[16px] font-[500] text-white">
                              Enable Voice
                            </h4>
                            <p className="font-['Montserrat'] text-[14px] text-white/60">
                              Allow this agent to speak using text-to-speech
                            </p>
                          </div>
                          <Switch
                            checked={!!formData.voiceId}
                            onCheckedChange={(checked) => 
                              handleInputChange('voiceId', checked ? `${agent.name.toLowerCase()}_voice` : undefined)
                            }
                          />
                        </div>

                        {formData.voiceId && (
                          <div>
                            <label className="block font-['Montserrat'] text-[14px] font-[500] text-white mb-2">
                              Voice Type
                            </label>
                            <select
                              value={formData.voiceId?.includes('female') ? 'female' : 
                                     formData.voiceId?.includes('male') ? 'male' : 'neutral'}
                              onChange={(e) => handleInputChange('voiceId', `${agent.name.toLowerCase()}_${e.target.value}`)}
                              className="w-full px-4 py-3 bg-neutral-700 border border-amber-800/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-600"
                            >
                              <option value="female">Female Voice</option>
                              <option value="male">Male Voice</option>
                              <option value="neutral">Neutral Voice</option>
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Advanced Tab */}
                {activeTab === 'advanced' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-['Montserrat'] text-[18px] font-[600] text-white mb-4">
                        Advanced Settings
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="p-4 bg-neutral-700/30 rounded-lg">
                          <h4 className="font-['Montserrat'] text-[16px] font-[500] text-white mb-2">
                            Agent Statistics
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-white/60">Created:</span>
                              <span className="text-white ml-2">{agent.createdAt}</span>
                            </div>
                            <div>
                              <span className="text-white/60">Level:</span>
                              <span className="text-white ml-2">{agent.level}</span>
                            </div>
                            <div>
                              <span className="text-white/60">Experience:</span>
                              <span className="text-white ml-2">{agent.experience.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-white/60">Win Rate:</span>
                              <span className="text-white ml-2">{agent.winRate}%</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-neutral-700/30 rounded-lg">
                          <h4 className="font-['Montserrat'] text-[16px] font-[500] text-white mb-2">
                            Blockchain Information
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-white/60">Wallet Address:</span>
                              <span className="text-white ml-2 font-mono">
                                {agent.walletAddress || 'Not connected'}
                              </span>
                            </div>
                            <div>
                              <span className="text-white/60">Token Balance:</span>
                              <span className="text-white ml-2">{agent.tokenBalance.toFixed(2)} ALGO</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-error-900/20 border border-error-600/30 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-error-400 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-['Montserrat'] text-[16px] font-[500] text-error-400 mb-2">
                                Danger Zone
                              </h4>
                              <p className="font-['Montserrat'] text-[14px] text-white/60 mb-4">
                                These actions cannot be undone. Please proceed with caution.
                              </p>
                              <Button
                                variant="destructive-secondary"
                                size="small"
                                icon={<Trash2 className="w-4 h-4" />}
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete ${agent.name}? This action cannot be undone.`)) {
                                    // Handle deletion through parent component
                                    onClose();
                                  }
                                }}
                              >
                                Delete Agent
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-amber-900/20">
            <div className="flex items-center space-x-3">
              {hasChanges && (
                <div className="flex items-center space-x-2 text-warning-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-['Montserrat'] text-[14px] font-[500]">
                    You have unsaved changes
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="neutral-secondary"
                onClick={handleReset}
                disabled={!hasChanges || isSaving}
                icon={<RefreshCw className="w-4 h-4" />}
              >
                Reset
              </Button>
              <Button
                variant="neutral-secondary"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="brand-primary"
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                icon={isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AgentSettingsModal;