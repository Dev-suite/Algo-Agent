import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Bot } from 'lucide-react';
import { Button } from '../ui';
import { Character } from '../types';
import AlgorandChatInterface from './AlgorandChatInterface';

interface ChatSectionProps {
  characters: Character[];
}

const ChatSection: React.FC<ChatSectionProps> = ({ characters }) => {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [showCharacterList, setShowCharacterList] = useState(true);

  // Filter for active characters, prioritizing Zara the Strategist
  const activeCharacters = characters.filter(c => c.status === 'active' || c.status === 'idle');
  const zaraCharacter = activeCharacters.find(c => c.name === 'Zara the Strategist');

  return (
    <div className="h-full flex flex-col lg:flex-row">
      {/* Mobile Title */}
      <div className="block lg:hidden p-4 bg-neutral-800 border-b border-amber-900/20">
        <h2 className="font-['Montserrat'] text-[24px] font-[700] text-white flex items-center space-x-2">
          <MessageCircle className="w-6 h-6" />
          <span>Chat</span>
        </h2>
        <p className="font-['Montserrat'] text-[14px] text-white/60 mt-1">Chat with AI agents about Algorand</p>
      </div>

      {/* Character List */}
      <div className={`lg:w-80 bg-neutral-800 lg:border-r border-amber-900/20 flex flex-col ${
        selectedCharacter && !showCharacterList ? 'hidden lg:flex' : 'flex'
      }`}>
        <div className="hidden lg:block p-6 border-b border-amber-900/20">
          <h2 className="font-['Montserrat'] text-[24px] font-[700] text-white flex items-center space-x-2">
            <MessageCircle className="w-6 h-6" />
            <span>Chat</span>
          </h2>
          <p className="font-['Montserrat'] text-[14px] text-white/60 mt-1">Chat with AI agents about Algorand</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 lg:p-4 space-y-2 lg:space-y-3">
          {/* Highlight Zara the Strategist */}
          {zaraCharacter && (
            <motion.div
              onClick={() => {
                setSelectedCharacter(zaraCharacter.id);
                setShowCharacterList(false);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-3 lg:p-4 rounded-[12px] cursor-pointer transition-all duration-200 border-2 ${
                selectedCharacter === zaraCharacter.id
                  ? 'bg-brand-900/20 border-brand-600/50'
                  : 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/50 hover:border-purple-400/70'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={zaraCharacter.avatar}
                    alt={zaraCharacter.name}
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 rounded-full border-2 border-neutral-800 bg-success-500" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-[8px] text-white font-bold">AI</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-['Montserrat'] text-[14px] lg:text-[16px] font-[600] text-white truncate">
                    {zaraCharacter.name}
                  </h3>
                  <p className="font-['Montserrat'] text-[11px] lg:text-[12px] text-purple-300 truncate">
                    Algorand Blockchain Expert • AI Powered
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Other Characters */}
          {activeCharacters.filter(c => c.id !== zaraCharacter?.id).map((character) => (
            <motion.div
              key={character.id}
              onClick={() => {
                setSelectedCharacter(character.id);
                setShowCharacterList(false);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-3 lg:p-4 rounded-[12px] cursor-pointer transition-all duration-200 ${
                selectedCharacter === character.id
                  ? 'bg-brand-900/20 border border-brand-600/50'
                  : 'bg-neutral-700/30 hover:bg-neutral-700/50 border border-amber-800/30'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={character.avatar}
                    alt={character.name}
                    className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 rounded-full border-2 border-neutral-800 ${
                    character.status === 'active' ? 'bg-success-500' : 'bg-warning-500'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-['Montserrat'] text-[14px] lg:text-[16px] font-[600] text-white truncate">{character.name}</h3>
                  <p className="font-['Montserrat'] text-[11px] lg:text-[12px] text-white/60 truncate">{character.personality.split(',')[0]}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {activeCharacters.length === 0 && (
          <div className="flex-1 flex items-center justify-center p-4 lg:p-6">
            <div className="text-center">
              <Bot className="w-10 h-10 lg:w-12 lg:h-12 text-white/40 mx-auto mb-3 lg:mb-4" />
              <p className="font-['Montserrat'] text-[13px] lg:text-[14px] text-white/60">No active characters available</p>
              <p className="font-['Montserrat'] text-[11px] lg:text-[12px] text-white/40 mt-1">Create or activate characters to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* Chat Interface */}
      <div className={`flex-1 flex flex-col ${
        selectedCharacter && !showCharacterList ? 'flex' : 'hidden lg:flex'
      }`}>
        {selectedCharacter ? (
          <div className="h-full flex flex-col relative">
            {(() => {
              const character = characters.find(c => c.id === selectedCharacter);
              if (!character) return null;

              // Use Gemini-powered chat for Zara the Strategist
              if (character.name === 'Zara the Strategist') {
                return <AlgorandChatInterface character={character} />;
              }

              // Fallback for other characters
              return (
                <div className="h-full flex flex-col">
                  {/* Chat Header */}
                  <div className="flex-shrink-0 p-4 lg:p-6 border-b border-amber-900/20 bg-neutral-800">
                    <div className="flex items-center space-x-3 lg:space-x-4">
                      <button
                        onClick={() => setShowCharacterList(true)}
                        className="lg:hidden p-2 text-white hover:bg-default-300/20 rounded-lg transition-colors"
                      >
                        ←
                      </button>
                      <img
                        src={character.avatar}
                        alt={character.name}
                        className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-['Montserrat'] text-[16px] lg:text-[20px] font-[700] text-white">
                          {character.name}
                        </h3>
                        <p className="font-['Montserrat'] text-[12px] lg:text-[14px] text-success-400">Online</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 lg:pb-28">
                    <div className="space-y-3 lg:space-y-4">
                      <div className="flex justify-start">
                        <div className="max-w-[280px] sm:max-w-xs lg:max-w-md">
                          <div className="bg-neutral-700 rounded-[12px] p-3 lg:p-4">
                            <p className="font-['Montserrat'] text-[13px] lg:text-[14px] text-white">
                              Hello! I'm ready to chat. How can I help you today?
                            </p>
                          </div>
                          <p className="font-['Montserrat'] text-[11px] lg:text-[12px] text-white/60 mt-2">Just now</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6 border-t border-amber-900/20 bg-neutral-800">
                    <div className="flex space-x-2 lg:space-x-4">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        className="flex-1 px-3 lg:px-4 py-3 lg:py-3 bg-neutral-700 border border-amber-800/30 rounded-[12px] text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-brand-600 font-['Montserrat'] text-[13px] lg:text-[14px]"
                      />
                      <Button 
                        variant="brand-primary" 
                        size={window.innerWidth < 1024 ? "small" : "medium"}
                        onClick={() => {}}
                      >
                        <span className="hidden sm:inline">Send</span>
                        <span className="sm:hidden">→</span>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4 lg:p-6">
            <div className="text-center">
              <MessageCircle className="w-12 h-12 lg:w-16 lg:h-16 text-white/40 mx-auto mb-3 lg:mb-4" />
              <h3 className="font-['Montserrat'] text-[20px] lg:text-[24px] font-[700] text-white mb-2">Start a Conversation</h3>
              <p className="font-['Montserrat'] text-[13px] lg:text-[14px] text-white/60 max-w-md px-4">
                Select a character from the sidebar to begin chatting. Zara the Strategist is powered by AI 
                and specializes in Algorand blockchain technology.
              </p>
              {zaraCharacter && (
                <Button
                  variant="brand-primary"
                  size="medium"
                  onClick={() => {
                    setSelectedCharacter(zaraCharacter.id);
                    setShowCharacterList(false);
                  }}
                  className="mt-4"
                >
                  Chat with Zara about Algorand
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSection;