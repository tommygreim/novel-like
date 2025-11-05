# LLM Text Editor - Project Plan

## Project Overview

Build a web-based text editor similar to NovelAI's writing tool that allows users to write and extend text using LLM completions via OpenRouter's API. The tool provides a word-processor-like interface where users can seamlessly blend their own writing with AI-generated content.

## Core Features

### Must-Have (MVP)
1. **Rich Text Editor**: Clean, distraction-free writing environment
2. **Text Generation**: Generate 100-200 word continuations with a single button click
3. **OpenRouter Integration**: Connect to any model available through OpenRouter's API
4. **Inline Editing**: Edit, add, or remove text before/after generation
5. **API Key Management**: Secure storage and configuration of OpenRouter API keys
6. **Model Selection**: Choose from available OpenRouter models via dropdown

### Nice-to-Have (Future Enhancements)
1. **Generation Settings**: Adjustable parameters (temperature, max tokens, top-p, etc.)
2. **Multiple Generation Options**: Generate several variations and choose the best one
3. **Undo/Redo**: Full history management for text changes
4. **Export Options**: Export to .txt, .docx, .md formats
5. **Save/Load Projects**: Persist work locally or in cloud storage
6. **Custom Prompts**: System prompts or style instructions for generation
7. **Token Counter**: Display token usage and cost estimates
8. **Dark/Light Mode**: Theme customization
9. **Highlight Generated Text**: Visually distinguish AI-generated vs. user-written content
10. **Streaming Responses**: Show text as it's being generated

## Technology Stack

### Frontend
- **Framework**: React with TypeScript (or Next.js for SSR/API routes)
- **Text Editor**:
  - Option 1: ProseMirror (powerful, flexible, steep learning curve)
  - Option 2: Slate.js (React-friendly, good documentation)
  - Option 3: TipTap (ProseMirror wrapper, easier to use)
  - Recommendation: **TipTap** for balance of features and ease-of-use
- **UI Library**: Tailwind CSS + shadcn/ui for clean, accessible components
- **State Management**: React Context or Zustand for app state
- **HTTP Client**: Fetch API or Axios for OpenRouter API calls

### Backend (Optional)
- **Option 1**: Client-side only (API key stored in browser)
- **Option 2**: Next.js API routes (proxy OpenRouter requests)
- **Option 3**: Express/Fastify backend (for more complex features)
- Recommendation: Start with **Next.js API routes** for security and scalability

### Development Tools
- **Build Tool**: Vite or Next.js built-in tooling
- **Package Manager**: npm or pnpm
- **Linting/Formatting**: ESLint + Prettier
- **Testing**: Vitest + React Testing Library

## Architecture Design

### Component Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main editor page
│   └── api/
│       └── generate/
│           └── route.ts        # OpenRouter API proxy
├── components/
│   ├── Editor/
│   │   ├── Editor.tsx          # Main editor component
│   │   ├── EditorToolbar.tsx   # Toolbar with generate button
│   │   └── EditorContent.tsx   # Text editing area
│   ├── Settings/
│   │   ├── SettingsModal.tsx   # Settings dialog
│   │   ├── APIKeyInput.tsx     # API key configuration
│   │   └── ModelSelector.tsx   # Model selection dropdown
│   └── UI/
│       ├── Button.tsx          # Reusable button component
│       ├── Modal.tsx           # Modal dialog component
│       └── LoadingSpinner.tsx  # Loading indicator
├── lib/
│   ├── openrouter.ts           # OpenRouter API client
│   ├── storage.ts              # LocalStorage utilities
│   └── types.ts                # TypeScript type definitions
├── hooks/
│   ├── useEditor.ts            # Editor state management
│   ├── useGeneration.ts        # Text generation logic
│   └── useSettings.ts          # Settings management
└── styles/
    └── globals.css             # Global styles
