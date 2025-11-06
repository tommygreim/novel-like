"use client";

import { useState, useEffect, useRef } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getRoot,
  $getSelection,
  $createParagraphNode,
  $createTextNode,
  EditorState,
  LexicalEditor as LexicalEditorType,
  COMMAND_PRIORITY_LOW,
  KEY_TAB_COMMAND,
  TextNode,
  ElementNode,
  $isParagraphNode,
} from "lexical";
import { $setBlocksType } from "@lexical/selection";
import EditorToolbar from "./EditorToolbar";
import { ScenarioData } from "@/components/Scenario/ScenarioPanel";
import DefinitionModal from "@/components/Definition/DefinitionModal";

interface EditorProps {
  scenario: ScenarioData | null;
}

// Plugin to handle tab indentation
function TabIndentPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_TAB_COMMAND,
      (event) => {
        event.preventDefault();

        editor.update(() => {
          const selection = $getSelection();
          if (selection) {
            // Add tab character for now - we'll enhance this
            const tabText = $createTextNode('\t');
            selection.insertNodes([tabText]);
          }
        });

        return true;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  return null;
}

// Plugin to auto-save content
function AutoSavePlugin({ onSave }: { onSave: (content: string) => void }) {
  const [editor] = useLexicalComposerContext();

  const handleChange = (editorState: EditorState) => {
    editorState.read(() => {
      const root = $getRoot();
      const text = root.getTextContent();
      onSave(text);
    });
  };

  return <OnChangePlugin onChange={handleChange} />;
}

// Plugin to load saved content
function LoadContentPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedContent = localStorage.getItem("editor_content");
      if (savedContent && savedContent !== "Start writing your story here...") {
        editor.update(() => {
          const root = $getRoot();
          root.clear();

          const paragraph = $createParagraphNode();
          const textNode = $createTextNode(savedContent);
          paragraph.append(textNode);
          root.append(paragraph);
        });
      }
    }
  }, [editor]);

  return null;
}

