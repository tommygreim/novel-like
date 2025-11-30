"use client";

import { useState } from "react";

interface EditorToolbarProps {
  editor: any | null;
  maxWords: number;
  onMaxWordsChange: (value: number) => void;
}

export default function EditorToolbar({
  editor,
  maxWords,
  onMaxWordsChange,
}: EditorToolbarProps) {
  const [showMaxWordsInput, setShowMaxWordsInput] = useState(false);

  const handleMaxWordsChange = (value: number) => {
    onMaxWordsChange(value);
    localStorage.setItem("max_words", value.toString());
  };

  const handleSaveSession = () => {
    const sessionName = prompt("Enter a name for this file:") || "session";

    const sessionData = {
      content: localStorage.getItem("editor_content") || "",
      scenario: localStorage.getItem("story_scenario") || "",
      timestamp: new Date().toISOString(),
      maxWords: maxWords,
    };

    // Create a blob and download it
    const blob = new Blob([JSON.stringify(sessionData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sessionName}.novel.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadSession = () => {
    // Create a file input element
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".novel.json,.json";

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const sessionData = JSON.parse(event.target?.result as string);

          // Load the session data
          if (sessionData.content) {
            localStorage.setItem("editor_content", sessionData.content);
          }

          if (sessionData.scenario !== undefined) {
            localStorage.setItem("story_scenario", sessionData.scenario);
          }

          if (sessionData.maxWords) {
            handleMaxWordsChange(sessionData.maxWords);
          }

          alert("Session loaded successfully!");
          window.location.reload(); // Reload to update scenario
        } catch (error) {
          alert("Failed to load session file. Please check the file format.");
          console.error(error);
        }
      };

      reader.readAsText(file);
    };

    input.click();
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 px-4 md:px-8 py-3 md:py-4" style={{
      borderBottom: '1px solid rgba(229, 231, 235, 0.5)',
      background: 'linear-gradient(to right, rgba(255, 255, 255, 0.4), rgba(249, 250, 251, 0.4))',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)'
    }}>
      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
        {/* Save/Load buttons */}
        <div className="flex gap-1 sm:gap-2 p-1 flex-1 sm:flex-none" style={{
          background: 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '10px',
          border: '1px solid rgba(229, 231, 235, 0.3)'
        }}>
          <button
            onClick={handleSaveSession}
            className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 text-xs font-medium transition-all duration-200"
            style={{
              color: 'rgb(75, 85, 99)',
              borderRadius: '8px'
            }}
          >
            Save
          </button>
          <button
            onClick={handleLoadSession}
            className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 text-xs font-medium transition-all duration-200"
            style={{
              color: 'rgb(75, 85, 99)',
              borderRadius: '8px'
            }}
          >
            Load
          </button>
        </div>

        {/* Max words control */}
        <div className="flex items-center gap-2 px-3 py-1.5 text-sm" style={{
          color: 'rgb(75, 85, 99)',
          background: 'rgba(255, 255, 255, 0.3)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderRadius: '10px',
          border: '1px solid rgba(229, 231, 235, 0.3)'
        }}>
          <span className="text-xs">Max:</span>
          {showMaxWordsInput ? (
            <input
              type="number"
              value={maxWords}
              onChange={(e) => handleMaxWordsChange(parseInt(e.target.value, 10) || 150)}
              onBlur={() => setShowMaxWordsInput(false)}
              className="w-16 px-1 text-xs text-center"
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none'
              }}
              autoFocus
              min="50"
              max="500"
            />
          ) : (
            <button
              onClick={() => setShowMaxWordsInput(true)}
              className="text-xs font-medium"
              style={{ color: 'rgb(37, 99, 235)' }}
            >
              {maxWords}w
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
