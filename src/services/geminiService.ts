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
            maxOutputTokens: 1024,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
          ]
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        let errorMessage = `Gemini API error: ${response.status} ${response.statusText}`;
        try {
            const errorJson = JSON.parse(errorBody);
            if (errorJson.error && errorJson.error.message) {
                errorMessage += ` - ${errorJson.error.message}`;
            } else {
                errorMessage += ` - ${errorBody}`;
            }
        } catch (e) {
            errorMessage += ` - ${errorBody}`;
        }
        throw new Error(errorMessage);
      }

      const data: GeminiResponse = await response.json();

      // --- Enhanced Response Validation ---
      if (data.promptFeedback && data.promptFeedback.safetyRatings) {
        const blockedCategories = data.promptFeedback.safetyRatings
          .filter(rating => rating.blocked)
          .map(rating => rating.category);

        if (blockedCategories.length > 0) {
          throw new Error(`Gemini API blocked response due to safety settings in categories: ${blockedCategories.join(', ')}`);
        }
      }

      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText) {
        return generatedText;
      } else {
        console.error('Unexpected or empty Gemini API response structure:', JSON.stringify(data, null, 2));
        throw new Error('Gemini API returned an unexpected or empty response (no valid text found in candidates).');
      }
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error calling Gemini API:', errorMessage);
      return "I apologize, Zara the Strategist is currently facing a technical challenge and cannot provide a response. Please check your internet connection or try again later.";
    }
  }

  async generateAlgorandInsight(): Promise<string> {
    const insights: string[] = [
      "The Algorand blockchain's Pure Proof of Stake consensus mechanism offers immediate finality and high throughput, making it ideal for DeFi applications.",
      "ALGO's tokenomics include participation rewards and governance voting, creating strong incentives for long-term holding and network participation.",
      "Algorand's carbon-negative blockchain and institutional partnerships position it well for ESG-focused investment strategies.",
      "The Algorand Virtual Machine supports both TEAL smart contracts and PyTeal for more complex applications, offering flexibility for developers.",
      "State Proofs on Algorand enable trustless cross-chain communication, which could be a significant competitive advantage in the multi-chain future."
    ];

    return insights[Math.floor(Math.random() * insights.length)];
  }
}

export const geminiService = new GeminiService();