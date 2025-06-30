import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Wallet,
  Key,
  Database,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import { Button, Switch } from '../ui';
import { useTheme } from '../contexts/ThemeContext';
import { useWallet } from '../hooks/useWallet';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { isConnected, account, formatAddress } = useWallet();
  
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    // General Settings
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    
    // Appearance Settings
    theme: theme,
    fontSize: 'medium',
    animations: true,
    compactMode: false,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    agentUpdates: true,
    marketplaceAlerts: true,
    securityAlerts: true,
    
    // Privacy Settings
    profileVisibility: 'public',
    dataCollection: true,
    analytics: true,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
    loginAlerts: true,
    
    // API Settings
    apiAccess: false,
    webhooks: false
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const sections = [
    { id: 'general', label: 'General', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'security', label: 'Security', icon: Key },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'data', label: 'Data', icon: Database }
  ];

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Handle theme change immediately
    if (key === 'theme') {
      toggleTheme();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save settings to localStorage
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    const data = {
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'algo-agent-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-['Montserrat'] text-[20px] font-[700] text-neutral-900 dark:text-white mb-4">
          General Settings
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block font-['Montserrat'] text-[14px] font-[500] text-neutral-700 dark:text-neutral-300 mb-2">
              Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ja">Japanese</option>
            </select>
          </div>

          <div>
            <label className="block font-['Montserrat'] text-[14px] font-[500] text-neutral-700 dark:text-neutral-300 mb-2">
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => handleSettingChange('timezone', e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600"
            >
              <option value="UTC">UTC</option>
              <option value="EST">Eastern Time</option>
              <option value="PST">Pacific Time</option>
              <option value="GMT">Greenwich Mean Time</option>
              <option value="JST">Japan Standard Time</option>
            </select>
          </div>

          <div>
            <label className="block font-['Montserrat'] text-[14px] font-[500] text-neutral-700 dark:text-neutral-300 mb-2">
              Date Format
            </label>
            <select
              value={settings.dateFormat}
              onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600"
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-['Montserrat'] text-[20px] font-[700] text-neutral-900 dark:text-white mb-4">
          Appearance Settings
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block font-['Montserrat'] text-[14px] font-[500] text-neutral-700 dark:text-neutral-300 mb-3">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'light', label: 'Light', icon: Sun },
                { value: 'dark', label: 'Dark', icon: Moon },
                { value: 'system', label: 'System', icon: Monitor }
              ].map((themeOption) => (
                <button
                  key={themeOption.value}
                  onClick={() => handleSettingChange('theme', themeOption.value)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    theme === themeOption.value
                      ? 'border-brand-600 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500'
                  }`}
                >
                  <themeOption.icon className={`w-6 h-6 mx-auto mb-2 ${
                    theme === themeOption.value ? 'text-brand-600' : 'text-neutral-600 dark:text-neutral-400'
                  }`} />
                  <span className={`font-['Montserrat'] text-[14px] font-[500] ${
                    theme === themeOption.value ? 'text-brand-600' : 'text-neutral-700 dark:text-neutral-300'
                  }`}>
                    {themeOption.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-['Montserrat'] text-[14px] font-[500] text-neutral-700 dark:text-neutral-300 mb-2">
              Font Size
            </label>
            <select
              value={settings.fontSize}
              onChange={(e) => handleSettingChange('fontSize', e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-600"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="font-['Montserrat'] text-[14px] font-[500] text-neutral-700 dark:text-neutral-300">
                Enable Animations
              </span>
              <p className="font-['Montserrat'] text-[12px] text-neutral-500 dark:text-neutral-400">
                Smooth transitions and micro-interactions
              </p>
            </div>
            <Switch
              checked={settings.animations}
              onCheckedChange={(checked) => handleSettingChange('animations', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="font-['Montserrat'] text-[14px] font-[500] text-neutral-700 dark:text-neutral-300">
                Compact Mode
              </span>
              <p className="font-['Montserrat'] text-[12px] text-neutral-500 dark:text-neutral-400">
                Reduce spacing for more content
              </p>
            </div>
            <Switch
              checked={settings.compactMode}
              onCheckedChange={(checked) => handleSettingChange('compactMode', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-['Montserrat'] text-[20px] font-[700] text-neutral-900 dark:text-white mb-4">
          Notification Settings
        </h3>
        
        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive updates via email' },
            { key: 'pushNotifications', label: 'Push Notifications', description: 'Browser notifications' },
            { key: 'agentUpdates', label: 'Agent Updates', description: 'Notifications about your agents' },
            { key: 'marketplaceAlerts', label: 'Marketplace Alerts', description: 'New agents and market changes' },
            { key: 'securityAlerts', label: 'Security Alerts', description: 'Important security notifications' }
          ].map((notification) => (
            <div key={notification.key} className="flex items-center justify-between py-3">
              <div>
                <span className="font-['Montserrat'] text-[14px] font-[500] text-neutral-700 dark:text-neutral-300">
                  {notification.label}
                </span>
                <p className="font-['Montserrat'] text-[12px] text-neutral-500 dark:text-neutral-400">
                  {notification.description}
                </p>
              </div>
              <Switch
                checked={settings[notification.key as keyof typeof settings] as boolean}
                onCheckedChange={(checked) => handleSettingChange(notification.key, checked)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderWalletSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-['Montserrat'] text-[20px] font-[700] text-neutral-900 dark:text-white mb-4">
          Wallet Settings
        </h3>
        
        <div className="space-y-4">
          {isConnected ? (
            <div className="p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-success-600" />
                <div>
                  <p className="font-['Montserrat'] text-[14px] font-[600] text-success-800 dark:text-success-200">
                    Wallet Connected
                  </p>
                  <p className="font-['Montserrat'] text-[12px] text-success-600 dark:text-success-300">
                    {formatAddress(account?.address || '')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-warning-600" />
                <div>
                  <p className="font-['Montserrat'] text-[14px] font-[600] text-warning-800 dark:text-warning-200">
                    No Wallet Connected
                  </p>
                  <p className="font-['Montserrat'] text-[12px] text-warning-600 dark:text-warning-300">
                    Connect your wallet to access all features
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between py-3">
            <div>
              <span className="font-['Montserrat'] text-[14px] font-[500] text-neutral-700 dark:text-neutral-300">
                Auto-connect on startup
              </span>
              <p className="font-['Montserrat'] text-[12px] text-neutral-500 dark:text-neutral-400">
                Automatically connect to your last used wallet
              </p>
            </div>
            <Switch
              checked={true}
              onCheckedChange={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-['Montserrat'] text-[20px] font-[700] text-neutral-900 dark:text-white mb-4">
          Data Management
        </h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <h4 className="font-['Montserrat'] text-[16px] font-[600] text-neutral-900 dark:text-white mb-2">
              Export Data
            </h4>
            <p className="font-['Montserrat'] text-[14px] text-neutral-600 dark:text-neutral-400 mb-4">
              Download your settings and agent data
            </p>
            <Button
              variant="neutral-secondary"
              onClick={handleExportData}
              icon={<Download className="w-4 h-4" />}
            >
              Export Settings
            </Button>
          </div>

          <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
            <h4 className="font-['Montserrat'] text-[16px] font-[600] text-neutral-900 dark:text-white mb-2">
              Import Data
            </h4>
            <p className="font-['Montserrat'] text-[14px] text-neutral-600 dark:text-neutral-400 mb-4">
              Restore settings from a backup file
            </p>
            <Button
              variant="neutral-secondary"
              icon={<Upload className="w-4 h-4" />}
            >
              Import Settings
            </Button>
          </div>

          <div className="p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
            <h4 className="font-['Montserrat'] text-[16px] font-[600] text-error-800 dark:text-error-200 mb-2">
              Danger Zone
            </h4>
            <p className="font-['Montserrat'] text-[14px] text-error-600 dark:text-error-300 mb-4">
              Permanently delete all your data and settings
            </p>
            <Button
              variant="destructive-secondary"
              icon={<Trash2 className="w-4 h-4" />}
            >
              Delete All Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 transition-colors">
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
              Settings
            </h1>
            <p className="font-['Montserrat'] text-[14px] text-neutral-600 dark:text-neutral-400">
              Manage your preferences and account settings
            </p>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 min-h-screen">
          <nav className="p-4 space-y-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-brand-600 text-white'
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
              >
                <section.icon className="w-5 h-5" />
                <span className="font-['Montserrat'] text-[14px] font-[500]">
                  {section.label}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          <div className="max-w-2xl">
            {activeSection === 'general' && renderGeneralSettings()}
            {activeSection === 'appearance' && renderAppearanceSettings()}
            {activeSection === 'notifications' && renderNotificationSettings()}
            {activeSection === 'wallet' && renderWalletSettings()}
            {activeSection === 'data' && renderDataSettings()}
            
            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center space-x-4">
                <Button
                  variant="brand-primary"
                  onClick={handleSave}
                  disabled={isSaving}
                  icon={isSaving ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                
                {saveStatus === 'success' && (
                  <div className="flex items-center space-x-2 text-success-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-['Montserrat'] text-[14px] font-[500]">
                      Settings saved successfully
                    </span>
                  </div>
                )}
                
                {saveStatus === 'error' && (
                  <div className="flex items-center space-x-2 text-error-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-['Montserrat'] text-[14px] font-[500]">
                      Failed to save settings
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;