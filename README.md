# Novel-Like

An AI-powered writing assistant similar to NovelAI, built with Next.js and OpenRouter. Write and extend your stories with AI assistance using any model available through OpenRouter's API.

## Features

- 📝 Clean, distraction-free writing environment
- 🤖 AI text generation via OpenRouter (100-200 words at a time)
- 🎨 Rich text editor with basic formatting (bold, italic)
- 🔧 Configurable model selection (GPT-4, Claude, Llama, etc.)
- 💾 Local storage for settings (API keys never leave your browser)
- 🌙 Dark mode support
- 📊 Word count tracking

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- An OpenRouter API key ([get one here](https://openrouter.ai/keys))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd novel-like
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Configuration

1. Click the "Settings" button in the top-right corner
2. Enter your OpenRouter API key
3. Select your preferred AI model
4. Click "Save"

Your settings are stored locally in your browser and never sent to our servers.

## Usage

1. Start writing or paste existing text into the editor
2. Click the "Generate" button to extend your text with AI
3. The AI will add 100-200 words that continue your story
4. Edit the generated text as needed
5. Continue writing and generating!

### Keyboard Shortcuts

- **Bold**: Select text and click the "B" button
- **Italic**: Select text and click the "I" button

## Available Models

The app comes pre-configured with popular models:

- GPT-3.5 Turbo (fast and affordable)
- GPT-4 Turbo (high quality)
- Claude 3 (Haiku, Sonnet, Opus)
- Gemini Pro
- Llama 3 70B
- Mixtral 8x7B

Check [OpenRouter's documentation](https://openrouter.ai/docs#models) for pricing and capabilities.

## Technology Stack

- **Framework**: Next.js 16 with TypeScript
- **Editor**: TipTap (ProseMirror-based)
- **Styling**: Tailwind CSS 4
- **API**: OpenRouter (proxy via Next.js API routes)

## Project Structure

```
novel-like/
├── app/
│   ├── api/generate/     # OpenRouter API proxy
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Main page
│   └── globals.css       # Global styles
├── components/
│   ├── Editor/           # Editor components
│   └── Settings/         # Settings modal
└── plan.md               # Detailed project plan
```

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Security

- API keys are stored in browser localStorage only
- All OpenRouter requests are proxied through Next.js API routes
- Your API key is never exposed in client-side code
- No data is collected or sent to third-party servers (except OpenRouter)

## Roadmap

See [plan.md](./plan.md) for the complete project roadmap. Future enhancements include:

- Streaming text generation
- Multiple generation variations
- Advanced settings (temperature, top-p, etc.)
- Export to various formats (.txt, .docx, .md)
- Save/load projects
- Token usage and cost tracking
- Custom system prompts

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Acknowledgments

- Inspired by NovelAI's writing interface
- Built with [TipTap](https://tiptap.dev)
- Powered by [OpenRouter](https://openrouter.ai)