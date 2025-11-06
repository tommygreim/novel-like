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
    <div className="px-6 py-8 min-h-[calc(100vh-12rem)]">
      <div className="max-w-[8.5in] mx-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 dark:border-gray-700/30 overflow-hidden">
        <div className="px-16 py-12">
          <label
            htmlFor="scenario"
            className="block text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4"
          >
            Story Scenario
          </label>
          <textarea
            id="scenario"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            placeholder="Describe your story's setting, plot, tone, characters, writing style, and any other context that will help the AI maintain consistency with your vision..."
            rows={20}
            className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-gray-900 dark:text-gray-100 resize-none transition-all duration-200"
          />
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 bg-blue-50/50 dark:bg-blue-900/20 backdrop-blur-sm border border-blue-200/30 dark:border-blue-800/30 rounded-xl px-4 py-3">
            <strong>Tip:</strong> This information will be included with each generation request to help the AI maintain consistency with your story's context, characters, and style.
          </p>
        </div>
      </div>
    </div>
  );
}
