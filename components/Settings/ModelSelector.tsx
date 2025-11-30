"use client";

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (model: string) => void;
}

// Popular models available on OpenRouter
const AVAILABLE_MODELS = [
  {
    id: "openai/gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    description: "Fast and affordable",
  },
  {
    id: "openai/gpt-4-turbo",
    name: "GPT-4 Turbo",
    description: "More capable, higher quality",
  },
  {
    id: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    description: "Fast and efficient",
  },
  {
    id: "anthropic/claude-3-sonnet",
    name: "Claude 3 Sonnet",
    description: "Balanced performance",
  },
  {
    id: "anthropic/claude-3-opus",
    name: "Claude 3 Opus",
    description: "Most capable",
  },
  {
    id: "google/gemini-pro",
    name: "Gemini Pro",
    description: "Google's powerful model",
  },
  {
    id: "meta-llama/llama-3-70b-instruct",
    name: "Llama 3 70B",
    description: "Open source, high quality",
  },
  {
    id: "mistralai/mixtral-8x7b-instruct",
    name: "Mixtral 8x7B",
    description: "Fast mixture of experts",
  },
  {
    id: "x-ai/grok-4-fast",
    name: "xAI: Grok 4 Fast",
    description: "2M Context Window",
  },
];

export default function ModelSelector({
  selectedModel,
  onModelChange,
}: ModelSelectorProps) {
  return (
    <div>
      <label
        htmlFor="model"
        className="block text-sm font-medium mb-2"
        style={{ color: 'rgb(55, 65, 81)' }}
      >
        Model
      </label>
      <select
        id="model"
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        className="w-full px-4 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2"
        style={{
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(209, 213, 219, 0.5)',
          borderRadius: '12px',
          color: 'rgb(17, 24, 39)'
        }}
      >
        {AVAILABLE_MODELS.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name} - {model.description}
          </option>
        ))}
      </select>
      <p className="mt-2 text-xs" style={{ color: 'rgb(107, 114, 128)' }}>
        Different models have different costs and capabilities. Check{" "}
        <a
          href="https://openrouter.ai/docs#models"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline font-medium"
          style={{ color: 'rgb(37, 99, 235)' }}
        >
          OpenRouter docs
        </a>{" "}
        for pricing.
      </p>
    </div>
  );
}
