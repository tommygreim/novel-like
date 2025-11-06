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
    <div className="flex items-center gap-3 px-8 py-4" style={{
      borderBottom: '1px solid rgba(229, 231, 235, 0.5)',
      background: 'linear-gradient(to right, rgba(255, 255, 255, 0.4), rgba(249, 250, 251, 0.4))',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)'
    }}>
      {/* Basic formatting buttons */}
      <div className="flex gap-2 p-1" style={{
        background: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '10px',
        border: '1px solid rgba(229, 231, 235, 0.3)'
      }}>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className="px-3 py-1.5 text-sm font-bold transition-all duration-200"
          style={editor.isActive("bold") ? {
            background: 'rgba(59, 130, 246, 0.2)',
            color: 'rgb(29, 78, 216)',
            borderRadius: '8px',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)'
          } : {
            color: 'rgb(75, 85, 99)',
            borderRadius: '8px'
          }}
        >
          B
        </button>

        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className="px-3 py-1.5 text-sm font-medium italic transition-all duration-200"
          style={editor.isActive("italic") ? {
            background: 'rgba(59, 130, 246, 0.2)',
            color: 'rgb(29, 78, 216)',
            borderRadius: '8px',
            boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)'
          } : {
            color: 'rgb(75, 85, 99)',
            borderRadius: '8px'
          }}
        >
          I
        </button>
      </div>

      <div className="flex-1" />

      {/* Word count */}
      <span className="text-sm px-3 py-1.5" style={{
        color: 'rgb(75, 85, 99)',
        background: 'rgba(255, 255, 255, 0.3)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderRadius: '10px',
        border: '1px solid rgba(229, 231, 235, 0.3)'
      }}>
        {editor.storage.characterCount?.words() || editor.getText().split(/\s+/).filter(Boolean).length} words
      </span>

      {/* Generate button */}
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="px-6 py-2.5 text-sm font-medium transition-all duration-200 glass-button"
        style={{
          borderRadius: '12px',
          color: 'white'
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
  );
}
