"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";
import EditorToolbar from "./EditorToolbar";

export default function Editor() {
  const [isGenerating, setIsGenerating] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Start writing your story here...</p>",
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none",
      },
    },
  });

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

      // Call our API route
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          context,
          apiKey,
          model,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate text");
      }

      const data = await response.json();

      // Append generated text to the editor
      if (data.text) {
        editor.commands.focus("end");
        editor.commands.insertContent(data.text);
      }
    } catch (error) {
      console.error("Generation error:", error);
      alert(error instanceof Error ? error.message : "Failed to generate text");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-950 border-x border-b border-gray-200 dark:border-gray-800">
      <EditorToolbar
        onGenerate={handleGenerate}
        isGenerating={isGenerating}
        editor={editor}
      />
      <div className="px-6 py-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
