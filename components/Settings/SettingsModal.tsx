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
  const [emphasisWords, setEmphasisWords] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Load saved settings from localStorage
    if (typeof window !== "undefined") {
      const savedApiKey = localStorage.getItem("openrouter_api_key") || "";
      const savedModel = localStorage.getItem("openrouter_model") || "openai/gpt-3.5-turbo";
      const savedEmphasisWords = localStorage.getItem("emphasis_words") || "";
      setApiKey(savedApiKey);
      setSelectedModel(savedModel);
      setEmphasisWords(savedEmphasisWords);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem("openrouter_api_key", apiKey);
    localStorage.setItem("openrouter_model", selectedModel);
    localStorage.setItem("emphasis_words", emphasisWords);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{
      background: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)'
    }}>
      <div className="max-w-md w-full mx-4 glass-panel" style={{
        borderRadius: '24px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)'
      }}>
        <div className="px-8 py-5" style={{
          borderBottom: '1px solid rgba(229, 231, 235, 0.5)',
          background: 'linear-gradient(to right, rgba(255, 255, 255, 0.4), rgba(249, 250, 251, 0.4))',
          borderRadius: '24px 24px 0 0'
        }}>
          <h2 className="text-xl font-semibold" style={{
            background: 'linear-gradient(135deg, rgb(37, 99, 235), rgb(126, 34, 206))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Settings
          </h2>
        </div>

        <div className="px-8 py-6 space-y-5">
          <div>
            <label
              htmlFor="apiKey"
              className="block text-sm font-medium mb-2"
              style={{ color: 'rgb(55, 65, 81)' }}
            >
              OpenRouter API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-or-v1-..."
              className="w-full px-4 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(209, 213, 219, 0.5)',
                borderRadius: '12px',
                color: 'rgb(17, 24, 39)'
              }}
            />
            <p className="mt-2 text-xs" style={{ color: 'rgb(107, 114, 128)' }}>
              Get your API key from{" "}
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline font-medium"
                style={{ color: 'rgb(37, 99, 235)' }}
              >
                openrouter.ai/keys
              </a>
            </p>
          </div>

          <ModelSelector
            selectedModel={selectedModel}
            onModelChange={setSelectedModel}
          />

          <div>
            <label
              htmlFor="emphasisWords"
              className="block text-sm font-medium mb-2"
              style={{ color: 'rgb(55, 65, 81)' }}
            >
              Emphasis Words
            </label>
            <textarea
              id="emphasisWords"
              value={emphasisWords}
              onChange={(e) => setEmphasisWords(e.target.value)}
              placeholder="Enter words separated by commas (e.g., love, heart, soul)"
              rows={3}
              className="w-full px-4 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 resize-none"
              style={{
                background: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(209, 213, 219, 0.5)',
                borderRadius: '12px',
                color: 'rgb(17, 24, 39)'
              }}
            />
            <p className="mt-2 text-xs" style={{ color: 'rgb(107, 114, 128)' }}>
              Words in this list will have a jiggling animation effect when visible in the editor.
            </p>
          </div>

          <div className="text-sm px-4 py-3" style={{
            background: 'rgba(239, 246, 255, 0.5)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(191, 219, 254, 0.3)',
            borderRadius: '12px',
            color: 'rgb(30, 64, 175)'
          }}>
            <strong>Note:</strong> Your API key is stored locally in your browser
            and never sent to our servers. It's only used to authenticate with
            OpenRouter.
          </div>
        </div>

        <div className="px-8 py-5 flex justify-end gap-3" style={{
          borderTop: '1px solid rgba(229, 231, 235, 0.5)',
          background: 'linear-gradient(to right, rgba(249, 250, 251, 0.4), rgba(255, 255, 255, 0.4))',
          borderRadius: '0 0 24px 24px'
        }}>
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium transition-all duration-200"
            style={{
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(209, 213, 219, 0.5)',
              borderRadius: '12px',
              color: 'rgb(55, 65, 81)'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 text-sm font-medium transition-all duration-200"
            style={isSaved ? {
              background: 'linear-gradient(135deg, rgb(22, 163, 74), rgb(5, 150, 105))',
              borderRadius: '12px',
              color: 'white',
              boxShadow: '0 4px 16px rgba(22, 163, 74, 0.3)'
            } : {
              background: 'linear-gradient(135deg, rgb(37, 99, 235), rgb(126, 34, 206))',
              borderRadius: '12px',
              color: 'white',
              boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)'
            }}
          >
            {isSaved ? "Saved!" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
