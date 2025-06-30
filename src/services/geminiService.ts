// Define an interface for the expected structure of the Gemini API response
// Added optional chaining for nested properties for more robust type checking
interface GeminiResponse {
  candidates?: Array<{ // 'candidates' might be optional if no response is generated
    content?: { // 'content' might be optional
      parts?: Array<{ // 'parts' might be optional
        text?: string; // 'text' might be optional or undefined
      }>;
    };
  }>;
  // Gemini API might return other fields like 'promptFeedback' or 'safetyRatings'
  // It's good practice to include them if you plan to use them for more detailed error handling or UI feedback.
  promptFeedback?: {
    safetyRatings?: Array<{
      category: string;
      probability: string;
      blocked?: boolean; // Indicate if a category was blocked
    }>;
  };
}

// *** NEW INTERFACES FOR CONVERSATION HISTORY ***
// These match the 'contents' array structure expected by Gemini API for multi-turn conversations.
interface GeminiContentPart {
  text: string;
}

interface GeminiContent {
  role: 'user' | 'model'; // Gemini distinguishes roles as 'user' or 'model'
  parts: GeminiContentPart[];
}

/**
 * Service to interact with the Google Gemini API.
 * Follows best practices for API key management and error handling.
 *
 * IMPORTANT SECURITY NOTE:
 * For production client-side applications, it is HIGHLY RECOMMENDED
 * to route all API calls through a secure backend proxy server.
 * This ensures your API key is never exposed in the client-side bundle.
 * This current setup using VITE_GEMINI_API_KEY is suitable for development
 * and simple demos, but not for production unless you have strong
 * API key restrictions (e.g., IP whitelist to your proxy).
 */
class GeminiService {
  private apiKey: string;
  // Base URL for the Gemini models API
  private modelsBaseUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models';

  // IMPORTANT: Update the default model name if 'gemini-1.5-pro' is still causing 404s.
  // The error "models/gemini-pro is not found for API version v1beta" indicates an issue
  // with the model name or version. 'gemini-1.5-pro' is generally current, but
  // if you have specific regional limitations or project settings,
  // you might need 'gemini-1.5-flash', 'gemini-1.5-pro-latest', or similar.
  private defaultModel: string = 'gemini-1.5-pro';

  constructor() {
    const key = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!key) {
      throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY environment variable.');
    }
    this.apiKey = key;
  }

  /**
   * Generates a response from the Gemini model based on a prompt and character context.
   * This version now accepts and uses conversation history for multi-turn interactions.
   *
   * @param userPrompt The user's current question or input.
   * @param characterContext Optional additional context/persona instruction for the AI character.
   * @param conversationHistory Array of previous messages in Gemini API's 'contents' format (role, parts).
   * @param model Optional: Specify a different Gemini model if needed (defaults to 'gemini-1.5-pro').
   * @returns A promise that resolves to the generated text response.
   * @throws An error if the API call fails or the response is invalid.
   */
  async generateResponse(
    userPrompt: string,
    characterContext?: string,
    conversationHistory: GeminiContent[] = [], // *** ADDED: Accepts conversation history ***
    model: string = this.defaultModel
  ): Promise<string> {
    if (!this.apiKey) {
      return "I apologize, but the AI service is not properly configured. Please contact the administrator to set up the API key.";
    }

    try {
      // Define the system instruction as a GeminiContent object
      const systemInstruction: GeminiContent = {
        role: 'user', // System instructions for persona often go under the 'user' role at the beginning of the conversation.
        parts: [{ text: `You are Zara the Strategist, an AI agent specialized in Algorand blockchain technology. You are analytical, strategic, and competitive with expertise in:

- Algorand blockchain architecture and consensus mechanism
- Smart contracts and DeFi on Algorand
- Algorand Standard Assets (ASAs)
- Algorand Virtual Machine (AVM)
- Algorand ecosystem projects and partnerships
- Trading strategies and market analysis for ALGO
- Technical analysis and blockchain metrics
- Algorand governance and tokenomics

Character traits:
- Analytical and data-driven in responses
- Strategic thinking with competitive edge
- Professional but engaging communication style
- Focus on actionable insights and practical advice
- Deep knowledge of blockchain technology and crypto markets

${characterContext ? `Additional context: ${characterContext}` : ''}
` }]
      };

      // Construct the full 'contents' array for the API request.
      // It starts with the system instruction, followed by the conversation history,
      // and finally the current user prompt.
      // IMPORTANT: The Gemini API expects alternating roles (user, model, user, model...).
      // Ensure `conversationHistory` already adheres to this if you're building it from scratch.
      // If the `conversationHistory` might not be perfectly alternating (e.g., if you only store user prompts),
      // you might need more complex logic here to ensure the correct structure for the API.
      const fullContents: GeminiContent[] = [
        systemInstruction,
        ...conversationHistory, // Include the existing conversation history
        { role: 'user', parts: [{ text: userPrompt }] } // Add the current user's message
      ];

      const apiUrl = `${this.modelsBaseUrl}/${model}:generateContent?key=${this.apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: fullContents, // *** THIS IS THE KEY CHANGE - sending the full conversation ***
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,