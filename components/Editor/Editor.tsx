"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState, useRef, useEffect } from "react";
import EditorToolbar from "./EditorToolbar";
import Highlight from "@tiptap/extension-highlight";
import { ScenarioData } from "@/components/Scenario/ScenarioPanel";

interface EditorProps {
  scenario: ScenarioData | null;
}

export default function Editor({ scenario }: EditorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [maxWords, setMaxWords] = useState(150);
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
      // Save content to localStorage
      if (editor) {
        localStorage.setItem("editor_content", editor.getHTML());
      }

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

  // Load saved content on mount
  useEffect(() => {
    if (editor && typeof window !== "undefined") {
      const savedContent = localStorage.getItem("editor_content");
      if (savedContent) {
        editor.commands.setContent(savedContent);
      }

      // Load max words setting
      const savedMaxWords = localStorage.getItem("max_words");
      if (savedMaxWords) {
        setMaxWords(parseInt(savedMaxWords, 10));
      }
    }
  }, [editor]);

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
      .setHighlight({ color: "#d4f4dd" }) // dimmer green
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

      // Call our API route with scenario and maxWords
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
          maxWords,
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
    <div className="px-6 pb-8 relative min-h-[calc(100vh-12rem)]" style={{
      background: 'linear-gradient(135deg, rgba(249, 250, 251, 1) 0%, rgba(239, 246, 255, 0.6) 50%, rgba(245, 243, 255, 0.6) 100%)'
    }}>
      {/* Page-width centered editor with liquid glass effect */}
      <div className="max-w-[8.5in] mx-auto glass-panel" style={{
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)'
      }}>
        <EditorToolbar
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          editor={editor}
          maxWords={maxWords}
          onMaxWordsChange={setMaxWords}
        />
        <div className="px-16 py-12" style={{ minHeight: '11in' }}>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
