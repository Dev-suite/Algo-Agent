import { useState, useCallback, useRef } from 'react';
import { ChatMessage } from '../types';
import { geminiService } from '../services/geminiService';

// Define the structure for a Gemini conversation history entry
// These interfaces need to be consistent with what geminiService.ts expects.
interface GeminiContentPart {
  text: string;
}

interface GeminiContent {
  role: 'user' | 'model'; // Gemini distinguishes roles as 'user' or 'model'
  parts: GeminiContentPart[];
}

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

  // Use useRef to store the conversation history in Gemini's expected format.
  // This allows us to maintain a mutable reference without triggering re-renders
  // on every message update, ensuring the latest history is always available for API calls.
  // Initialize with the welcome message as a 'model' role to start the conversation history
  const conversationHistoryRef = useRef<GeminiContent[]>([
    {
      role: 'model', // The AI's initial greeting
      parts: [{ text: "Hello! I'm Zara the Strategist, your AI agent specialized in Algorand blockchain technology. I can help you with trading strategies, technical analysis, DeFi protocols, smart contracts, and everything related to the Algorand ecosystem. What would you like to discuss?" }]
    }
  ]);

  // Function to map ChatMessage to GeminiContent for API
  // This ensures the role is correctly set for Gemini API
  const mapMessageToGeminiContent = useCallback((msg: ChatMessage): GeminiContent => {
    return {
      role: msg.isUser ? 'user' : 'model',
      parts: [{ text: msg.content }],
    };
  }, []); // No dependencies as it only uses the message structure

  const sendMessage = useCallback(async (content: string, isVoice = false) => {
    const userMessage: ChatMessage = {
      // More robust ID generation using crypto.randomUUID for better uniqueness
      id: `msg-${crypto.randomUUID()}`,
      characterId,
      content,
      timestamp: new Date().toISOString(),
      isUser: true,
      isVoice
    };

    setMessages(prev => [...prev, userMessage]);
    // Add user message to conversation history for Gemini *before* the API call
    conversationHistoryRef.current = [...conversationHistoryRef.current, mapMessageToGeminiContent(userMessage)];

    setIsTyping(true);

    try {
      // Generate AI response using Gemini
      // Pass the entire conversation history to Gemini for context
      const aiResponse = await geminiService.generateResponse(
        userMessage.content, // Pass the current user's message
        "You are currently active and ready to help with Algorand-related questions and strategies.",
        conversationHistoryRef.current // Pass the current conversation history for context
      );

      const aiMessage: ChatMessage = {
        id: `msg-${crypto.randomUUID()}`, // Unique ID for AI message
        characterId,
        content: aiResponse,
        timestamp: new Date().toISOString(),
        isUser: false,
        // TODO: Integrate with a Text-to-Speech (TTS) service to generate actual audio.
        // For now, it's a mock URL or undefined if not voice.
        audioUrl: isVoice ? 'https://example.com/mock-ai-audio.mp3' : undefined
      };

      setMessages(prev => [...prev, aiMessage]);
      // Add AI message to conversation history for Gemini *after* it's generated
      conversationHistoryRef.current = [...conversationHistoryRef.current, mapMessageToGeminiContent(aiMessage)];

    } catch (error) {
      console.error('Error generating AI response:', error);

      let errorContent: string;
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
        errorContent = "⚠️ **API Quota Exceeded**: I've reached the usage limit for the Gemini API. Please check your Google Cloud project or Gemini API console for details about your plan and usage limits. You may need to upgrade your plan or wait for the quota to reset.";
      } else if (errorMessage.includes('404')) {
        errorContent = "⚠️ **Model Not Found**: There was an issue accessing the AI model. This might mean the model name is incorrect or deprecated. Please contact the administrator.";
      } else if (errorMessage.includes('safety settings')) {
        errorContent = "🚫 **Content Blocked**: Your request was flagged by the AI's safety settings. Please try rephrasing your question.";
      } else {
        errorContent = "I apologize, but I'm experiencing some technical difficulties. As your Algorand strategist, I'm here to help with blockchain analysis, trading insights, and DeFi strategies. Please try your question again.";
      }

      const errorMessageObj: ChatMessage = {
        id: `error-${crypto.randomUUID()}`, // Unique ID for error messages
        characterId,
        content: errorContent,
        timestamp: new Date().toISOString(),
        isUser: false,
      };

      setMessages(prev => [...prev, errorMessageObj]);
      // IMPORTANT: Do NOT add error messages to conversationHistoryRef.current,
      // as they are not part of the actual conversation with the AI.
    } finally {
      setIsTyping(false);
    }
  }, [characterId, mapMessageToGeminiContent]); // mapMessageToGeminiContent is a dependency because it's used inside sendMessage

  const startVoiceRecording = useCallback(() => {
    setIsRecording(true);
    // TODO: Implement actual voice recording logic (e.g., using MediaRecorder API)
    console.log("Started voice recording...");
  }, []);

  const stopVoiceRecording = useCallback(() => {
    setIsRecording(false);
    // TODO: Process recorded audio here (e.g., send to a Speech-to-Text service)
    // For now, mock the transcription and send a message
    const transcribedText = "This is a mock transcription of your voice message."; // Replace with actual transcription
    sendMessage(transcribedText, true); // Send as a voice message
    console.log("Stopped voice recording and sending mock transcription.");
  }, [sendMessage]);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        id: 'welcome',
        characterId,
        content: "Hello! I'm Zara the Strategist, your AI agent specialized in Algorand blockchain technology. I can help you with trading strategies, technical analysis, DeFi protocols, smart contracts, and everything related to the Algorand ecosystem. What would you like to discuss?",
        timestamp: new Date().toISOString(),
        isUser: false,
      }
    ]);
    // Reset conversation history to only the initial welcome message when clearing chat
    conversationHistoryRef.current = [
      {
        role: 'model',
        parts: [{ text: "Hello! I'm Zara the Strategist, your AI agent specialized in Algorand blockchain technology. I can help you with trading strategies, technical analysis, DeFi protocols, smart contracts, and everything related to the Algorand ecosystem. What would you like to discuss?" }]
      }
    ];
  }, [characterId]);

  const generateInsight = useCallback(async () => {
    setIsTyping(true);

    try {
      // geminiService.generateAlgorandInsight() does not use Gemini API directly,
      // so it won't hit rate limits unless there's an internal bug in that service.
      const insight = await geminiService.generateAlgorandInsight();

      const insightMessage: ChatMessage = {
        id: `insight-${crypto.randomUUID()}`, // Unique ID for insight message
        characterId,
        content: `💡 **Algorand Insight**: ${insight}`,
        timestamp: new Date().toISOString(),
        isUser: false,
      };

      setMessages(prev => [...prev, insightMessage]);
      // Optional: Add insights to conversation history if you want them to influence future AI responses.
      // This depends on whether an "insight" should be considered part of the AI's "memory" or just an isolated output.
      // If added, ensure its role is 'model'.
      // conversationHistoryRef.current = [...conversationHistoryRef.current, mapMessageToGeminiContent(insightMessage)];
    } catch (error) {
      console.error('Error generating insight:', error);

      let errorContent = "I apologize, but I couldn't generate an insight at the moment. Please try again later.";
      const errorMessage = error instanceof Error ? error.message : String(error);

      if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
        errorContent = "⚠️ **API Quota Exceeded**: I've reached the usage limit for the Gemini API. Please check your Google Cloud project or Gemini API console for details about your plan and usage limits.";
      }

      const errorMessageObj: ChatMessage = {
        id: `error-insight-${crypto.randomUUID()}`, // Unique ID for error messages
        characterId,
        content: errorContent,
        timestamp: new Date().toISOString(),
        isUser: false,
      };

      setMessages(prev => [...prev, errorMessageObj]);
    } finally {
      setIsTyping(false);
    }
  }, [characterId]); // No need for mapMessageToGeminiContent as insights are not added to history by default here

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