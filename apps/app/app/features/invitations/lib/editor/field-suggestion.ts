import { PluginKey } from "@tiptap/pm/state"
import { Extension } from "@tiptap/react"
import {
  Suggestion,
  type SuggestionKeyDownProps,
  type SuggestionProps,
} from "@tiptap/suggestion"

import { MERGE_FIELDS, type MergeField } from "../merge-fields"

export type FieldMenuProps = SuggestionProps<MergeField, MergeField>

export interface FieldMenuBridge {
  show: (props: FieldMenuProps) => void
  hide: () => void
  keyDown: (props: SuggestionKeyDownProps) => boolean
}

export interface FieldSuggestionOptions {
  bridge: FieldMenuBridge
  labelOf: (key: string) => string | null
}

const fold = (text: string) => text.toLowerCase().replace(/[\s_]+/g, "")

/** Typing {{ opens a menu of fields; the query filters by key or translated label. */
export const FieldSuggestion = Extension.create<FieldSuggestionOptions>({
  name: "fieldSuggestion",

  addOptions: () => ({
    bridge: {
      show: () => undefined,
      hide: () => undefined,
      keyDown: () => false,
    },
    labelOf: () => null,
  }),

  addProseMirrorPlugins() {
    const { bridge, labelOf } = this.options
    return [
      Suggestion<MergeField, MergeField>({
        pluginKey: new PluginKey("fieldSuggestion"),
        editor: this.editor,
        char: "{{",
        allowedPrefixes: null,
        items: ({ query }) =>
          MERGE_FIELDS.filter(
            (key) =>
              fold(key).includes(fold(query)) ||
              fold(labelOf(key) ?? "").includes(fold(query))
          ),
        command: ({ editor, range, props: key }) => {
          editor
            .chain()
            .focus()
            .insertContentAt(range, { type: "mergeField", attrs: { key } })
            .run()
        },
        render: () => ({
          onStart: bridge.show,
          onUpdate: bridge.show,
          onExit: bridge.hide,
          onKeyDown: bridge.keyDown,
        }),
      }),
    ]
  },
})
