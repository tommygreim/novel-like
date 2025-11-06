"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState, useRef, useEffect } from "react";
import EditorToolbar from "./EditorToolbar";
import { ScenarioData } from "@/components/Scenario/ScenarioPanel";
import { Extension, Mark } from "@tiptap/core";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import DefinitionModal from "@/components/Definition/DefinitionModal";

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
  const [emphasisWords, setEmphasisWords] = useState<string[]>([]);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  // Definition state
  const [definitions, setDefinitions] = useState<Record<string, string>>({});
  const [isDefinitionModalOpen, setIsDefinitionModalOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState("");
  const [showDefineButton, setShowDefineButton] = useState(false);
  const [defineButtonPosition, setDefineButtonPosition] = useState({ x: 0, y: 0 });

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

      // Trigger emphasis effect update
      setUpdateTrigger(prev => prev + 1);
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

      // Load emphasis words
      const savedEmphasisWords = localStorage.getItem("emphasis_words") || "";
      const wordsArray = savedEmphasisWords
        .split(",")
        .map(w => w.trim().toLowerCase())
        .filter(w => w.length > 0);
      setEmphasisWords(wordsArray);

      // Load definitions
      const savedDefinitions = localStorage.getItem("word_definitions");
      if (savedDefinitions) {
        try {
          setDefinitions(JSON.parse(savedDefinitions));
        } catch (e) {
          console.error("Failed to parse definitions:", e);
        }
      }

      // Trigger emphasis effect after loading
      setTimeout(() => {
        setUpdateTrigger(prev => prev + 1);
      }, 200);
    }
  }, [editor]);

  // Setup IntersectionObserver for viewport visibility
  useEffect(() => {
    if (typeof window === "undefined") return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          if (entry.isIntersecting) {
            // Element is visible, enable animation
            element.querySelectorAll('.emphasis-char').forEach((char) => {
              (char as HTMLElement).style.animationPlayState = 'running';
            });
          } else {
            // Element is not visible, pause animation
            element.querySelectorAll('.emphasis-char').forEach((char) => {
              (char as HTMLElement).style.animationPlayState = 'paused';
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // Apply emphasis effect to matching words
  const applyEmphasisEffect = () => {
    if (!editor || emphasisWords.length === 0) return;

    const editorElement = editor.view.dom;

    // Remove all previous emphasis wrapping
    editorElement.querySelectorAll('.emphasis-word').forEach((el) => {
      const text = el.textContent || '';
      const textNode = document.createTextNode(text);
      if (el.parentNode) {
        el.parentNode.replaceChild(textNode, el);
      }
    });

    // Process all paragraph elements
    const paragraphs = editorElement.querySelectorAll('p');

    paragraphs.forEach((paragraph) => {
      // Get all text nodes in this paragraph
      const walker = document.createTreeWalker(
        paragraph,
        NodeFilter.SHOW_TEXT,
        null
      );

      const textNodes: Text[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) {
        textNodes.push(node as Text);
      }

      // Process each text node
      textNodes.forEach((textNode) => {
        const text = textNode.textContent || '';
        const words = text.split(/(\s+)/);

        // Check if any words need emphasis
        const hasEmphasisWord = words.some(word =>
          emphasisWords.includes(word.toLowerCase().trim())
        );

        if (!hasEmphasisWord) return;

        // Build replacement fragment
        const fragment = document.createDocumentFragment();

        words.forEach((word) => {
          const cleanWord = word.toLowerCase().trim();

          if (cleanWord && emphasisWords.includes(cleanWord)) {
            // Create wrapper for the word
            const wordWrapper = document.createElement('span');
            wordWrapper.className = 'emphasis-word';

            // Wrap each character
            for (let i = 0; i < word.length; i++) {
              const charSpan = document.createElement('span');
              charSpan.className = 'emphasis-char';
              charSpan.textContent = word[i];
              wordWrapper.appendChild(charSpan);
            }

            fragment.appendChild(wordWrapper);
          } else {
            // Regular text
            fragment.appendChild(document.createTextNode(word));
          }
        });

        // Replace text node with fragment
        if (textNode.parentNode) {
          textNode.parentNode.replaceChild(fragment, textNode);
        }
      });
    });

    // Set up viewport observation
    if (observerRef.current) {
      paragraphs.forEach((p) => {
        observerRef.current?.observe(p);
      });
    }
  };

  // Apply underline styling to defined words
  const applyDefinitionUnderlines = () => {
    if (!editor || Object.keys(definitions).length === 0) return;

    const editorElement = editor.view.dom;

    // Remove all previous definition wrapping
    editorElement.querySelectorAll('.defined-word').forEach((el) => {
      const text = el.textContent || '';
      const textNode = document.createTextNode(text);
      if (el.parentNode) {
        el.parentNode.replaceChild(textNode, el);
      }
    });

    // Process all paragraph elements
    const paragraphs = editorElement.querySelectorAll('p');
    const definedWords = Object.keys(definitions);

    paragraphs.forEach((paragraph) => {
      // Get all text nodes in this paragraph
      const walker = document.createTreeWalker(
        paragraph,
        NodeFilter.SHOW_TEXT,
        null
      );

      const textNodes: Text[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) {
        textNodes.push(node as Text);
      }

      // Process each text node
      textNodes.forEach((textNode) => {
        const text = textNode.textContent || '';
        const words = text.split(/(\s+)/);

        // Check if any words have definitions
        const hasDefinedWord = words.some(word =>
          definedWords.includes(word.toLowerCase().trim())
        );

        if (!hasDefinedWord) return;

        // Build replacement fragment
        const fragment = document.createDocumentFragment();

        words.forEach((word) => {
          const cleanWord = word.toLowerCase().trim();

          if (cleanWord && definedWords.includes(cleanWord)) {
            // Create wrapper for the defined word
            const wordSpan = document.createElement('span');
            wordSpan.className = 'defined-word';
            wordSpan.textContent = word;
            wordSpan.style.textDecoration = 'underline';
            wordSpan.style.textDecorationColor = 'rgb(59, 130, 246)';
            wordSpan.style.textUnderlineOffset = '2px';
            wordSpan.style.cursor = 'pointer';
            wordSpan.onclick = (e) => {
              e.stopPropagation();
              handleDefinedWordClick(word);
            };

            fragment.appendChild(wordSpan);
          } else {
            // Regular text
            fragment.appendChild(document.createTextNode(word));
          }
        });

        // Replace text node with fragment
        if (textNode.parentNode) {
          textNode.parentNode.replaceChild(fragment, textNode);
        }
      });
    });
  };

  // Apply emphasis effect when editor content changes or emphasis words change
  useEffect(() => {
    if (editor && emphasisWords.length > 0) {
      const timeoutId = setTimeout(() => {
        applyEmphasisEffect();
      }, 100); // Small delay to let DOM settle

      return () => clearTimeout(timeoutId);
    }
  }, [updateTrigger, emphasisWords, editor]);

  // Apply definition underlines when editor content changes or definitions change
  useEffect(() => {
    if (editor && Object.keys(definitions).length > 0) {
      const timeoutId = setTimeout(() => {
        applyDefinitionUnderlines();
      }, 100); // Small delay to let DOM settle

      return () => clearTimeout(timeoutId);
    }
  }, [updateTrigger, definitions, editor]);

  // Listen for text selection changes
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      handleSelectionChange();
    };

    editor.on("selectionUpdate", handleUpdate);

    return () => {
      editor.off("selectionUpdate", handleUpdate);
    };
  }, [editor, definitions]);

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

  // Insert text with lavender color
  const insertTextProgressively = async (text: string) => {
    if (!editor) return;

    // Store the text being generated
    generatingTextRef.current = text;

    // Clear lavender color from previous generation
    const doc = editor.state.doc;
    const tr = editor.state.tr;
    let cleared = false;

    doc.descendants((node, pos) => {
      if (node.isText && node.marks) {
        node.marks.forEach((mark) => {
          if (mark.type.name === "textStyle" && mark.attrs.color === "#e0b0ff") {
            tr.removeMark(pos, pos + node.nodeSize, mark);
            cleared = true;
          }
        });
      }
    });

    if (cleared) {
      editor.view.dispatch(tr);
    }

    // Move cursor to the very end of the document
    editor.commands.focus("end");

    // Check if we need to add a space before the new text
    const currentText = editor.getText();
    const needsSpace = currentText.length > 0 && !/\s$/.test(currentText);

    // If we need a space, add it first (without color)
    if (needsSpace) {
      editor.commands.insertContent(" ");
    }

    // Insert text with lavender color
    editor.chain().focus().setColor("#e0b0ff").insertContent(text).run();

    // Clear color mark so future typing is normal
    editor.commands.unsetColor();
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

      // Extract context (all character)
      const context = cleanText;

      // Extract definitions for words in last 300 words
      const words = cleanText.split(/\s+/).filter(Boolean);
      const last300Words = words.slice(-300);
      const relevantDefinitions: Record<string, string> = {};

      last300Words.forEach((word) => {
        const cleanWord = word.toLowerCase().trim().replace(/[.,!?;:()'"]/g, '');
        if (definitions[cleanWord]) {
          relevantDefinitions[cleanWord] = definitions[cleanWord];
        }
      });

      // Call our API route with scenario, maxWords, instructions, and definitions
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
          definitions: relevantDefinitions,
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

  // Handle text selection for defining words
  const handleSelectionChange = () => {
    if (!editor) return;

    const { state } = editor;
    const { from, to } = state.selection;
    const text = state.doc.textBetween(from, to, " ").trim();

    // Only show Define button if we have a single word selected
    if (text && text.split(/\s+/).length === 1) {
      setSelectedWord(text);
      setShowDefineButton(true);

      // Get the selection position to position the button
      const { view } = editor;
      const start = view.coordsAtPos(from);
      setDefineButtonPosition({ x: start.left, y: start.top - 40 });
    } else {
      setShowDefineButton(false);
    }
  };

  // Open definition modal
  const handleOpenDefineModal = () => {
    setShowDefineButton(false);
    setIsDefinitionModalOpen(true);
  };

  // Save definition
  const handleSaveDefinition = (word: string, definition: string) => {
    const normalizedWord = word.toLowerCase().trim();

    const newDefinitions = { ...definitions };

    if (definition) {
      // Add or update definition
      newDefinitions[normalizedWord] = definition;
    } else {
      // Delete definition
      delete newDefinitions[normalizedWord];
    }

    setDefinitions(newDefinitions);
    localStorage.setItem("word_definitions", JSON.stringify(newDefinitions));

    // Trigger update to refresh underlines
    setUpdateTrigger(prev => prev + 1);
  };

  // Handle clicking on a defined word
  const handleDefinedWordClick = (word: string) => {
    const normalizedWord = word.toLowerCase().trim();
    setSelectedWord(word);
    setIsDefinitionModalOpen(true);
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

      {/* Define Button - appears on text selection */}
      {showDefineButton && (
        <button
          onClick={handleOpenDefineModal}
          className="fixed z-50 px-3 py-1.5 text-xs font-medium transition-all duration-200"
          style={{
            left: `${defineButtonPosition.x}px`,
            top: `${defineButtonPosition.y}px`,
            background: 'linear-gradient(135deg, rgb(37, 99, 235), rgb(126, 34, 206))',
            borderRadius: '8px',
            color: 'white',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
          }}
        >
          Define
        </button>
      )}

      {/* Definition Modal */}
      <DefinitionModal
        isOpen={isDefinitionModalOpen}
        word={selectedWord}
        existingDefinition={definitions[selectedWord.toLowerCase().trim()] || ""}
        context={editor?.getText() || ""}
        onClose={() => setIsDefinitionModalOpen(false)}
        onSave={handleSaveDefinition}
      />
    </div>
  );
}
