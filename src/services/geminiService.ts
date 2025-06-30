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
  // Changed to a more general models URL, specific model and method will be appended.
  private modelsBaseUrl: string = 'https://generativelanguage.googleapis.com/v1beta/models';
  private defaultModel: string = 'gemini-pro'; // Default model for generateContent

  constructor() {
    // Attempt to get the API key from environment variables.
    // Vite exposes variables prefixed with VITE_ to the client-side.
    // process.env is typically for Node.js server-side environments.
    const key = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!key) {
      // It's better to throw an error immediately during instantiation
      // if the key is critical for the service to function.
      // This prevents runtime errors deeper in the call stack.
      throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY environment variable.');
    }
    this.apiKey = key;
  }

  /**
   * Generates a response from the Gemini Pro model based on a prompt and character context.
   * @param prompt The user's question or input.
   * @param characterContext Optional additional context for the AI character.
   * @param model Optional: Specify a different Gemini model if needed (defaults to 'gemini-pro').
   * @returns A promise that resolves to the generated text response.
   * @throws An error if the API call fails or the response is invalid.
   */
  async generateResponse(
    prompt: string,
    characterContext?: string,
    model: string = this.defaultModel // Allow overriding the default model
  ): Promise<string> {
    // The constructor already checks the API key; this check is redundant if you always
    // instantiate the service. However, it provides a fallback message if the service
    // was somehow instantiated without a key and then called.
    if (!this.apiKey) {
      // This case should ideally be caught by the constructor's error,
      // but it's a safe guard.
      return "I apologize, but the AI service is not properly configured. Please contact the administrator to set up the API key.";
    }

    try {
      // Construct the full system prompt, including the character definition and user question.
      const systemPrompt = `You are Zara the Strategist, an AI agent specialized in Algorand blockchain technology. You are analytical, strategic, and competitive with expertise in:

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

User question: ${prompt}

Respond as Zara the Strategist with expertise in Algorand, providing helpful, accurate, and strategic insights.`;

      // Construct the full API URL for the specified model's generateContent method.
      const apiUrl = `${this.modelsBaseUrl}/${model}:generateContent?key=${this.apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: systemPrompt
            }]
          }],
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

      // Check if the HTTP response itself was successful (status code 2xx).
      if (!response.ok) {
        // Attempt to read the error body for more details if available
        const errorBody = await response.text();
        let errorMessage = `Gemini API error: ${response.status} ${response.statusText}`;
        try {
            const errorJson = JSON.parse(errorBody);
            // If the error body is JSON, try to extract a more specific message
            if (errorJson.error && errorJson.error.message) {
                errorMessage += ` - ${errorJson.error.message}`;
            } else {
                errorMessage += ` - ${errorBody}`; // Fallback to raw body if not a standard error JSON
            }
        } catch (e) {
            errorMessage += ` - ${errorBody}`; // If not JSON, use raw body
        }
        throw new Error(errorMessage);
      }

      // Parse the JSON response from the API.
      const data: GeminiResponse = await response.json();

      // --- Enhanced Response Validation ---
      // Check for safety blocks first
      if (data.promptFeedback && data.promptFeedback.safetyRatings) {
        const blockedCategories = data.promptFeedback.safetyRatings
          .filter(rating => rating.blocked)
          .map(rating => rating.category);

        if (blockedCategories.length > 0) {
          throw new Error(`Gemini API blocked response due to safety settings in categories: ${blockedCategories.join(', ')}`);
        }
      }

      // Validate the structure of the successful response and extract text.
      // Using optional chaining (?.) and nullish coalescing (??) for robustness.
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText) {
        return generatedText;
      } else {
        // Log the full response for debugging if it doesn't match the expected structure.
        console.error('Unexpected or empty Gemini API response structure:', JSON.stringify(data, null, 2));
        throw new Error('Gemini API returned an unexpected or empty response (no valid text found in candidates).');
      }
    } catch (error: any) { // Catch any errors thrown during the fetch or parsing process
      // Distinguish between API errors and other network/parsing errors
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Error calling Gemini API:', errorMessage);

      // Provide a user-friendly message without exposing internal errors directly to the user.
      // Customize this message based on your application's needs.
      return "I apologize, Zara the Strategist is currently facing a technical challenge and cannot provide a response. Please check your internet connection or try again later.";
    }
  }

  /**
   * Generates a random Algorand-related insight.
   * This method doesn't interact with the Gemini API; it's a local utility.
   * @returns A random string insight.
   */
  async generateAlgorandInsight(): Promise<string> {
    const insights: string[] = [ // Explicitly type as string array
      "The Algorand blockchain's Pure Proof of Stake consensus mechanism offers immediate finality and high throughput, making it ideal for DeFi applications.",
      "ALGO's tokenomics include participation rewards and governance voting, creating strong incentives for long-term holding and network participation.",
      "Algorand's carbon-negative blockchain and institutional partnerships position it well for ESG-focused investment strategies.",
      "The Algorand Virtual Machine supports both TEAL smart contracts and PyTeal for more complex applications, offering flexibility for developers.",
      "State Proofs on Algorand enable trustless cross-chain communication, which could be a significant competitive advantage in the multi-chain future."
    ];

    return insights[Math.floor(Math.random() * insights.length)];
  }
}

// Export a singleton instance of the service.
// This ensures only one instance of GeminiService is created and used throughout the application.
export const geminiService = new GeminiService();