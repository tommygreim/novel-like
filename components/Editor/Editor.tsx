"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState, useRef, useEffect } from "react";
import EditorToolbar from "./EditorToolbar";
import { ScenarioData } from "@/components/Scenario/ScenarioPanel";
import { Extension, Mark } from "@tiptap/core";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";

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

          // Check if cursor is at the start of the paragraph
          const cursorPosInNode = $from.pos - $from.start();
          const isAtStart = cursorPosInNode === 0;

          if (isAtStart) {
            // Add first-line indent (text-indent)
            const currentTextIndent = node.attrs.textIndent || 0;
            const newTextIndent = currentTextIndent + 1;

            tr.setNodeMarkup(pos, null, {
              ...node.attrs,
              textIndent: newTextIndent,
            });
          } else {
            // Add whole-paragraph indent (margin-left)
            const currentIndent = node.attrs.indent || 0;
            const newIndent = currentIndent + 1;

            tr.setNodeMarkup(pos, null, {
              ...node.attrs,
              indent: newIndent,
            });
          }

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

          // Check if cursor is at the start of the paragraph
          const cursorPosInNode = $from.pos - $from.start();
          const isAtStart = cursorPosInNode === 0;

          if (isAtStart) {
            // Remove first-line indent (text-indent)
            const currentTextIndent = node.attrs.textIndent || 0;
            const newTextIndent = Math.max(0, currentTextIndent - 1);

            tr.setNodeMarkup(pos, null, {
              ...node.attrs,
              textIndent: newTextIndent,
            });
          } else {
            // Remove whole-paragraph indent (margin-left)
            const currentIndent = node.attrs.indent || 0;
            const newIndent = Math.max(0, currentIndent - 1);

            tr.setNodeMarkup(pos, null, {
              ...node.attrs,
              indent: newIndent,
            });
          }

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
              if (!attributes.indent && !attributes.textIndent) {
                return {};
              }
              let style = "";
              if (attributes.indent) {
                style += `margin-left: ${attributes.indent * 40}px; `;
              }
              if (attributes.textIndent) {
                style += `text-indent: ${attributes.textIndent * 40}px;`;
              }
              return { style: style.trim() };
            },
          },
          textIndent: {
            default: 0,
            parseHTML: (element) => {
              const style = element.getAttribute("style") || "";
              const match = style.match(/text-indent:\s*(\d+)px/);
              return match ? parseInt(match[1], 10) / 40 : 0;
            },
            renderHTML: () => {
              return {};
            },
          },
        },
      },
    ];
  },
});

