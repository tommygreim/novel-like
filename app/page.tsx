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
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20">
      <div className="max-w-7xl mx-auto">
        {/* Floating Header */}
        <header className="px-6 py-6">
          <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/30 px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Novel-Like
                </h1>

                {/* Tab Navigation */}
                <div className="flex gap-2 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl p-1">
                  <button
                    onClick={() => setActiveTab("editor")}
                    className={`px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      activeTab === "editor"
                        ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    Editor
                  </button>
                  <button
                    onClick={() => setActiveTab("scenario")}
                    className={`px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      activeTab === "scenario"
                        ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-md"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                  >
                    Scenario
                  </button>
                </div>
              </div>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 rounded-xl transition-all duration-200 shadow-sm border border-gray-200/50 dark:border-gray-700/50"
              >
                Settings
              </button>
            </div>
          </div>
        </header>

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
