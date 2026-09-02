"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { type EmailBlock } from "../../core/types"
import {
  useEmailBuilderConfig,
  useEmailBuilderStore,
} from "../../store/email-builder-provider"
import { EditableBlockRenderer } from "./editable-block-renderer"
import {
  GripVertical,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react"

interface Props {
  block: EmailBlock
  index: number
  isFirst?: boolean
  cardBorderRadius?: number
}

export const SortableItem = ({
  block,
  index,
  isFirst = false,
  cardBorderRadius = 4,
}: Props) => {
  const config = useEmailBuilderConfig()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: block.id,
    data: { source: "canvas", index },
  })

  const selectedId = useEmailBuilderStore((s) => s.selectedId)
  const select = useEmailBuilderStore((s) => s.select)
  const removeBlock = useEmailBuilderStore((s) => s.removeBlock)
  const duplicateBlock = useEmailBuilderStore((s) => s.duplicateBlock)
  const reorder = useEmailBuilderStore((s) => s.reorder)
  const propertiesOpen = useEmailBuilderStore((s) => s.propertiesOpen)
  const setPropertiesOpen = useEmailBuilderStore((s) => s.setPropertiesOpen)

  const isSelected = selectedId === block.id
  const labels = config.labels

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        ...(isFirst
          ? {
              borderTopLeftRadius: cardBorderRadius,
              borderTopRightRadius: cardBorderRadius,
            }
          : {}),
      }}
      className={`ter-relative ter-cursor-pointer ${isDragging ? "ter-opacity-40" : ""} ${
        isSelected
          ? "ter-ring-2 ter-ring-[#d7b227]"
          : "ter-hover:ring-1 ter-hover:ring-[#d7b227]/50"
      }`}
      onClick={(e) => {
        e.stopPropagation()
        select(block.id)
      }}
    >
      {isSelected && (
        <div
          className="ter-absolute ter--top-3 ter-right-2 ter-z-20 ter-flex ter-items-center ter-gap-0.5 ter-rounded-full ter-bg-[#0d0b08] ter-px-1.5 ter-py-0.5 ter-shadow-md"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            {...listeners}
            {...attributes}
            title={labels.drag}
            className="ter-cursor-grab ter-rounded-full ter-p-1 ter-text-[#d7b227] ter-hover:bg-white/10"
          >
            <GripVertical className="ter-h-3.5 ter-w-3.5" />
          </button>
          <button
            title={labels.moveUp}
            onClick={() => index > 0 && reorder(index, index - 1)}
            className="ter-rounded-full ter-p-1 ter-text-white ter-hover:bg-white/10"
          >
            <ChevronUp className="ter-h-3.5 ter-w-3.5" />
          </button>
          <button
            title={labels.moveDown}
            onClick={() => reorder(index, index + 1)}
            className="ter-rounded-full ter-p-1 ter-text-white ter-hover:bg-white/10"
          >
            <ChevronDown className="ter-h-3.5 ter-w-3.5" />
          </button>
          <button
            title={propertiesOpen ? labels.optionsClose : labels.optionsOpen}
            onClick={() => setPropertiesOpen(!propertiesOpen)}
            className="ter-rounded-full ter-p-1 ter-text-white ter-hover:bg-white/10"
          >
            {propertiesOpen ? (
              <PanelRightClose className="ter-h-3.5 ter-w-3.5" />
            ) : (
              <PanelRightOpen className="ter-h-3.5 ter-w-3.5" />
            )}
          </button>
          <button
            title={labels.duplicate}
            onClick={() => duplicateBlock(block.id)}
            className="ter-rounded-full ter-p-1 ter-text-white ter-hover:bg-white/10"
          >
            <Copy className="ter-h-3.5 ter-w-3.5" />
          </button>
          <button
            title={labels.delete}
            onClick={() => removeBlock(block.id)}
            className="ter-rounded-full ter-p-1 ter-text-red-400 ter-hover:bg-white/10"
          >
            <Trash2 className="ter-h-3.5 ter-w-3.5" />
          </button>
        </div>
      )}
      <EditableBlockRenderer block={block} />
    </div>
  )
}
