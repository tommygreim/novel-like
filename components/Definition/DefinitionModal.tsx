"use client";

import { useState, useEffect } from "react";

interface DefinitionModalProps {
  isOpen: boolean;
  word: string;
  existingDefinition?: string;
  context?: string;
  onClose: () => void;
  onSave: (word: string, definition: string) => void;
}

export default function DefinitionModal({
  isOpen,
  word,
  existingDefinition = "",
  context = "",
  onClose,
  onSave,
}: DefinitionModalProps) {
  const [definition, setDefinition] = useState(existingDefinition);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setDefinition(existingDefinition);
  }, [existingDefinition, isOpen]);

  const handleSave = () => {
    if (definition.trim()) {
      onSave(word, definition.trim());
      setDefinition("");
      onClose();
    }
  };

  const handleDelete = () => {
    onSave(word, "");
    setDefinition("");
    onClose();
  };

  const handleGenerate = async () => {
    if (!context || isGenerating) return;

    setIsGenerating(true);

    try {
      // Get API key and model from localStorage
      const apiKey = localStorage.getItem("openrouter_api_key");
      const model = localStorage.getItem("openrouter_model") || "openai/gpt-3.5-turbo";

      if (!apiKey) {
        alert("Please set your OpenRouter API key in Settings");
        setIsGenerating(false);
        return;
      }

      // Build prompt for definition generation
      const prompt = `Based on the following story text, provide a brief description (1-2 sentences) of the word/name "${word}" as it appears in this context. Only provide the description, no preamble or explanation:\n\n${context}`;

      // Call OpenRouter API directly
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
          "X-Title": "Novel-Like Editor",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || "Failed to generate definition");
      }

      const data = await response.json();
      const generatedDefinition = data.choices?.[0]?.message?.content?.trim() || "";

      if (generatedDefinition) {
        setDefinition(generatedDefinition);
      } else {
        alert("Failed to generate definition");
      }
    } catch (error) {
      console.error("Definition generation error:", error);
      alert(error instanceof Error ? error.message : "Failed to generate definition");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        background: "rgba(0, 0, 0, 0.4)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
      onClick={onClose}
    >
      <div
        className="max-w-md w-full mx-4 glass-panel"
        style={{
          borderRadius: "24px",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-8 py-5"
          style={{
            borderBottom: "1px solid rgba(229, 231, 235, 0.5)",
            background:
              "linear-gradient(to right, rgba(255, 255, 255, 0.4), rgba(249, 250, 251, 0.4))",
            borderRadius: "24px 24px 0 0",
          }}
        >
          <h2
            className="text-xl font-semibold"
            style={{
              background:
                "linear-gradient(135deg, rgb(37, 99, 235), rgb(126, 34, 206))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Define "{word}"
          </h2>
        </div>

        <div className="px-8 py-6 space-y-5">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label
                htmlFor="definition"
                className="text-sm font-medium"
                style={{ color: "rgb(55, 65, 81)" }}
              >
                Definition
              </label>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !context}
                className="px-3 py-1.5 text-xs font-medium transition-all duration-200"
                style={{
                  background: isGenerating || !context
                    ? "rgba(156, 163, 175, 0.5)"
                    : "linear-gradient(135deg, rgb(99, 102, 241), rgb(168, 85, 247))",
                  borderRadius: "8px",
                  color: "white",
                  boxShadow: isGenerating || !context ? "none" : "0 2px 8px rgba(99, 102, 241, 0.3)",
                  cursor: isGenerating || !context ? "not-allowed" : "pointer",
                }}
              >
                {isGenerating ? (
                  <span className="flex items-center gap-1">
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  "Generate"
                )}
              </button>
            </div>
            <textarea
              id="definition"
              value={definition}
              onChange={(e) => setDefinition(e.target.value)}
              placeholder="Enter a description for this word..."
              rows={4}
              className="w-full px-4 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 resize-none"
              style={{
                background: "rgba(255, 255, 255, 0.5)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(209, 213, 219, 0.5)",
                borderRadius: "12px",
                color: "rgb(17, 24, 39)",
              }}
              autoFocus
              disabled={isGenerating}
            />
            <p className="mt-2 text-xs" style={{ color: "rgb(107, 114, 128)" }}>
              This definition will be shown when you click the word and passed to the LLM for context.
            </p>
          </div>
        </div>

        <div
          className="px-8 py-5 flex justify-between gap-3"
          style={{
            borderTop: "1px solid rgba(229, 231, 235, 0.5)",
            background:
              "linear-gradient(to right, rgba(249, 250, 251, 0.4), rgba(255, 255, 255, 0.4))",
            borderRadius: "0 0 24px 24px",
          }}
        >
          {existingDefinition && (
            <button
              onClick={handleDelete}
              className="px-5 py-2.5 text-sm font-medium transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, rgb(239, 68, 68), rgb(220, 38, 38))",
                borderRadius: "12px",
                color: "white",
                boxShadow: "0 4px 16px rgba(239, 68, 68, 0.3)",
              }}
            >
              Delete
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium transition-all duration-200"
            style={{
              background: "rgba(255, 255, 255, 0.5)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
              border: "1px solid rgba(209, 213, 219, 0.5)",
              borderRadius: "12px",
              color: "rgb(55, 65, 81)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!definition.trim()}
            className="px-5 py-2.5 text-sm font-medium transition-all duration-200"
            style={{
              background: definition.trim()
                ? "linear-gradient(135deg, rgb(37, 99, 235), rgb(126, 34, 206))"
                : "rgba(156, 163, 175, 0.5)",
              borderRadius: "12px",
              color: "white",
              boxShadow: definition.trim()
                ? "0 4px 16px rgba(59, 130, 246, 0.3)"
                : "none",
              cursor: definition.trim() ? "pointer" : "not-allowed",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
