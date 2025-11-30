"use client";

import { useState, useEffect } from "react";
import { ScenarioData } from "@/components/Scenario/ScenarioPanel";

interface InteractiveStoryProps {
  scenario: ScenarioData | null;
}

interface Choice {
  id: string;
  text: string;
  isCustom?: boolean;
}

interface StorySegment {
  text: string;
  timestamp: number;
}

export default function InteractiveStory({ scenario }: InteractiveStoryProps) {
  const [storySegments, setStorySegments] = useState<StorySegment[]>([]);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [isStarted, setIsStarted] = useState(false);

  // Load story from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedStory = localStorage.getItem("interactive_story");
      if (savedStory) {
        try {
          const parsed = JSON.parse(savedStory);
          setStorySegments(parsed.segments || []);
          setIsStarted(parsed.segments && parsed.segments.length > 0);
        } catch (e) {
          console.error("Failed to parse saved story:", e);
        }
      }
    }
  }, []);

  // Save story to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined" && storySegments.length > 0) {
      localStorage.setItem(
        "interactive_story",
        JSON.stringify({ segments: storySegments })
      );
    }
  }, [storySegments]);

  const getFullStoryText = () => {
    return storySegments.map(seg => seg.text).join("\n\n");
  };

  const startStory = async () => {
    setIsGenerating(true);
    try {
      const result = await generateStoryAndChoices("");

      if (result.text) {
        setStorySegments([{ text: result.text, timestamp: Date.now() }]);
        setChoices(result.choices || []);
        setIsStarted(true);
      }
    } catch (error) {
      console.error("Failed to start story:", error);
      alert(error instanceof Error ? error.message : "Failed to start story");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChoiceSelection = async (choice: Choice) => {
    if (choice.isCustom) {
      setShowCustomInput(true);
      return;
    }

    setIsGenerating(true);
    setChoices([]);

    try {
      const currentStory = getFullStoryText();
      const result = await generateStoryAndChoices(choice.text);

      if (result.text) {
        setStorySegments(prev => [
          ...prev,
          { text: result.text, timestamp: Date.now() }
        ]);
        setChoices(result.choices || []);
      }
    } catch (error) {
      console.error("Failed to continue story:", error);
      alert(error instanceof Error ? error.message : "Failed to continue story");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCustomSubmit = async () => {
    if (!customInput.trim()) return;

    setIsGenerating(true);
    setShowCustomInput(false);
    setChoices([]);

    try {
      const result = await generateStoryAndChoices(customInput);

      if (result.text) {
        setStorySegments(prev => [
          ...prev,
          { text: result.text, timestamp: Date.now() }
        ]);
        setChoices(result.choices || []);
        setCustomInput("");
      }
    } catch (error) {
      console.error("Failed to continue story:", error);
      alert(error instanceof Error ? error.message : "Failed to continue story");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateStoryAndChoices = async (userChoice: string) => {
    const apiKey = localStorage.getItem("openrouter_api_key");
    const model = localStorage.getItem("openrouter_model") || "openai/gpt-3.5-turbo";

    if (!apiKey) {
      throw new Error("Please set your OpenRouter API key in Settings");
    }

    const response = await fetch("/api/generate-interactive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentStory: getFullStoryText(),
        scenario,
        userChoice,
        apiKey,
        model,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to generate story");
    }

    return await response.json();
  };

  const resetStory = () => {
    if (confirm("Are you sure you want to start a new story? This will erase the current one.")) {
      setStorySegments([]);
      setChoices([]);
      setIsStarted(false);
      localStorage.removeItem("interactive_story");
    }
  };

  return (
    <div
      className="px-3 md:px-6 pb-8 relative min-h-[calc(100vh-12rem)]"
      style={{
        background:
          "linear-gradient(135deg, rgba(249, 250, 251, 1) 0%, rgba(239, 246, 255, 0.6) 50%, rgba(245, 243, 255, 0.6) 100%)",
      }}
    >
      <div
        className="max-w-[8.5in] mx-auto glass-panel"
        style={{
          borderRadius: "16px",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Toolbar */}
        <div
          className="px-4 md:px-8 py-3 md:py-4 flex items-center justify-between"
          style={{
            borderBottom: "1px solid rgba(229, 231, 235, 0.5)",
            background:
              "linear-gradient(to right, rgba(255, 255, 255, 0.4), rgba(249, 250, 251, 0.4))",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          <h2 className="text-base md:text-lg font-semibold" style={{ color: "rgb(55, 65, 81)" }}>
            Interactive Story
          </h2>
          {isStarted && (
            <button
              onClick={resetStory}
              className="px-3 py-1.5 text-xs font-medium transition-all duration-200"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                color: "rgb(220, 38, 38)",
                borderRadius: "8px",
                border: "1px solid rgba(220, 38, 38, 0.3)",
              }}
            >
              New Story
            </button>
          )}
        </div>

        {/* Story Display */}
        <div
          className="px-4 md:px-16 py-6 md:py-12"
          style={{ minHeight: "500px", position: "relative" }}
        >
          {!isStarted ? (
            <div className="flex flex-col items-center justify-center py-20">
              <h3
                className="text-2xl md:text-3xl font-bold mb-4 text-center"
                style={{
                  background: "linear-gradient(135deg, rgb(37, 99, 235), rgb(126, 34, 206))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Begin Your Story
              </h3>
              <p className="text-center mb-8" style={{ color: "rgb(107, 114, 128)", maxWidth: "500px" }}>
                Start an interactive adventure where you make choices that shape the narrative.
                {scenario && " Your scenario will guide the story."}
              </p>
              <button
                onClick={startStory}
                disabled={isGenerating}
                className="px-8 py-4 text-base font-medium transition-all duration-200 glass-button"
                style={{
                  borderRadius: "12px",
                  color: "white",
                  opacity: isGenerating ? 0.7 : 1,
                }}
              >
                {isGenerating ? "Starting..." : "Start Story"}
              </button>
            </div>
          ) : (
            <>
              <div
                className="story-text mb-8"
                style={{
                  fontSize: "16px",
                  lineHeight: "1.8",
                  color: "rgb(17, 24, 39)",
                }}
              >
                {storySegments.map((segment, index) => (
                  <p
                    key={segment.timestamp}
                    className="mb-6"
                    style={{
                      animation: index === storySegments.length - 1 ? "fadeIn 0.5s ease-in" : "none",
                    }}
                  >
                    {segment.text}
                  </p>
                ))}
                {isGenerating && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                    <span className="text-sm">Generating next part...</span>
                  </div>
                )}
              </div>

              {/* Choices */}
              {choices.length > 0 && !isGenerating && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold mb-3" style={{ color: "rgb(75, 85, 99)" }}>
                    What do you do?
                  </h4>
                  {choices.map((choice) => (
                    <button
                      key={choice.id}
                      onClick={() => handleChoiceSelection(choice)}
                      className="w-full px-4 py-3 text-left text-sm transition-all duration-200"
                      style={{
                        background: choice.isCustom
                          ? "linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(126, 34, 206, 0.1))"
                          : "rgba(255, 255, 255, 0.5)",
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                        border: choice.isCustom
                          ? "2px dashed rgba(126, 34, 206, 0.4)"
                          : "1px solid rgba(209, 213, 219, 0.5)",
                        borderRadius: "12px",
                        color: "rgb(17, 24, 39)",
                      }}
                    >
                      {choice.isCustom ? "✏️ " : "→ "}
                      {choice.text}
                    </button>
                  ))}
                </div>
              )}

              {/* Custom Input Modal */}
              {showCustomInput && (
                <div
                  className="fixed inset-0 flex items-center justify-center z-50 p-4"
                  style={{
                    background: "rgba(0, 0, 0, 0.4)",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                  }}
                  onClick={() => setShowCustomInput(false)}
                >
                  <div
                    className="max-w-md w-full glass-panel"
                    style={{
                      borderRadius: "16px",
                      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.2)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      className="px-4 md:px-6 py-4"
                      style={{
                        borderBottom: "1px solid rgba(229, 231, 235, 0.5)",
                      }}
                    >
                      <h3 className="text-lg font-semibold" style={{ color: "rgb(55, 65, 81)" }}>
                        What do you do?
                      </h3>
                    </div>
                    <div className="px-4 md:px-6 py-4">
                      <textarea
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="Describe your action..."
                        rows={4}
                        className="w-full px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2"
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
                    </div>
                    <div
                      className="px-4 md:px-6 py-4 flex gap-3 justify-end"
                      style={{
                        borderTop: "1px solid rgba(229, 231, 235, 0.5)",
                      }}
                    >
                      <button
                        onClick={() => setShowCustomInput(false)}
                        className="px-4 py-2 text-sm font-medium transition-all duration-200"
                        style={{
                          background: "rgba(255, 255, 255, 0.5)",
                          borderRadius: "8px",
                          color: "rgb(55, 65, 81)",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCustomSubmit}
                        disabled={!customInput.trim()}
                        className="px-4 py-2 text-sm font-medium transition-all duration-200 glass-button"
                        style={{
                          borderRadius: "8px",
                          color: "white",
                          opacity: customInput.trim() ? 1 : 0.5,
                        }}
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
