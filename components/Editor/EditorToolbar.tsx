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
    <div className="border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-white/40 to-gray-50/40 dark:from-gray-800/40 dark:to-gray-900/40 backdrop-blur-sm px-8 py-4 flex items-center gap-3">
      {/* Basic formatting buttons */}
      <div className="flex gap-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg p-1 border border-gray-200/30 dark:border-gray-700/30">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`px-3 py-1.5 text-sm font-bold rounded-md transition-all duration-200 ${
            editor.isActive("bold")
              ? "bg-blue-500/20 dark:bg-blue-500/30 text-blue-700 dark:text-blue-300 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50"
          }`}
        >
          B
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`px-3 py-1.5 text-sm font-medium italic rounded-md transition-all duration-200 ${
            editor.isActive("italic")
              ? "bg-blue-500/20 dark:bg-blue-500/30 text-blue-700 dark:text-blue-300 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50"
          }`}
        >
          I
        </button>
      </div>

      <div className="flex-1" />

      {/* Word count */}
      <span className="text-sm text-gray-600 dark:text-gray-400 bg-white/30 dark:bg-gray-800/30 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-200/30 dark:border-gray-700/30">
        {editor.storage.characterCount?.words() || editor.getText().split(/\s+/).filter(Boolean).length} words
      </span>

      {/* Generate button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className={`px-6 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 shadow-md ${
          isGenerating
            ? "bg-gray-300/50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 cursor-not-allowed backdrop-blur-sm"
            : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-blue-500/50 dark:shadow-blue-400/30"
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
