import { useState, useCallback } from 'react';
import { ChatMessage } from '../types';
import { geminiService } from '../services/geminiService';

export const useGeminiChat = (characterId: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      characterId,
      content: "Hello! I'm Zara the Strategist, your AI agent specialized in Algorand blockchain technology. I can help you with trading strategies, technical analysis, DeFi protocols, smart contracts, and everything related to the Algorand ecosystem. What would you like to discuss?",
      timestamp: new Date().toISOString(),
      isUser: false,
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const sendMessage = useCallback(async (content: string, isVoice = false) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      characterId,
      content,
      timestamp: new Date().toISOString(),
      isUser: true,
      isVoice
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      // Generate AI response using Gemini
      const aiResponse = await geminiService.generateResponse(
        content,
        "You are currently active and ready to help with Algorand-related questions and strategies."
      );

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        characterId,
        content: aiResponse,
        timestamp: new Date().toISOString(),
        isUser: false,
        audioUrl: isVoice ? 'mock-audio-url.mp3' : undefined
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      
      let errorContent = "I apologize, but I'm experiencing some technical difficulties. As your Algorand strategist, I'm here to help with blockchain analysis, trading insights, and DeFi strategies. Please try your question again.";
      
      // Check if the error is related to API quota or rate limits
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('quota') || errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        errorContent = "⚠️ **API Quota Exceeded**: I've reached the usage limit for the Gemini API. Please check your Google Cloud project or Gemini API console for details about your plan and usage limits. You may need to upgrade your plan or wait for the quota to reset.";
      }
      
      const errorMessageObj: ChatMessage = {
        id: (Date.now() + 1).toString(),
        characterId,
        content: errorContent,
        timestamp: new Date().toISOString(),
        isUser: false,
      };

      setMessages(prev => [...prev, errorMessageObj]);
    } finally {
      setIsTyping(false);
    }
  }, [characterId]);

  const startVoiceRecording = useCallback(() => {
    setIsRecording(true);
    // Implement voice recording logic
  }, []);

  const stopVoiceRecording = useCallback(() => {
    setIsRecording(false);
    // Process recorded audio and send as message
    sendMessage("Voice message transcribed", true);
  }, [sendMessage]);

  const clearMessages = useCallback(() => {
    setMessages([{
      id: 'welcome',
      characterId,
      content: "Hello! I'm Zara the Strategist, your AI agent specialized in Algorand blockchain technology. I can help you with trading strategies, technical analysis, DeFi protocols, smart contracts, and everything related to the Algorand ecosystem. What would you like to discuss?",
      timestamp: new Date().toISOString(),
      isUser: false,
    }]);
  }, [characterId]);

  const generateInsight = useCallback(async () => {
    setIsTyping(true);
    
    try {
      const insight = await geminiService.generateAlgorandInsight();
      
      const insightMessage: ChatMessage = {
        id: Date.now().toString(),
        characterId,
        content: `💡 **Algorand Insight**: ${insight}`,
        timestamp: new Date().toISOString(),
        isUser: false,
      };

      setMessages(prev => [...prev, insightMessage]);
    } catch (error) {
      console.error('Error generating insight:', error);
      
      let errorContent = "I apologize, but I couldn't generate an insight at the moment. Please try again later.";
      
      // Check if the error is related to API quota or rate limits
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('quota') || errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        errorContent = "⚠️ **API Quota Exceeded**: I've reached the usage limit for the Gemini API. Please check your Google Cloud project or Gemini API console for details about your plan and usage limits.";
      }
      
      const errorMessageObj: ChatMessage = {
        id: Date.now().toString(),
        characterId,
        content: errorContent,
        timestamp: new Date().toISOString(),
        isUser: false,
      };

      setMessages(prev => [...prev, errorMessageObj]);
    } finally {
      setIsTyping(false);
    }
  }, [characterId]);

  return {
    messages,
    isTyping,
    isRecording,
    sendMessage,
    startVoiceRecording,
    stopVoiceRecording,
    clearMessages,
    generateInsight
  };
};