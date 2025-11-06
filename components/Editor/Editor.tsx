"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState, useRef, useEffect } from "react";
import EditorToolbar from "./EditorToolbar";
import Highlight from "@tiptap/extension-highlight";
import { ScenarioData } from "@/components/Scenario/ScenarioPanel";
import { Extension } from "@tiptap/core";

// Custom extension for Tab indentation
const IndentExtension = Extension.create({
  name: "indent",

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        const { state, dispatch } = this.editor.view;
        const { $from } = state.selection;
        const node = $from.node();

        if (node.type.name === "paragraph") {
          const tr = state.tr;
          const pos = $from.before();

          // Get current indent level
          const currentIndent = node.attrs.indent || 0;
          const newIndent = currentIndent + 1;

          // Update node with new indent
          tr.setNodeMarkup(pos, null, {
            ...node.attrs,
            indent: newIndent,
          });

          dispatch(tr);
          return true;
        }

        return false;
      },
      "Shift-Tab": () => {
        const { state, dispatch } = this.editor.view;
        const { $from } = state.selection;
        const node = $from.node();

        if (node.type.name === "paragraph") {
          const tr = state.tr;
          const pos = $from.before();

          // Get current indent level
          const currentIndent = node.attrs.indent || 0;
          const newIndent = Math.max(0, currentIndent - 1);

          // Update node with new indent
          tr.setNodeMarkup(pos, null, {
            ...node.attrs,
            indent: newIndent,
          });

          dispatch(tr);
          return true;
        }

        return false;
      },
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph"],
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) => {
              const style = element.getAttribute("style") || "";
              const match = style.match(/margin-left:\s*(\d+)px/);
              return match ? parseInt(match[1], 10) / 40 : 0;
            },
            renderHTML: (attributes) => {
              if (!attributes.indent) {
                return {};
              }
              return {
                style: `margin-left: ${attributes.indent * 40}px`,
              };
            },
          },
        },
      },
    ];
  },
});

interface EditorProps {
  scenario: ScenarioData | null;
}

export default function Editor({ scenario }: EditorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [maxWords, setMaxWords] = useState(150);
  const insertionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const generatingTextRef = useRef<string>("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Highlight.configure({
        multicolor: true,
      }),
      IndentExtension,
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

  // Progressive text insertion function - inserts at a fixed position
  const insertTextProgressively = async (text: string) => {
    if (!editor) return;

    // Store the text being generated
    generatingTextRef.current = text;

    // Clear any previous highlights
    const { tr } = editor.state;
    editor.view.dispatch(
      tr.removeMark(0, editor.state.doc.content.size, editor.schema.marks.highlight)
    );

    // Get the end position before starting insertion
    const startPos = editor.state.doc.content.size;

    // Split text into words for progressive insertion
    const words = text.split(/(\s+)/); // Keep whitespace
    let insertedLength = 0;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];

      // Insert word at the calculated position (not at cursor)
      const insertPosition = startPos + insertedLength;
      editor.commands.insertContentAt(insertPosition, word);
      insertedLength += word.length;

      // Add small delay between words (adjust for speed)
      await new Promise((resolve) => {
        insertionTimeoutRef.current = setTimeout(resolve, 15);
      });
    }

    // After all text is inserted, highlight it
    const endPos = startPos + text.length;

    editor
      .chain()
      .setTextSelection({ from: startPos, to: endPos })
      .setHighlight({ color: "#d4f4dd" }) // dimmer green
      .setTextSelection({ from: endPos, to: endPos }) // Move cursor to end
      .run();

    generatingTextRef.current = "";
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
          editor={editor}
          maxWords={maxWords}
          onMaxWordsChange={setMaxWords}
        />
        <div className="px-16 py-12" style={{ minHeight: '11in' }}>
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Floating Generate Panel - Bottom Left */}
      <div className="fixed bottom-8 left-8 z-50 glass-panel" style={{
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
      }}>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-6 py-3 text-sm font-medium transition-all duration-200 glass-button"
          style={{
            borderRadius: '12px',
            color: 'white',
            opacity: isGenerating ? 0.7 : 1,
            minWidth: '140px'
          }}
        >
          {isGenerating ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
              Generating...
            </span>
          ) : (
            "Generate"
          )}
        </button>
      </div>
    </div>
  );
}
