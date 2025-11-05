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
];

export default function ModelSelector({
  selectedModel,
  onModelChange,
}: ModelSelectorProps) {
  return (
    <div>
      <label
        htmlFor="model"
        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        Model
      </label>
      <select
        id="model"
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
      >
        {AVAILABLE_MODELS.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name} - {model.description}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Different models have different costs and capabilities. Check{" "}
        <a
          href="https://openrouter.ai/docs#models"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          OpenRouter docs
        </a>{" "}
        for pricing.
      </p>
    </div>
  );
}
