"use client";

import { useState } from "react";
import InteractiveStory from "@/components/InteractiveStory/InteractiveStory";
import SettingsModal from "@/components/Settings/SettingsModal";
import ScenarioPanel, { ScenarioData } from "@/components/Scenario/ScenarioPanel";

type Tab = "story" | "scenario";

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("story");
  const [scenario, setScenario] = useState<ScenarioData | null>(null);

  return (
    <main className="min-h-screen" style={{
      background: 'linear-gradient(135deg, rgb(249, 250, 251) 0%, rgba(239, 246, 255, 0.6) 50%, rgba(245, 243, 255, 0.6) 100%)'
    }}>

      <div className="max-w-7xl mx-auto">
        {/* Floating Header */}
        <header className="px-3 md:px-6 py-4 md:py-6">
          <div className="glass-panel" style={{
            borderRadius: '16px',
            padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
          }}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-8 w-full sm:w-auto">
                <h1 className="text-xl md:text-2xl font-bold" style={{
                  background: 'linear-gradient(135deg, rgb(37, 99, 235), rgb(126, 34, 206))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Novel-Like
                </h1>

                {/* Tab Navigation */}
                <div className="flex gap-1 sm:gap-2 p-1 w-full sm:w-auto" style={{
                  background: 'rgba(243, 244, 246, 0.6)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: '12px'
                }}>
                  <button
                    onClick={() => setActiveTab("story")}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium transition-all duration-200"
                    style={activeTab === "story" ? {
                      background: 'white',
                      color: 'rgb(37, 99, 235)',
                      borderRadius: '10px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                    } : {
                      color: 'rgb(75, 85, 99)',
                      borderRadius: '10px'
                    }}
                  >
                    Story
                  </button>
                  <button
                    onClick={() => setActiveTab("scenario")}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-xs sm:text-sm font-medium transition-all duration-200"
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
                className="px-4 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-medium transition-all duration-200 w-full sm:w-auto"
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
        {activeTab === "story" && <InteractiveStory scenario={scenario} />}
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
