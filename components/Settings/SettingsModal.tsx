"use client";

import { useState, useEffect } from "react";
import ModelSelector from "./ModelSelector";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("openai/gpt-3.5-turbo");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Load saved settings from localStorage
    if (typeof window !== "undefined") {
      const savedApiKey = localStorage.getItem("openrouter_api_key") || "";
      const savedModel = localStorage.getItem("openrouter_model") || "openai/gpt-3.5-turbo";
      setApiKey(savedApiKey);
      setSelectedModel(savedModel);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem("openrouter_api_key", apiKey);
    localStorage.setItem("openrouter_model", selectedModel);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Settings
          </h2>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label
              htmlFor="apiKey"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              OpenRouter API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Get your API key from{" "}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                openrouter.ai/keys
              </a>
            </p>
          </div>

          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Your API key is stored locally in your browser
              and never sent to our servers. It's only used to authenticate with
              OpenRouter.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              isSaved
                ? "bg-green-600 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {isSaved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
