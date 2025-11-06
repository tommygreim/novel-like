import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export interface EmphasisOptions {
  emphasisWords: string[];
}

export const EmphasisExtension = Extension.create<EmphasisOptions>({
  name: "emphasis",

  addOptions() {
    return {
      emphasisWords: [],
    };
  },

  addProseMirrorPlugins() {
    const extension = this;

    return [
      new Plugin({
        key: new PluginKey("emphasis"),

        state: {
          init(_, state) {
            // Get current emphasis words
            const emphasisWords = extension.options.emphasisWords;

            if (emphasisWords.length === 0) {
              return DecorationSet.empty;
            }

            const decorations: Decoration[] = [];
            const doc = state.doc;

            // Traverse all text nodes in the document
            doc.descendants((node, pos) => {
              if (!node.isText || !node.text) {
                return;
              }

              const text = node.text;

              // Find all words in the text
              const wordRegex = /\b[\w']+\b/g;
              let match;

              while ((match = wordRegex.exec(text)) !== null) {
                const word = match[0];
                const wordStart = match.index;
                const wordEnd = wordStart + word.length;

                // Check if this word is in the emphasis list (case-insensitive)
                if (emphasisWords.includes(word.toLowerCase())) {
                  const from = pos + wordStart;
                  const to = pos + wordEnd;

                  // Create inline decoration with special class
                  const decoration = Decoration.inline(from, to, {
                    class: 'emphasis-word',
                    'data-word': word,
                  });

                  decorations.push(decoration);
                }
              }
            });

            return DecorationSet.create(doc, decorations);
          },
          apply(tr, oldDecorationSet, oldState, newState) {
            // Get current emphasis words
            const emphasisWords = extension.options.emphasisWords;

            if (emphasisWords.length === 0) {
              return DecorationSet.empty;
            }

            const decorations: Decoration[] = [];
            const doc = newState.doc;

            // Traverse all text nodes in the document
            doc.descendants((node, pos) => {
              if (!node.isText || !node.text) {
                return;
              }

              const text = node.text;

              // Find all words in the text
              const wordRegex = /\b[\w']+\b/g;
              let match;

              while ((match = wordRegex.exec(text)) !== null) {
                const word = match[0];
                const wordStart = match.index;
                const wordEnd = wordStart + word.length;

                // Check if this word is in the emphasis list (case-insensitive)
                if (emphasisWords.includes(word.toLowerCase())) {
                  const from = pos + wordStart;
                  const to = pos + wordEnd;

                  // Create inline decoration with special class
                  const decoration = Decoration.inline(from, to, {
                    class: 'emphasis-word',
                    'data-word': word,
                  });

                  decorations.push(decoration);
                }
              }
            });

            return DecorationSet.create(doc, decorations);
          },
        },

        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});
