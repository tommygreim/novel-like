"use client";

import { useState, useEffect } from "react";

interface DefinitionModalProps {
  isOpen: boolean;
  word: string;
  existingDefinition?: string;
  onClose: () => void;
  onSave: (word: string, definition: string) => void;
}

export default function DefinitionModal({
  isOpen,
  word,
  existingDefinition = "",
  onClose,
  onSave,
}: DefinitionModalProps) {
  const [definition, setDefinition] = useState(existingDefinition);

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
            <label
              htmlFor="definition"
              className="block text-sm font-medium mb-2"
              style={{ color: "rgb(55, 65, 81)" }}
            >
              Definition
            </label>
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
