"use client";

import { useState } from "react";
import Editor from "@/components/Editor/Editor";
import SettingsModal from "@/components/Settings/SettingsModal";
import ScenarioPanel, { ScenarioData } from "@/components/Scenario/ScenarioPanel";

type Tab = "editor" | "scenario";

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("editor");
  const [scenario, setScenario] = useState<ScenarioData | null>(null);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto">
        <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Novel-Like
            </h1>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Settings
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-950 border-x border-gray-200 dark:border-gray-800">
          <div className="flex border-b border-gray-200 dark:border-gray-800">
            <button
              onClick={() => setActiveTab("editor")}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "editor"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setActiveTab("scenario")}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "scenario"
                  ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              Scenario
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "editor" && <Editor scenario={scenario} />}
        {activeTab === "scenario" && (
          <ScenarioPanel onScenarioChange={setScenario} />
        )}

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
    </main>
  );
}
