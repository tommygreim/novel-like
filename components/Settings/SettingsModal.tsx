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
    <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-2xl shadow-2xl max-w-md w-full mx-4 border border-white/20 dark:border-gray-700/30">
        <div className="border-b border-gray-200/50 dark:border-gray-700/50 px-8 py-5 bg-gradient-to-r from-white/40 to-gray-50/40 dark:from-gray-800/40 dark:to-gray-900/40 rounded-t-2xl">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Settings
          </h2>
        </div>

        <div className="px-8 py-6 space-y-5">
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
              className="w-full px-4 py-2.5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-gray-900 dark:text-gray-100 transition-all duration-200"
            />
            <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              Get your API key from{" "}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                openrouter.ai/keys
              </a>
            </p>
          </div>

          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />

          <div className="bg-blue-50/50 dark:bg-blue-900/20 backdrop-blur-sm border border-blue-200/30 dark:border-blue-800/30 rounded-xl px-4 py-3">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Your API key is stored locally in your browser
              and never sent to our servers. It's only used to authenticate with
              OpenRouter.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-200/50 dark:border-gray-700/50 px-8 py-5 flex justify-end gap-3 bg-gradient-to-r from-gray-50/40 to-white/40 dark:from-gray-900/40 dark:to-gray-800/40 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all duration-200 border border-gray-200/50 dark:border-gray-700/50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 shadow-md ${
              isSaved
                ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white"
                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            }`}
          >
            {isSaved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
