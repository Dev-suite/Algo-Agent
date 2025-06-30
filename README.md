# Chain Agent - Decentralized AI Agent Launchpad

Create, tokenize, and deploy AI agents on the Algorand blockchain. Build social influencers, AI companions, and game masters with our no-code platform.

## Features

- **AI-Powered Agents**: Create intelligent agents with specialized knowledge
- **Blockchain Integration**: Deploy agents on Algorand with tokenization
- **Interactive Chat**: Real-time conversations with AI agents
- **Marketplace**: Discover and trade AI agents
- **Gaming Integration**: Use agents in various games and challenges

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chain-agent-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Environment Variables

#### Required for AI Features

- `VITE_GEMINI_API_KEY`: Your Google Gemini API key for AI-powered conversations
  - Get your API key from: https://makersuite.google.com/app/apikey
  - This enables Zara the Strategist's Algorand expertise

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## AI Agent Features

### Zara the Strategist

Our flagship AI agent powered by Google Gemini, specializing in:

- Algorand blockchain technology
- DeFi strategies and analysis  
- Smart contract insights
- Trading strategies
- Market analysis

## Security Notes

- API keys are managed through environment variables
- For production deployments, consider using a backend proxy to avoid exposing API keys to the client
- The `VITE_` prefix exposes variables to the client-side bundle

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.