```

### Data Flow

1. **User writes text** → Editor state updates
2. **User clicks "Generate"** button → Triggers generation function
3. **Generation function**:
   - Extracts current text/context
   - Retrieves API key and model selection from settings
   - Sends request to OpenRouter via API proxy
4. **API proxy** (server-side):
   - Validates request
   - Adds authentication headers
   - Forwards to OpenRouter API
   - Returns response to client
5. **Client receives response** → Appends generated text to editor
6. **User can edit** → Cycle continues

## Implementation Phases

### Phase 1: Project Setup (Week 1)
- [ ] Initialize Next.js project with TypeScript
- [ ] Set up TipTap editor with basic configuration
- [ ] Install and configure Tailwind CSS + shadcn/ui
- [ ] Create basic layout and routing structure
- [ ] Set up environment variables for API configuration

### Phase 2: Core Editor (Week 1-2)
- [ ] Implement TipTap editor with essential features:
  - Basic text formatting (bold, italic, etc.)
  - Paragraph handling
  - Proper focus and cursor management
- [ ] Create editor toolbar component
- [ ] Implement word/character count display
- [ ] Add basic styling for distraction-free writing

### Phase 3: OpenRouter Integration (Week 2)
- [ ] Create OpenRouter API client library
- [ ] Implement Next.js API route for proxying requests
- [ ] Add error handling and retry logic
- [ ] Test with different OpenRouter models
- [ ] Handle API rate limits and errors gracefully

### Phase 4: Text Generation (Week 2-3)
- [ ] Implement generation button and loading states
- [ ] Create logic to extract context (last N tokens)
- [ ] Append generated text to editor seamlessly
- [ ] Handle cursor positioning after generation
- [ ] Add generation cancellation support

### Phase 5: Settings & Configuration (Week 3)
- [ ] Create settings modal component
- [ ] Implement API key input with secure storage
- [ ] Add model selector with available models
- [ ] Create generation parameters controls:
  - Max tokens slider
  - Temperature slider
  - Top-p slider
- [ ] Persist settings in localStorage

### Phase 6: Polish & UX Improvements (Week 4)
- [ ] Add keyboard shortcuts (e.g., Ctrl+Enter to generate)
- [ ] Implement loading indicators and animations
- [ ] Add error messages and user feedback
- [ ] Create onboarding/welcome screen
- [ ] Optimize performance and responsiveness

### Phase 7: Advanced Features (Future)
- [ ] Multiple generation variations
- [ ] Undo/redo with generation history
- [ ] Export functionality
- [ ] Save/load projects
- [ ] Token usage tracking and cost estimation
- [ ] Streaming text generation
- [ ] Custom system prompts

## OpenRouter API Integration

### API Endpoint
```
POST https://openrouter.ai/api/v1/chat/completions
```

### Request Format
```typescript
{
  "model": "anthropic/claude-3.5-sonnet",
  "messages": [
    {
      "role": "user",
      "content": "The text to continue..."
    }
  ],
  "max_tokens": 200,
  "temperature": 0.7,
  "top_p": 1.0
}
```

### Headers
```typescript
{
  "Authorization": "Bearer YOUR_API_KEY",
  "HTTP-Referer": "YOUR_SITE_URL",
  "X-Title": "Novel-Like Editor"
}
```

### Response Format
```typescript
{
  "id": "gen-xxx",
  "choices": [
    {
      "message": {
        "role": "assistant",
        "content": "Generated continuation..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 100,
    "completion_tokens": 150,
    "total_tokens": 250
  }
}
```

## Key Design Considerations

### Context Window Management
- Extract last N characters/tokens as context (e.g., last 2000-4000 tokens)
- Ensure we don't exceed model's context limit
- Consider a sliding window approach for very long documents

### Prompt Engineering
- For creative writing, use minimal system prompts
- Consider: "Continue the following story naturally and maintain the writing style:"
- Allow users to customize the system prompt for different use cases

### User Experience
- **Seamless Integration**: Generated text should flow naturally from existing content
- **Clear Feedback**: Show loading state, errors, and success clearly
- **Keyboard-First**: Support keyboard shortcuts for power users
- **Autosave**: Prevent data loss with periodic autosaving to localStorage

### Performance
- Debounce autosave operations
- Lazy load settings and configuration
- Optimize editor re-renders
- Consider virtualization for very long documents

### Security
- **Never expose API keys**: Use server-side proxy for API calls
- **Validate inputs**: Sanitize user input before sending to API
- **Rate limiting**: Implement client-side rate limiting to prevent abuse
- **CORS**: Configure proper CORS headers for API routes

## Testing Strategy

### Unit Tests
- Editor state management hooks
- OpenRouter API client functions
- Text extraction and context window logic
- Settings persistence utilities

### Integration Tests
- Editor with toolbar interactions
- Settings modal save/load flow
- API proxy request/response handling

### E2E Tests
- Complete generation workflow
- Error handling scenarios
- Settings configuration

### Manual Testing Checklist
- [ ] Text generation works with various models
- [ ] Generated text maintains style and coherence
- [ ] Editor handles large documents (>10k words)
- [ ] Settings persist across sessions
- [ ] Error states display helpful messages
- [ ] Keyboard shortcuts work correctly

## Deployment

### Hosting Options
1. **Vercel** (Recommended for Next.js)
   - Zero-config deployment
   - Automatic HTTPS
   - Edge functions for API routes
   - Free tier available

2. **Netlify**
   - Similar to Vercel
   - Good CI/CD integration

3. **Self-hosted**
   - Docker container
   - Node.js server

### Environment Variables
```env
OPENROUTER_API_KEY=       # Optional server-side key
NEXT_PUBLIC_APP_URL=      # For OpenRouter HTTP-Referer
```

### Build Process
```bash
npm run build
npm run start
```

## Success Metrics

### MVP Success Criteria
- [ ] Users can write and edit text smoothly
- [ ] Generate button produces coherent continuations
- [ ] Multiple OpenRouter models are supported
- [ ] Settings are saved and persist
- [ ] Application is responsive and performant

### Future Goals
- User retention and engagement metrics
- Average session length
- Generation success rate (user keeps vs. regenerates)
- Model usage patterns
- Cost per generation

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| API key exposure | High | Use server-side proxy, never expose keys in client |
| API costs | Medium | Implement rate limiting, show cost estimates |
| Poor generation quality | High | Allow model selection, adjustable parameters |
| Performance issues | Medium | Optimize editor, implement debouncing |
| Data loss | High | Implement autosave, local storage backup |

## Resources & References

### Documentation
- [OpenRouter API Docs](https://openrouter.ai/docs)
- [TipTap Documentation](https://tiptap.dev)
- [Next.js Documentation](https://nextjs.org/docs)

### Inspiration
- NovelAI's Kayra text editor
- Sudowrite
- ChatGPT's text generation interface

### Libraries to Consider
- `@tiptap/react` - Rich text editor
- `@tiptap/starter-kit` - Essential editor extensions
- `zustand` - Lightweight state management
- `react-hot-toast` - Toast notifications
- `lucide-react` - Icon library

## Timeline Estimate

- **MVP (Phases 1-5)**: 3-4 weeks
- **Polish (Phase 6)**: 1 week
- **Advanced Features (Phase 7)**: Ongoing

Total for production-ready MVP: **4-5 weeks** (single developer, part-time)

## Next Steps

1. Review and approve this plan
2. Set up development environment
3. Initialize Next.js project
4. Begin Phase 1 implementation
5. Iterate based on testing and feedback
