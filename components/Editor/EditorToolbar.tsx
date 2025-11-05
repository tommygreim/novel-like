"use client";

import { Editor } from "@tiptap/react";

interface EditorToolbarProps {
  onGenerate: () => void;
  isGenerating: boolean;
  editor: Editor | null;
}

export default function EditorToolbar({
  onGenerate,
  isGenerating,
  editor,
}: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-3 flex items-center gap-2">
      {/* Basic formatting buttons */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
          editor.isActive("bold")
            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
        }`}
      >
        <strong>B</strong>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
          editor.isActive("italic")
            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
            : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
        }`}
      >
        <em>I</em>
      </button>

      <div className="flex-1" />

      {/* Word count */}
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {editor.storage.characterCount?.words() || editor.getText().split(/\s+/).filter(Boolean).length} words
      </span>

      {/* Generate button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          isGenerating
            ? "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
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
  );
}
