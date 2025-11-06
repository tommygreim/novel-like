"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState, useRef } from "react";
import EditorToolbar from "./EditorToolbar";
import Highlight from "@tiptap/extension-highlight";
import { ScenarioData } from "@/components/Scenario/ScenarioPanel";

interface EditorProps {
  scenario: ScenarioData | null;
}

export default function Editor({ scenario }: EditorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const insertionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Highlight.configure({
        multicolor: true,
      }),
    ],
    content: "<p>Start writing your story here...</p>",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[500px]",
      },
    },
    onUpdate: ({ editor }) => {
      // Remove highlight from any text when user edits
      const { from, to } = editor.state.selection;
      if (from !== to) {
        // Selection is active, don't remove highlights yet
        return;
      }

      // Check if we're typing in a highlighted area
      const marks = editor.state.storedMarks || editor.state.selection.$from.marks();
      const hasHighlight = marks.some((mark) => mark.type.name === "highlight");

      if (hasHighlight) {
        editor.commands.unsetHighlight();
      }
    },
  });

  // Progressive text insertion function
  const insertTextProgressively = async (text: string) => {
    if (!editor) return;

    // Clear any previous highlights
    editor.commands.selectAll();
    editor.commands.unsetHighlight();
    editor.commands.focus("end");

    // Split text into words for progressive insertion
    const words = text.split(/(\s+)/); // Keep whitespace

    for (let i = 0; i < words.length; i++) {
      const word = words[i];

      // Insert word
      editor.commands.insertContent(word);

      // Add small delay between words (adjust for speed)
      await new Promise((resolve) => {
        insertionTimeoutRef.current = setTimeout(resolve, 15);
      });
    }

    // After all text is inserted, highlight it
    const endPos = editor.state.selection.from;
    const startPos = endPos - text.length;

    editor
      .chain()
      .focus()
      .setTextSelection({ from: startPos, to: endPos })
      .setHighlight({ color: "#86efac" }) // green-300
      .focus("end")
      .run();
  };

  const handleGenerate = async () => {
    if (!editor) return;

    // Get API key and model from localStorage
    const apiKey = localStorage.getItem("openrouter_api_key");
    const model = localStorage.getItem("openrouter_model") || "openai/gpt-3.5-turbo";

    if (!apiKey) {
      alert("Please set your OpenRouter API key in Settings");
      return;
    }

    setIsGenerating(true);

    try {
      // Get current text content
      const currentText = editor.getText();

      // Extract context (last 2000 characters)
      const context = currentText.slice(-2000);

      // Call our API route with scenario
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          context,
          scenario,
          apiKey,
          model,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate text");
      }

      const data = await response.json();

      // Append generated text progressively with highlight
      if (data.text) {
        await insertTextProgressively(data.text);
      }
    } catch (error) {
      console.error("Generation error:", error);
      alert(error instanceof Error ? error.message : "Failed to generate text");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-950 border-x border-b border-gray-200 dark:border-gray-800 relative">
      <EditorToolbar
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        editor={editor}
      />

      {/* Buffering overlay */}
      {isGenerating && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm z-10 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl px-6 py-4 flex items-center gap-3">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-800 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
            </div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              Generating...
            </span>
          </div>
        </div>
      )}

      {/* Page-width centered editor */}
      <div className="px-6 py-8">
        <div className="max-w-[8.5in] mx-auto bg-white dark:bg-gray-900 shadow-sm px-16 py-12 min-h-[11in]">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
