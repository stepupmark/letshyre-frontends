import { useTranslation } from "@workspace/i18n/react"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Kbd } from "@workspace/ui/components/kbd"
import { Separator } from "@workspace/ui/components/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip"
import { useEditorState, type Editor } from "@tiptap/react"
import {
  Bold,
  Braces,
  Info,
  Italic,
  Link2,
  List,
  ListOrdered,
  Redo2,
  RectangleHorizontal,
  Undo2,
  type LucideIcon,
} from "lucide-react"

import { insertCallout, insertField } from "../../lib/editor/commands"
import { MERGE_FIELDS } from "../../lib/merge-fields"

export function EditorToolbar({
  editor,
  labelOf,
  onLink,
  onButton,
}: {
  editor: Editor
  labelOf: (key: string) => string | null
  onLink: () => void
  onButton: () => void
}) {
  const { t } = useTranslation("invitations")
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current.isActive("bold"),
      italic: current.isActive("italic"),
      bullet: current.isActive("bulletList"),
      ordered: current.isActive("orderedList"),
      link: current.isActive("link"),
      undo: current.can().undo(),
      redo: current.can().redo(),
    }),
  })
  const chain = () => editor.chain().focus()

  return (
    <div
      role="toolbar"
      aria-label={t("toolbar.label")}
      className="sticky top-14 z-1 flex flex-wrap items-center gap-0.5 rounded-t-lg border-b bg-card p-1"
    >
      <Tool
        icon={Bold}
        label={t("toolbar.bold")}
        keys={t("toolbar.keys.bold")}
        pressed={state.bold}
        onClick={() => chain().toggleBold().run()}
      />
      <Tool
        icon={Italic}
        label={t("toolbar.italic")}
        keys={t("toolbar.keys.italic")}
        pressed={state.italic}
        onClick={() => chain().toggleItalic().run()}
      />
      <Gap />
      <Tool
        icon={List}
        label={t("toolbar.bullets")}
        keys={t("toolbar.keys.bullets")}
        pressed={state.bullet}
        onClick={() => chain().toggleBulletList().run()}
      />
      <Tool
        icon={ListOrdered}
        label={t("toolbar.numbers")}
        keys={t("toolbar.keys.numbers")}
        pressed={state.ordered}
        onClick={() => chain().toggleOrderedList().run()}
      />
      <Gap />
      <Tool
        icon={Link2}
        label={t("toolbar.link")}
        keys={t("toolbar.keys.link")}
        pressed={state.link}
        onClick={onLink}
      />
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger
            render={
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-muted-foreground"
                  />
                }
              />
            }
          >
            <Braces />
            {t("toolbar.insertField")}
          </TooltipTrigger>
          <TooltipContent>
            {t("toolbar.insertFieldHint")} <Kbd>{t("toolbar.keys.field")}</Kbd>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>{t("toolbar.fields")}</DropdownMenuLabel>
          {MERGE_FIELDS.map((key) => (
            <DropdownMenuItem
              key={key}
              onClick={() => insertField(editor, key)}
            >
              <span className="flex-1 truncate">{labelOf(key)}</span>
              <code className="font-mono text-xs text-muted-foreground">
                {key}
              </code>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <Tool
        icon={RectangleHorizontal}
        label={t("toolbar.button")}
        onClick={onButton}
      />
      <Tool
        icon={Info}
        label={t("toolbar.callout")}
        onClick={() => insertCallout(editor)}
      />
      <span className="ms-auto flex">
        <Tool
          icon={Undo2}
          label={t("toolbar.undo")}
          keys={t("toolbar.keys.undo")}
          disabled={!state.undo}
          onClick={() => chain().undo().run()}
        />
        <Tool
          icon={Redo2}
          label={t("toolbar.redo")}
          keys={t("toolbar.keys.redo")}
          disabled={!state.redo}
          onClick={() => chain().redo().run()}
        />
      </span>
    </div>
  )
}

function Gap() {
  return <Separator orientation="vertical" className="mx-1 h-5" />
}

function Tool({
  icon: Icon,
  label,
  keys,
  pressed,
  disabled = false,
  onClick,
}: {
  icon: LucideIcon
  label: string
  keys?: string
  pressed?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            aria-pressed={pressed}
            disabled={disabled}
            onMouseDown={(event) => {
              event.preventDefault()
            }}
            onClick={onClick}
            className="text-muted-foreground aria-pressed:bg-accent aria-pressed:text-foreground max-md:size-10"
          />
        }
      >
        <Icon />
      </TooltipTrigger>
      <TooltipContent>
        {label}
        {keys && <Kbd>{keys}</Kbd>}
      </TooltipContent>
    </Tooltip>
  )
}
