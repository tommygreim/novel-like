"use client";

import { useState, useEffect } from "react";

export type ScenarioData = string;

export interface ScenarioPanelProps {
  onScenarioChange?: (scenario: ScenarioData) => void;
}

export default function ScenarioPanel({ onScenarioChange }: ScenarioPanelProps) {
  const [scenario, setScenario] = useState<string>("");

  // Load scenario from localStorage on mount
  useEffect(() => {
    const savedScenario = localStorage.getItem("story_scenario");
    if (savedScenario) {
      setScenario(savedScenario);
    }
  }, []);

  // Save scenario to localStorage and notify parent when it changes
  useEffect(() => {
    localStorage.setItem("story_scenario", scenario);
    if (onScenarioChange) {
      onScenarioChange(scenario);
    }
  }, [scenario, onScenarioChange]);

  return (
    <div className="px-3 md:px-6 py-6 md:py-8 min-h-[calc(100vh-12rem)]" style={{
      background: 'linear-gradient(135deg, rgba(249, 250, 251, 1) 0%, rgba(239, 246, 255, 0.6) 50%, rgba(245, 243, 255, 0.6) 100%)'
    }}>
      <div className="max-w-[8.5in] mx-auto glass-panel" style={{
        borderRadius: '16px',
        overflow: 'hidden'
      }}>
        <div className="px-4 md:px-16 py-6 md:py-12">
          <label
            htmlFor="scenario"
            className="block text-base md:text-lg font-semibold mb-3 md:mb-4"
            style={{
              background: 'linear-gradient(135deg, rgb(37, 99, 235), rgb(126, 34, 206))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            Story Scenario
          </label>
          <textarea
            id="scenario"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            placeholder="Enter your story's complete scenario here. This can include the setting, historical context, characters, tone, plot details, and any other information that will help the AI understand and maintain consistency with your vision. This text will be passed directly to the LLM alongside your story text to provide context for generation."
            rows={15}
            style={{
              background: 'rgba(255, 255, 255, 0.5)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(209, 213, 219, 0.5)',
              borderRadius: '12px',
              fontSize: '14px',
              lineHeight: '1.6'
            }}
            className="w-full px-3 md:px-4 py-2 md:py-3 text-gray-900 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
          />
          <p className="mt-3 md:mt-4 text-xs md:text-sm text-gray-600 dark:text-gray-400" style={{
            background: 'rgba(239, 246, 255, 0.5)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(191, 219, 254, 0.3)',
            borderRadius: '16px',
            padding: '12px 16px'
          }}>
            <strong>Tip:</strong> This scenario text will be included with each generation request to help the AI maintain consistency with your story's world, characters, and context.
          </p>
        </div>
      </div>
    </div>
  );
}
