interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

class GeminiService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    // Use environment variable for API key, with fallback message
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  }

  async generateResponse(prompt: string, characterContext?: string): Promise<string> {
    try {
      // Check if API key is available
      if (!this.apiKey) {
        return "I apologize, but the Gemini API key is not configured. Please set up your VITE_GEMINI_API_KEY environment variable with a valid Google AI Studio API key to enable AI responses.";
      }

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

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
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
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        
        if (response.status === 404) {
          return "I apologize, but there's an issue with the API configuration. The API key may be invalid or expired. Please check your Gemini API key in Google AI Studio and update the VITE_GEMINI_API_KEY environment variable.";
        } else if (response.status === 403) {
          return "I apologize, but the API key doesn't have permission to access this service. Please check your API key permissions in Google AI Studio.";
        } else if (response.status === 429) {
          return "I apologize, but we've hit the API rate limit. Please try again in a moment.";
        } else {
          return `I apologize, but I'm experiencing technical difficulties (Error ${response.status}). Please try again later.`;
        }
      }

      const data: GeminiResponse = await response.json();
      
      if (data.candidates && data.candidates.length > 0) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('No response generated');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      if (error instanceof Error && error.message.includes('fetch')) {
        return "I apologize, but I'm having trouble connecting to the AI service. Please check your internet connection and try again.";
      }
      return "I apologize, but I'm having trouble connecting right now. As Zara the Strategist, I'm always ready to discuss Algorand blockchain technology, trading strategies, and market analysis. Please try your question again.";
    }
  }

  async generateAlgorandInsight(): Promise<string> {
    const insights = [
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