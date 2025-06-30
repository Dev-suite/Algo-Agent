import { useState, useEffect } from 'react';
import { Character } from '../types';

const mockCharacters: Character[] = [
  {
    id: '1',
    name: 'Zara the Strategist',
    avatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=400',
    personality: 'Analytical, Strategic, Competitive',
    backstory: 'A former military tactician turned AI game master specializing in Algorand blockchain technology',
    skills: ['Algorand Analysis', 'DeFi Strategy', 'Technical Analysis', 'Smart Contracts', 'Trading'],
    level: 42,
    experience: 15680,
    status: 'active',
    lastActivity: '2 minutes ago',
    voiceId: 'zara_voice_001',
    walletAddress: 'ALGO1234...ABCD',
    tokenBalance: 1250.75,
    gamesPlayed: 127,
    winRate: 78.5,
    createdAt: '2024-01-15',
    agentType: 'companion',
    traits: {
      intelligence: 95,
      creativity: 72,
      humor: 45,
      empathy: 68,
      aggression: 85
    }
  },
  {
    id: '2',
    name: 'Echo the Explorer',
    avatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
    personality: 'Curious, Adventurous, Optimistic',
    backstory: 'An interdimensional traveler with vast knowledge',
    skills: ['Exploration', 'Puzzle Solving', 'Communication'],
    level: 38,
    experience: 12450,
    status: 'training',
    lastActivity: '15 minutes ago',
    voiceId: 'echo_voice_002',
    walletAddress: 'ALGO5678...EFGH',
    tokenBalance: 890.25,
    gamesPlayed: 89,
    winRate: 65.2,
    createdAt: '2024-01-10',
    agentType: 'companion',
    traits: {
      intelligence: 88,
      creativity: 92,
      humor: 85,
      empathy: 90,
      aggression: 25
    }
  },
  {
    id: '3',
    name: 'Vex the Trickster',
    avatar: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400',
    personality: 'Mischievous, Clever, Unpredictable',
    backstory: 'A chaotic entity who loves games and pranks',
    skills: ['Deception', 'Quick Thinking', 'Adaptation'],
    level: 35,
    experience: 9875,
    status: 'idle',
    lastActivity: '1 hour ago',
    voiceId: 'vex_voice_003',
    walletAddress: 'ALGO9012...IJKL',
    tokenBalance: 567.50,
    gamesPlayed: 156,
    winRate: 52.8,
    createdAt: '2024-01-05',
    agentType: 'gamemaster',
    traits: {
      intelligence: 82,
      creativity: 95,
      humor: 98,
      empathy: 45,
      aggression: 70
    }
  }
];

export const useCharacters = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load characters from localStorage or use mock data
    const loadCharacters = () => {
      try {
        const stored = localStorage.getItem('chainAgentCharacters');
        if (stored) {
          const parsedCharacters = JSON.parse(stored);
          setCharacters(parsedCharacters);
        } else {
          setCharacters(mockCharacters);
          localStorage.setItem('chainAgentCharacters', JSON.stringify(mockCharacters));
        }
      } catch (error) {
        console.error('Failed to load characters:', error);
        setCharacters(mockCharacters);
      } finally {
        setLoading(false);
      }
    };

    // Simulate loading delay
    setTimeout(loadCharacters, 1000);
  }, []);

  const saveCharacters = (newCharacters: Character[]) => {
    try {
      localStorage.setItem('chainAgentCharacters', JSON.stringify(newCharacters));
    } catch (error) {
      console.error('Failed to save characters:', error);
    }
  };

  const createCharacter = async (characterData: Partial<Character>): Promise<Character> => {
    // Generate unique ID
    const id = `agent_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Generate random stats based on agent type
    const generateTraits = (agentType?: string) => {
      const baseTraits = {
        intelligence: Math.floor(Math.random() * 30) + 70,
        creativity: Math.floor(Math.random() * 30) + 70,
        humor: Math.floor(Math.random() * 40) + 60,
        empathy: Math.floor(Math.random() * 40) + 60,
        aggression: Math.floor(Math.random() * 40) + 30
      };

      // Adjust traits based on agent type
      switch (agentType) {
        case 'influencer':
          baseTraits.creativity += 10;
          baseTraits.humor += 15;
          baseTraits.empathy += 10;
          break;
        case 'companion':
          baseTraits.empathy += 20;
          baseTraits.humor += 10;
          baseTraits.aggression -= 10;
          break;
        case 'gamemaster':
          baseTraits.intelligence += 15;
          baseTraits.creativity += 15;
          baseTraits.aggression += 5;
          break;
      }

      // Ensure traits don't exceed 100
      Object.keys(baseTraits).forEach(key => {
        baseTraits[key as keyof typeof baseTraits] = Math.min(100, baseTraits[key as keyof typeof baseTraits]);
      });

      return baseTraits;
    };

    const newCharacter: Character = {
      id,
      name: characterData.name || 'New Agent',
      avatar: characterData.avatar || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
      personality: characterData.personality || 'Friendly, Helpful',
      backstory: characterData.backstory || 'A newly created AI agent ready to assist and interact.',
      skills: characterData.skills || ['Communication', 'Problem Solving'],
      level: 1,
      experience: 0,
      status: 'active',
      lastActivity: 'Just created',
      voiceId: characterData.voiceId,
      walletAddress: characterData.walletAddress,
      tokenBalance: Math.floor(Math.random() * 500) + 100, // Random starting balance
      gamesPlayed: 0,
      winRate: 0,
      createdAt: new Date().toISOString().split('T')[0],
      agentType: characterData.agentType || 'companion',
      traits: generateTraits(characterData.agentType)
    };

    // Add to characters list
    const updatedCharacters = [...characters, newCharacter];
    setCharacters(updatedCharacters);
    saveCharacters(updatedCharacters);

    // Simulate blockchain deployment delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return newCharacter;
  };

  const updateCharacter = (id: string, updates: Partial<Character>) => {
    const updatedCharacters = characters.map(char => 
      char.id === id ? { ...char, ...updates } : char
    );
    setCharacters(updatedCharacters);
    saveCharacters(updatedCharacters);
  };

  const deleteCharacter = (id: string) => {
    const updatedCharacters = characters.filter(char => char.id !== id);
    setCharacters(updatedCharacters);
    saveCharacters(updatedCharacters);
  };

  const getCharacterById = (id: string): Character | undefined => {
    return characters.find(char => char.id === id);
  };

  const getCharactersByType = (type: 'influencer' | 'companion' | 'gamemaster'): Character[] => {
    return characters.filter(char => char.agentType === type);
  };

  const getActiveCharacters = (): Character[] => {
    return characters.filter(char => char.status === 'active');
  };

  return {
    characters,
    loading,
    createCharacter,
    updateCharacter,
    deleteCharacter,
    getCharacterById,
    getCharactersByType,
    getActiveCharacters
  };
};