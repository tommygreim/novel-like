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
  createTextNode,
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

import {$isTextNode } from "lexical";

// Helper to apply styles
function applyEmphasis(editor: LexicalEditorType, words: string[]) {
  editor.update(() => {
    const root = $getRoot();
    const textNodes = root.getAllTextNodes();
    
    // Create a regex from the words list
    // This regex finds any of the words, ignoring case, as whole words
    const regex = new RegExp(`\\b(${words.join("|")})\\b`, "gi");

    textNodes.forEach((node) => {
      // First, clear any existing styles to prevent duplicates
      if (node.hasStyle("animation")) {
        node.setStyle("");
      }

      const text = node.getTextContent();
      let match;

      while ((match = regex.exec(text)) !== null) {
        const word = match[0];
        const startIndex = match.index;
        const endIndex = startIndex + word.length;

        // We need to split the node to isolate the word
        let targetNode: TextNode = node;

        // 1. Split after the word
        if (endIndex < text.length) {
          targetNode = node.splitText(endIndex)[0];
        }

        // 2. Split before the word
        if (startIndex > 0) {
          targetNode = targetNode.splitText(startIndex)[1];
        }

        // Now, targetNode only contains our emphasis word
        // Apply the jiggle animation style directly
        targetNode.setStyle(
          "display: inline-block; animation: jiggle 1.5s ease-in-out infinite;"
        );
        
        // After splitting, we need to re-process the *rest* of the original node
        // The easiest way is just to let the loop continue with the remaining nodes
        // (This logic might need refinement depending on node structure)
      }
    });
  });
}

/**
 * This is the transform function that Lexical will run on
 * any TextNode that is marked as "dirty" (changed).
 */
function emphasisTransform(node: TextNode, words: string[]) {
  const text = node.getTextContent();
  
  // If no words, we don't need the regex
  if (words.length === 0) return;

  // Create a regex from the words list
  const regex = new RegExp(`\\b(${words.join("|")})\\b`, "gi");

  // We need a way to "un-style" words if they are edited
  if (node.getStyle().includes("animation")) {
    const isWordMatch = regex.test(text) && text.match(regex)?.length === 1 && text.match(regex)?.[0].length === text.length;
    if (!isWordMatch) {
      // The text was edited and is no longer *just* an emphasis word
      const writable = node.getWritable();
      writable.setStyle("");
    }
    return; // Already styled, or just un-styled. Don't try to split it.
  }

  // Find all matches in this node
  let match;
  let lastIndex = 0;
  let needsSplitting = false;
  const splits: TextNode[] = [];

  while ((match = regex.exec(text)) !== null) {
    needsSplitting = true;
    const word = match[0];
    const startIndex = match.index;
    const endIndex = startIndex + word.length;

    // 1. Add the text *before* the match (if any)
    if (startIndex > lastIndex) {
      splits.push($createTextNode(text.substring(lastIndex, startIndex)));
    }

    // 2. Create the new, styled node for the word
    const styledNode = $createTextNode(word);
    styledNode.setStyle(
      "display: inline-block; animation: jiggle 1.5s ease-in-out infinite;"
    );
    splits.push(styledNode);

    lastIndex = endIndex;
  }

  // 3. If we had matches, replace the original node
  if (needsSplitting) {
    // Add any remaining text *after* the last match
    if (lastIndex < text.length) {
      splits.push($createTextNode(text.substring(lastIndex)));
    }
    
    // Replace the original node with all the new splits
    // We must insert them in reverse order *after* the current node
    // and then remove the current node.
    splits.reverse().forEach(splitNode => {
      node.insertAfter(splitNode);
    });
    node.remove();
  }
}

// Plugin to apply emphasis words effect
export function EmphasisWordsPlugin({ words }: { words: string[] }) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Register the transform
    const unregisterTransform = editor.registerNodeTransform(TextNode, (node) => {
      // If list is empty, just clear styles
      if (words.length === 0) {
        if (node.getStyle().includes("animation")) {
          node.getWritable().setStyle("");
        }
        return;
      }
      
      // Run the transform logic
      emphasisTransform(node, words);
    });

    // When the words list changes, we need to "kick" the editor
    // to re-process all nodes.
    editor.update(() => {
      $getRoot().getAllTextNodes().forEach(node => {
        // Marking as dirty forces the transform to re-run on this node
        node.markDirty(); 
      });
    });

    // Cleanup: remove the transform when the component unmounts
    return () => {
      unregisterTransform();
    };
  }, [editor, words]); // Re-run if the editor instance or the words list changes

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
      const context = cleanText;

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
