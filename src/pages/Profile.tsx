import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Link as LinkIcon, 
  Edit3, 
  Camera, 
  Save, 
  X,
  Trophy,
  Star,
  TrendingUp,
  Bot,
  Wallet,
  Shield,
  Award,
  Activity,
  Users,
  Zap
} from 'lucide-react';
import { Button } from '../ui';
import { useWallet } from '../hooks/useWallet';
import { useCharacters } from '../hooks/useCharacters';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { isConnected, account, balance, formatAddress, formatBalance } = useWallet();
  const { characters } = useCharacters();
  
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Alex Chen',
    email: 'alex.chen@example.com',
    bio: 'AI enthusiast and blockchain developer passionate about creating intelligent agents on Algorand.',
    location: 'San Francisco, CA',
    website: 'https://alexchen.dev',
    joinDate: '2024-01-15',
    avatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=400'
  });

  const [editedProfile, setEditedProfile] = useState(profile);

  const stats = [
    {
      icon: Bot,
      label: 'Agents Created',
      value: characters.length,
      color: 'text-brand-600',
      bg: 'bg-brand-100 dark:bg-brand-900/20'
    },
    {
      icon: Activity,
      label: 'Total Interactions',
      value: characters.reduce((sum, c) => sum + c.gamesPlayed, 0),
      color: 'text-success-600',
      bg: 'bg-success-100 dark:bg-success-900/20'
    },
    {
      icon: TrendingUp,
      label: 'Avg Win Rate',
      value: `${(characters.reduce((sum, c) => sum + c.winRate, 0) / characters.length || 0).toFixed(1)}%`,
      color: 'text-warning-600',
      bg: 'bg-warning-100 dark:bg-warning-900/20'
    },
    {
      icon: Wallet,
      label: 'Portfolio Value',
      value: `${characters.reduce((sum, c) => sum + c.tokenBalance, 0).toFixed(2)} ALGO`,
      color: 'text-purple-600',
      bg: 'bg-purple-100 dark:bg-purple-900/20'
    }
  ];

  const achievements = [
    {
      icon: Trophy,
      title: 'First Agent',
      description: 'Created your first AI agent',
      earned: true,
      date: '2024-01-20'
    },
    {
      icon: Star,
      title: 'Agent Master',
      description: 'Created 5 AI agents',
      earned: characters.length >= 5,
      date: characters.length >= 5 ? '2024-02-15' : null
    },
    {
      icon: Users,
      title: 'Social Butterfly',
      description: 'Reached 1000 total interactions',
      earned: characters.reduce((sum, c) => sum + c.gamesPlayed, 0) >= 1000,
      date: null
    },
    {
      icon: Zap,
      title: 'Power User',
      description: 'Used platform for 30 days',
      earned: true,
      date: '2024-02-14'
    }
  ];

  const recentActivity = [
    {
      type: 'agent_created',
      description: 'Created new agent "Zara the Strategist"',
      timestamp: '2 hours ago',
      icon: Bot
    },
    {
      type: 'interaction',
      description: 'Agent completed 50 interactions',
      timestamp: '1 day ago',
      icon: Activity
    },
    {
      type: 'achievement',
      description: 'Earned "Power User" achievement',
      timestamp: '3 days ago',
      icon: Award
    },
    {
      type: 'wallet',
      description: 'Connected Algorand wallet',
      timestamp: '1 week ago',
      icon: Wallet
    }
  ];

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setEditedProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          </button>
          <div>
            <h1 className="font-['Montserrat'] text-[24px] font-[700] text-neutral-900 dark:text-white">
              Profile
            </h1>
            <p className="font-['Montserrat'] text-[14px] text-neutral-600 dark:text-neutral-400">
              Manage your profile and view your achievements
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-brand-600 to-brand-400 relative">
            <div className="absolute inset-0 bg-black/20" />
          </div>
          
          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16 relative">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={isEditing ? editedProfile.avatar : profile.avatar}
                  alt="Profile"
                  className="w-32 h-32 rounded-2xl border-4 border-white dark:border-neutral-800 object-cover"
                />
                {isEditing && (
                  <button className="absolute bottom-2 right-2 p-2 bg-brand-600 text-white rounded-full hover:bg-brand-700 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Profile Details */}
              <div className="flex-1 mt-4 sm:mt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="font-['Montserrat'] text-[28px] font-[700] text-neutral-900 dark:text-white bg-transparent border-b-2 border-brand-600 focus:outline-none"
                      />
                    ) : (
                      <h2 className="font-['Montserrat'] text-[28px] font-[700] text-neutral-900 dark:text-white">
                        {profile.name}
                      </h2>
                    )}
                    
                    <div className="flex items-center space-x-4 mt-2 text-neutral-600 dark:text-neutral-400">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-4 h-4" />
                        {isEditing ? (
                          <input
                            type="email"
                            value={editedProfile.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="font-['Montserrat'] text-[14px] bg-transparent border-b border-neutral-300 dark:border-neutral-600 focus:outline-none focus:border-brand-600"
                          />
                        ) : (
                          <span className="font-['Montserrat'] text-[14px]">{profile.email}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span className="font-['Montserrat'] text-[14px]">
                          Joined {new Date(profile.joinDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-0">
                    {isEditing ? (
                      <div className="flex space-x-2">
                        <Button
                          variant="brand-primary"
                          onClick={handleSave}
                          icon={<Save className="w-4 h-4" />}
                        >
                          Save
                        </Button>
                        <Button
                          variant="neutral-secondary"
                          onClick={handleCancel}
                          icon={<X className="w-4 h-4" />}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="neutral-secondary"
                        onClick={() => setIsEditing(true)}
                        icon={<Edit3 className="w-4 h-4" />}
                      >
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Bio */}
                <div className="mt-4">
                  {isEditing ? (
                    <textarea
                      value={editedProfile.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={3}
                      className="w-full font-['Montserrat'] text-[14px] text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-brand-600 resize-none"
                    />
                  ) : (
                    <p className="font-['Montserrat'] text-[14px] text-neutral-700 dark:text-neutral-300 max-w-2xl">
                      {profile.bio}
                    </p>
                  )}
                </div>
                
                {/* Additional Info */}
                <div className="flex flex-wrap items-center gap-4 mt-4 text-neutral-600 dark:text-neutral-400">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="font-['Montserrat'] text-[14px] bg-transparent border-b border-neutral-300 dark:border-neutral-600 focus:outline-none focus:border-brand-600"
                      />
                    ) : (
                      <span className="font-['Montserrat'] text-[14px]">{profile.location}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <LinkIcon className="w-4 h-4" />
                    {isEditing ? (
                      <input
                        type="url"
                        value={editedProfile.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        className="font-['Montserrat'] text-[14px] bg-transparent border-b border-neutral-300 dark:border-neutral-600 focus:outline-none focus:border-brand-600"
                      />
                    ) : (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-['Montserrat'] text-[14px] text-brand-600 hover:text-brand-700"
                      >
                        {profile.website}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <div>
                <p className="font-['Montserrat'] text-[14px] font-[500] text-neutral-600 dark:text-neutral-400">
                  {stat.label}
                </p>
                <p className="font-['Montserrat'] text-[28px] font-[700] text-neutral-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Achievements */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="font-['Montserrat'] text-[20px] font-[700] text-neutral-900 dark:text-white mb-6">
              Achievements
            </h3>
            
            <div className="space-y-4">
              {achievements.map((achievement, index) => (
                <div
                  key={achievement.title}
                  className={`flex items-center space-x-4 p-4 rounded-lg ${
                    achievement.earned
                      ? 'bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800'
                      : 'bg-neutral-50 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    achievement.earned
                      ? 'bg-success-100 dark:bg-success-900/40'
                      : 'bg-neutral-200 dark:bg-neutral-600'
                  }`}>
                    <achievement.icon className={`w-6 h-6 ${
                      achievement.earned
                        ? 'text-success-600'
                        : 'text-neutral-400 dark:text-neutral-500'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-['Montserrat'] text-[16px] font-[600] ${
                      achievement.earned
                        ? 'text-success-800 dark:text-success-200'
                        : 'text-neutral-600 dark:text-neutral-400'
                    }`}>
                      {achievement.title}
                    </h4>
                    <p className={`font-['Montserrat'] text-[14px] ${
                      achievement.earned
                        ? 'text-success-600 dark:text-success-300'
                        : 'text-neutral-500 dark:text-neutral-500'
                    }`}>
                      {achievement.description}
                    </p>
                    {achievement.earned && achievement.date && (
                      <p className="font-['Montserrat'] text-[12px] text-success-500 dark:text-success-400 mt-1">
                        Earned on {new Date(achievement.date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="font-['Montserrat'] text-[20px] font-[700] text-neutral-900 dark:text-white mb-6">
              Recent Activity
            </h3>
            
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <activity.icon className="w-5 h-5 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-['Montserrat'] text-[14px] font-[500] text-neutral-900 dark:text-white">
                      {activity.description}
                    </p>
                    <p className="font-['Montserrat'] text-[12px] text-neutral-500 dark:text-neutral-400">
                      {activity.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wallet Information */}
        {isConnected && (
          <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="font-['Montserrat'] text-[20px] font-[700] text-neutral-900 dark:text-white mb-6">
              Wallet Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="font-['Montserrat'] text-[14px] font-[500] text-neutral-600 dark:text-neutral-400">
                    Wallet Address
                  </label>
                  <p className="font-['Montserrat'] text-[16px] font-[600] text-neutral-900 dark:text-white font-mono">
                    {formatAddress(account?.address || '')}
                  </p>
                </div>
                <div>
                  <label className="font-['Montserrat'] text-[14px] font-[500] text-neutral-600 dark:text-neutral-400">
                    Balance
                  </label>
                  <p className="font-['Montserrat'] text-[16px] font-[600] text-neutral-900 dark:text-white">
                    {formatBalance(balance)} ALGO
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <Shield className="w-16 h-16 text-success-600 mx-auto mb-4" />
                  <p className="font-['Montserrat'] text-[16px] font-[600] text-success-600">
                    Wallet Verified
                  </p>
                  <p className="font-['Montserrat'] text-[14px] text-neutral-600 dark:text-neutral-400">
                    Your wallet is securely connected
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;