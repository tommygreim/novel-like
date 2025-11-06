"use client";

import { useState, useEffect } from "react";

interface ScenarioData {
  description: string;
  tone: string;
  characters: string;
  writingStyle: string;
}

export interface ScenarioPanelProps {
  onScenarioChange?: (scenario: ScenarioData) => void;
}

export default function ScenarioPanel({ onScenarioChange }: ScenarioPanelProps) {
  const [scenario, setScenario] = useState<ScenarioData>({
    description: "",
    tone: "",
    characters: "",
    writingStyle: "",
  });

  // Load scenario from localStorage on mount
  useEffect(() => {
    const savedScenario = localStorage.getItem("story_scenario");
    if (savedScenario) {
      try {
        const parsed = JSON.parse(savedScenario);
        setScenario(parsed);
      } catch (e) {
        console.error("Failed to parse saved scenario:", e);
      }
    }
  }, []);

  // Save scenario to localStorage and notify parent when it changes
  useEffect(() => {
    localStorage.setItem("story_scenario", JSON.stringify(scenario));
    if (onScenarioChange) {
      onScenarioChange(scenario);
    }
  }, [scenario, onScenarioChange]);

  const handleChange = (field: keyof ScenarioData, value: string) => {
    setScenario((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white dark:bg-gray-950 border-x border-b border-gray-200 dark:border-gray-800 px-6 py-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Story Description
          </label>
          <textarea
            id="description"
            value={scenario.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Provide a high-level description of your story, its plot, themes, and setting..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
          />
        </div>

        <div>
          <label
            htmlFor="tone"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Tone & Mood
          </label>
          <textarea
            id="tone"
            value={scenario.tone}
            onChange={(e) => handleChange("tone", e.target.value)}
            placeholder="Describe the tone (e.g., dark and mysterious, lighthearted and comedic, dramatic and emotional)..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
          />
        </div>

        <div>
          <label
            htmlFor="characters"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Characters
          </label>
          <textarea
            id="characters"
            value={scenario.characters}
            onChange={(e) => handleChange("characters", e.target.value)}
            placeholder="List and describe the main characters, their personalities, motivations, and relationships..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
          />
        </div>

        <div>
          <label
            htmlFor="writingStyle"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Writing Style
          </label>
          <textarea
            id="writingStyle"
            value={scenario.writingStyle}
            onChange={(e) => handleChange("writingStyle", e.target.value)}
            placeholder="Describe how the story should be written (e.g., first-person narrative, descriptive prose, dialogue-heavy, show don't tell)..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
          />
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Tip:</strong> The scenario information you provide here will be
            included with each generation request to help the AI maintain consistency
            with your story's context, characters, and style.
          </p>
        </div>
      </div>
    </div>
  );
}

export type { ScenarioData };