// Custom mark for inline footnotes (replaced [[instructions]])
const FootnoteMark = Mark.create({
  name: "footnote",

  addAttributes() {
    return {
      instruction: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-instruction"),
        renderHTML: (attributes) => {
          if (!attributes.instruction) {
            return {};
          }
          return {
            "data-instruction": attributes.instruction,
            class: "footnote-marker",
            title: attributes.instruction,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-instruction]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, "†"];
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
  const [previousInstructions, setPreviousInstructions] = useState<string[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position relative to viewport
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      IndentExtension,
      FootnoteMark,
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

      // Remove generated-text class when user edits
      // This removes the lavender color and animation from edited words
      const editorElement = editor.view.dom;
      const { from } = editor.state.selection;

      // Find the node at cursor position and check if it has generated-text class
      const domAtPos = editor.view.domAtPos(from);
      let node: Node | null = domAtPos.node;

      // Traverse up to find a span with generated-text class
      while (node && node !== editorElement) {
        if (node instanceof HTMLElement && node.classList.contains('generated-text')) {
          node.classList.remove('generated-text');
          node.style.color = '';
          node.style.textShadow = '';
          node.style.animation = '';
          break;
        }
        node = node.parentNode;
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

  // Extract [[instructions]] from text
  const extractInstructions = (text: string): { cleanText: string; instructions: string[] } => {
    const instructionPattern = /\[\[(.+?)\]\]/g;
    const instructions: string[] = [];
    let match;

    while ((match = instructionPattern.exec(text)) !== null) {
      instructions.push(match[1]);
    }

    const cleanText = text.replace(instructionPattern, '');
    return { cleanText, instructions };
  };

  // Replace [[instructions]] in editor with footnote markers
  const replaceInstructionsWithFootnotes = () => {
    if (!editor) return;

    const html = editor.getHTML();
    const instructionPattern = /\[\[(.+?)\]\]/g;
    let newHtml = html;
    let match;

    while ((match = instructionPattern.exec(html)) !== null) {
      const instruction = match[1];
      const footnoteHtml = `<span data-instruction="${instruction}" class="footnote-marker">†</span>`;
      newHtml = newHtml.replace(match[0], footnoteHtml);
    }

    if (newHtml !== html) {
      editor.commands.setContent(newHtml);
    }
  };

  // Insert text all at once with fade-in reveal effect
  const insertTextProgressively = async (text: string) => {
    if (!editor) return;

    // Store the text being generated
    generatingTextRef.current = text;

    // Remove existing generated-text class from all elements
    const editorElement = editor.view.dom;
    const existingGenerated = editorElement.querySelectorAll('.generated-text');
    existingGenerated.forEach((el) => {
      el.classList.remove('generated-text');
      (el as HTMLElement).style.animation = '';
    });

    // Move cursor to the very end of the document
    editor.commands.focus("end");

    // Check if we need to add a space before the new text
    const currentText = editor.getText();
    const needsSpace = currentText.length > 0 && !/\s$/.test(currentText);

    // If we need a space, add it first (without color)
    if (needsSpace) {
      editor.commands.insertContent(" ");
    }

    // Split text into words and wrap each in a span
    const words = text.split(/(\s+)/); // Keep whitespace
    const wrappedWords = words
      .map((word, idx) => {
        if (word.trim()) {
          return `<span class="generated-text" data-word-index="${idx}">${word}</span>`;
        } else {
          // Whitespace - no animation needed
          return word;
        }
      })
      .join("");

    // Insert all text at once
    editor.commands.insertContent(wrappedWords);

    // Apply animations to each word after DOM updates
    await new Promise(resolve => setTimeout(resolve, 10));

    const generatedWords = editorElement.querySelectorAll('.generated-text');
    generatedWords.forEach((span) => {
      const idx = parseInt((span as HTMLElement).getAttribute('data-word-index') || '0');
      const delay = idx * 30; // 30ms between each word
      (span as HTMLElement).style.animation = `fadeInWord 0.3s ease-in forwards`;
      (span as HTMLElement).style.animationDelay = `${delay}ms`;
    });

    // Wait for animations to complete
    const totalDuration = words.filter(w => w.trim()).length * 30 + 300;
    await new Promise((resolve) => {
      insertionTimeoutRef.current = setTimeout(resolve, totalDuration);
    });

    editor.commands.focus("end");
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

      // Extract [[instructions]] from the current text
      const { cleanText, instructions: newInstructions } = extractInstructions(currentText);

      // Combine with previous instructions
      const allInstructions = [...previousInstructions, ...newInstructions];

      // Extract context (last 2000 characters of clean text)
      const context = cleanText.slice(-2000);

      // Call our API route with scenario, maxWords, and instructions
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
          instructions: allInstructions,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate text");
      }

      const data = await response.json();

      // Replace [[instructions]] with footnote markers
      replaceInstructionsWithFootnotes();

      // Store the new instructions for next generation
      setPreviousInstructions(allInstructions);

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

  // Calculate shadow direction based on cursor position
  // Shadow points away from cursor (as if cursor is light source)
  const editorRef = useRef<HTMLDivElement>(null);
  const [shadowOffset, setShadowOffset] = useState({ x: 2, y: 2 });

  useEffect(() => {
    if (editorRef.current) {
      const editorRect = editorRef.current.getBoundingClientRect();
      const editorCenterX = editorRect.left + editorRect.width / 2;
      const editorCenterY = editorRect.top + editorRect.height / 2;

      // Calculate direction from cursor to editor center
      const dx = editorCenterX - mousePosition.x;
      const dy = editorCenterY - mousePosition.y;

      // Normalize and scale
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = 800; // Max effect distance
      const intensity = Math.min(distance / maxDistance, 1);

      // Shadow offset (opposite direction of cursor)
      const shadowX = (dx / distance) * 3 * intensity || 2;
      const shadowY = (dy / distance) * 3 * intensity || 2;

      setShadowOffset({ x: shadowX, y: shadowY });
    }
  }, [mousePosition]);

  return (
    <div className="px-6 pb-8 relative min-h-[calc(100vh-12rem)]" style={{
      background: 'linear-gradient(135deg, rgba(249, 250, 251, 1) 0%, rgba(239, 246, 255, 0.6) 50%, rgba(245, 243, 255, 0.6) 100%)'
    }}>
      {/* Dynamic shadow CSS for generated text */}
      <style>{`
        .generated-text {
          color: #e0b0ff;
          opacity: 0;
          text-shadow: ${shadowOffset.x}px ${shadowOffset.y}px 4px rgba(224, 176, 255, 0.4);
          transition: text-shadow 0.3s ease;
        }
      `}</style>

      {/* Page-width centered editor with liquid glass effect */}
      <div ref={editorRef} className="max-w-[8.5in] mx-auto glass-panel" style={{
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

      {/* Floating Generate Panel - Bottom Right */}
      <div className="fixed bottom-8 right-8 z-50 glass-panel" style={{
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