// Plugin to apply emphasis words effect
function EmphasisWordsPlugin({ words }: { words: string[] }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (words.length === 0) return;

    const applyEmphasis = () => {
      const editorElement = editor.getRootElement();
      if (!editorElement) return;

      // Remove existing emphasis spans first to avoid duplicates
      editorElement.querySelectorAll(".emphasis-word").forEach((span) => {
        const text = span.textContent || "";
        const textNode = document.createTextNode(text);
        span.parentNode?.replaceChild(textNode, span);
      });

      // Find all text nodes (but skip those already in emphasis spans)
      const walker = document.createTreeWalker(
        editorElement,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            // Skip if parent is already an emphasis word
            if (node.parentElement?.classList.contains('emphasis-char')) {
              return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      const textNodes: Text[] = [];
      let node;
      while ((node = walker.nextNode())) {
        textNodes.push(node as Text);
      }

      textNodes.forEach((textNode) => {
        const text = textNode.textContent || "";
        const wordRegex = /\b[\w']+\b/g;
        let match;
        const replacements: { start: number; end: number; word: string }[] = [];

        while ((match = wordRegex.exec(text)) !== null) {
          const word = match[0];
          if (words.includes(word.toLowerCase())) {
            replacements.push({
              start: match.index,
              end: match.index + word.length,
              word: word,
            });
          }
        }

        if (replacements.length > 0 && textNode.parentElement) {
          // Build replacement fragment
          const fragment = document.createDocumentFragment();
          let lastIndex = 0;

          replacements.forEach(({ start, end, word }) => {
            // Add text before the word
            if (start > lastIndex) {
              fragment.appendChild(
                document.createTextNode(text.substring(lastIndex, start))
              );
            }

            // Add the emphasized word
            const wordSpan = document.createElement("span");
            wordSpan.className = "emphasis-word";

            for (let i = 0; i < word.length; i++) {
              const charSpan = document.createElement("span");
              charSpan.className = "emphasis-char";
              charSpan.textContent = word[i];
              wordSpan.appendChild(charSpan);
            }

            fragment.appendChild(wordSpan);
            lastIndex = end;
          });

          // Add remaining text
          if (lastIndex < text.length) {
            fragment.appendChild(document.createTextNode(text.substring(lastIndex)));
          }

          // Replace the text node
          textNode.parentElement.replaceChild(fragment, textNode);
        }
      });
    };

    // Apply emphasis with a delay to avoid scroll issues
    const timeoutId = setTimeout(applyEmphasis, 200);

    return () => clearTimeout(timeoutId);
  }, [editor, words, words.length]);

  return null;
}

export default function Editor({ scenario }: EditorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [maxWords, setMaxWords] = useState(150);
  const [previousInstructions, setPreviousInstructions] = useState<string[]>([]);
  const [emphasisWords, setEmphasisWords] = useState<string[]>([]);
  const [definitions, setDefinitions] = useState<Record<string, string>>({});
  const [isDefinitionModalOpen, setIsDefinitionModalOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState("");
  const [showDefineButton, setShowDefineButton] = useState(false);
  const [defineButtonPosition, setDefineButtonPosition] = useState({ x: 0, y: 0 });
  const editorRef = useRef<LexicalEditorType | null>(null);

  // Initial editor configuration
  const initialConfig = {
    namespace: "NovelEditor",
    theme: {
      paragraph: "editor-paragraph",
      text: {
        bold: "editor-text-bold",
        italic: "editor-text-italic",
        underline: "editor-text-underline",
      },
    },
    onError: (error: Error) => {
      console.error("Lexical error:", error);
    },
  };

  // Load settings on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load max words
      const savedMaxWords = localStorage.getItem("max_words");
      if (savedMaxWords) {
        setMaxWords(parseInt(savedMaxWords, 10));
      }

      // Load emphasis words
      const savedEmphasisWords = localStorage.getItem("emphasis_words") || "";
      const wordsArray = savedEmphasisWords
        .split(",")
        .map((w) => w.trim().toLowerCase())
        .filter((w) => w.length > 0);
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
    }
  }, []);

  const handleSave = (content: string) => {
    localStorage.setItem("editor_content", content);
  };

  const handleGenerate = async () => {
    if (!editorRef.current) return;

    const apiKey = localStorage.getItem("openrouter_api_key");
    const model = localStorage.getItem("openrouter_model") || "openai/gpt-3.5-turbo";

    if (!apiKey) {
      alert("Please set your OpenRouter API key in Settings");
      return;
    }

    setIsGenerating(true);

    try {
      let currentText = "";
      editorRef.current.getEditorState().read(() => {
        const root = $getRoot();
        currentText = root.getTextContent();
      });

      // Extract [[instructions]]
      const instructionPattern = /\[\[(.+?)\]\]/g;
      const instructions: string[] = [];
      let match;
      while ((match = instructionPattern.exec(currentText)) !== null) {
        instructions.push(match[1]);
      }
      const cleanText = currentText.replace(instructionPattern, "");
      const allInstructions = [...previousInstructions, ...instructions];

      // Extract context
      const context = cleanText.slice(-2000);

      // Extract definitions from last 300 words
      const words = cleanText.split(/\s+/).filter(Boolean);
      const last300Words = words.slice(-300);
      const relevantDefinitions: Record<string, string> = {};

      last300Words.forEach((word) => {
        const cleanWord = word.toLowerCase().trim().replace(/[.,!?;:()'"]/g, "");
        if (definitions[cleanWord]) {
          relevantDefinitions[cleanWord] = definitions[cleanWord];
        }
      });

      // Call API
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      if (data.text) {
        // Insert generated text
        editorRef.current.update(() => {
          const root = $getRoot();
          const lastChild = root.getLastChild();

          if (lastChild && $isParagraphNode(lastChild)) {
            const textNode = $createTextNode(" " + data.text);
            lastChild.append(textNode);
          } else {
            // Create new paragraph if none exists
            const paragraph = $createParagraphNode();
            const textNode = $createTextNode(data.text);
            paragraph.append(textNode);
            root.append(paragraph);
          }
        });

        setPreviousInstructions(allInstructions);
      }
    } catch (error) {
      console.error("Generation error:", error);
      alert(error instanceof Error ? error.message : "Failed to generate text");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDefinition = (word: string, definition: string) => {
    const normalizedWord = word.toLowerCase().trim();
    const newDefinitions = { ...definitions };

    if (definition) {
      newDefinitions[normalizedWord] = definition;
    } else {
      delete newDefinitions[normalizedWord];
    }

    setDefinitions(newDefinitions);
    localStorage.setItem("word_definitions", JSON.stringify(newDefinitions));
  };

  return (
    <div
      className="px-6 pb-8 relative min-h-[calc(100vh-12rem)]"
      style={{
        background:
          "linear-gradient(135deg, rgba(249, 250, 251, 1) 0%, rgba(239, 246, 255, 0.6) 50%, rgba(245, 243, 255, 0.6) 100%)",
      }}
    >
      <div
        className="max-w-[8.5in] mx-auto glass-panel"
        style={{
          borderRadius: "24px",
          overflow: "hidden",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.1)",
        }}
      >
        <EditorToolbar
          editor={null}
          maxWords={maxWords}
          onMaxWordsChange={setMaxWords}
        />

        <div className="px-16 py-12" style={{ minHeight: "11in", position: "relative" }}>
          <LexicalComposer initialConfig={initialConfig}>
            <div style={{ position: "relative" }}>
              <RichTextPlugin
                contentEditable={
                  <ContentEditable
                    className="editor-content-editable"
                    style={{
                      outline: "none",
                      minHeight: "500px",
                      lineHeight: "1.6",
                      fontSize: "16px",
                      position: "relative",
                    }}
                  />
                }
                placeholder={
                  <div
                    className="editor-placeholder"
                    style={{
                      position: "absolute",
                      top: "0",
                      left: "0",
                      color: "#999",
                      pointerEvents: "none",
                      lineHeight: "1.6",
                      fontSize: "16px",
                    }}
                  >
                    Start writing your story here...
                  </div>
                }
                ErrorBoundary={(props: any) => <div className="error-boundary">{props.children}</div>}
              />
            </div>
            <HistoryPlugin />
            <TabIndentPlugin />
            <LoadContentPlugin />
            <AutoSavePlugin onSave={handleSave} />
            <EmphasisWordsPlugin words={emphasisWords} />
            <EditorRefPlugin editorRef={editorRef} />
          </LexicalComposer>
        </div>
      </div>

      {/* Floating Generate Panel */}
      <div
        className="fixed bottom-8 right-8 z-50 glass-panel"
        style={{
          borderRadius: "16px",
          padding: "16px",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
        }}
      >
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-6 py-3 text-sm font-medium transition-all duration-200 glass-button"
          style={{
            borderRadius: "12px",
            color: "white",
            opacity: isGenerating ? 0.7 : 1,
            minWidth: "140px",
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

      {/* Definition Modal */}
      <DefinitionModal
        isOpen={isDefinitionModalOpen}
        word={selectedWord}
        existingDefinition={definitions[selectedWord.toLowerCase().trim()] || ""}
        context={""} // We'll get this from editor
        onClose={() => setIsDefinitionModalOpen(false)}
        onSave={handleSaveDefinition}
      />
    </div>
  );
}

// Plugin to get editor reference
function EditorRefPlugin({ editorRef }: { editorRef: React.MutableRefObject<LexicalEditorType | null> }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    editorRef.current = editor;
  }, [editor, editorRef]);

  return null;
}
