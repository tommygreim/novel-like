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
    <main className="min-h-screen" style={{
      background: 'linear-gradient(135deg, rgb(249, 250, 251) 0%, rgba(239, 246, 255, 0.6) 50%, rgba(245, 243, 255, 0.6) 100%)'
    }}>
      <div className="max-w-7xl mx-auto">
        {/* Floating Header */}
        <header className="px-6 py-6">
          <div className="glass-panel" style={{
            borderRadius: '24px',
            padding: '16px 32px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
          }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <h1 className="text-2xl font-bold" style={{
                  background: 'linear-gradient(135deg, rgb(37, 99, 235), rgb(126, 34, 206))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Novel-Like
                </h1>

                {/* Tab Navigation */}
                <div className="flex gap-2 p-1" style={{
                  background: 'rgba(243, 244, 246, 0.6)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: '12px'
                }}>
                  <button
                    onClick={() => setActiveTab("editor")}
                    className="px-6 py-2 text-sm font-medium transition-all duration-200"
                    style={activeTab === "editor" ? {
                      background: 'white',
                      color: 'rgb(37, 99, 235)',
                      borderRadius: '10px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    } : {
                      color: 'rgb(75, 85, 99)',
                      borderRadius: '10px'
                    }}
                  >
                    Editor
                  </button>
                  <button
                    onClick={() => setActiveTab("scenario")}
                    className="px-6 py-2 text-sm font-medium transition-all duration-200"
                    style={activeTab === "scenario" ? {
                      background: 'white',
                      color: 'rgb(37, 99, 235)',
                      borderRadius: '10px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    } : {
                      color: 'rgb(75, 85, 99)',
                      borderRadius: '10px'
                    }}
                  >
                    Scenario
                  </button>
                </div>
              </div>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="px-5 py-2.5 text-sm font-medium transition-all duration-200"
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: '1px solid rgba(209, 213, 219, 0.5)',
                  borderRadius: '12px',
                  color: 'rgb(55, 65, 81)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}
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
