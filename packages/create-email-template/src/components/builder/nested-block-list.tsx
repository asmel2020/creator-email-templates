"use client"

// Lista de bloques anidados (dentro de container/columns). A diferencia del
// canvas raíz no usa dnd-kit para ordenar: el reordenamiento es por botones.
// Sí expone un droppable para que la paleta pueda soltar bloques nuevos.
import { useDroppable } from "@dnd-kit/core"
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Plus,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  useEmailBuilderConfig,
  useEmailBuilderStore,
} from "../../store/email-builder-provider"
import { getBlockList, locationKey, type BlockLocation } from "../../store/block-tree"
import { EditableBlockRenderer } from "./editable-block-renderer"

interface Props {
  location: BlockLocation
  emptyLabel?: string
}

export const NestedBlockList = ({ location, emptyLabel }: Props) => {
  const config = useEmailBuilderConfig()
  const blocks = useEmailBuilderStore((s) => s.blocks)
  const selectedId = useEmailBuilderStore((s) => s.selectedId)
  const select = useEmailBuilderStore((s) => s.select)
  const removeBlock = useEmailBuilderStore((s) => s.removeBlock)
  const duplicateBlock = useEmailBuilderStore((s) => s.duplicateBlock)
  const reorder = useEmailBuilderStore((s) => s.reorder)
  const labels = config.labels

  const list = getBlockList(blocks, location)
  const { setNodeRef, isOver } = useDroppable({
    id: `nested:${locationKey(location)}`,
    data: { source: "canvas", location, index: list.length },
  })

  return (
    <div
      ref={setNodeRef}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "ter-flex ter-min-h-[40px] ter-flex-col",
        isOver && "ter-ring-1 ter-ring-[#d7b227]",
      )}
    >
      {list.map((child, index) => {
        const isSelected = selectedId === child.id
        return (
          <div
            key={child.id}
            className={cn(
              "ter-relative ter-cursor-pointer",
              isSelected
                ? "ter-ring-2 ter-ring-[#d7b227]"
                : "ter-hover:ring-1 ter-hover:ring-[#d7b227]/50",
            )}
            onClick={(e) => {
              e.stopPropagation()
              select(child.id)
            }}
          >
            {isSelected && (
              <div
                className="ter-absolute ter--top-3 ter-right-1 ter-z-20 ter-flex ter-items-center ter-gap-0.5 ter-rounded-full ter-bg-[#0d0b08] ter-px-1.5 ter-py-0.5 ter-shadow-md"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  title={labels.moveUp}
                  onClick={() => index > 0 && reorder(index, index - 1, location)}
                  className="ter-rounded-full ter-p-1 ter-text-white ter-hover:bg-white/10"
                >
                  <ChevronUp className="ter-h-3.5 ter-w-3.5" />
                </button>
                <button
                  type="button"
                  title={labels.moveDown}
                  onClick={() => reorder(index, index + 1, location)}
                  className="ter-rounded-full ter-p-1 ter-text-white ter-hover:bg-white/10"
                >
                  <ChevronDown className="ter-h-3.5 ter-w-3.5" />
                </button>
                <button
                  type="button"
                  title={labels.duplicate}
                  onClick={() => duplicateBlock(child.id)}
                  className="ter-rounded-full ter-p-1 ter-text-white ter-hover:bg-white/10"
                >
                  <Copy className="ter-h-3.5 ter-w-3.5" />
                </button>
                <button
                  type="button"
                  title={labels.delete}
                  onClick={() => removeBlock(child.id)}
                  className="ter-rounded-full ter-p-1 ter-text-red-400 ter-hover:bg-white/10"
                >
                  <Trash2 className="ter-h-3.5 ter-w-3.5" />
                </button>
              </div>
            )}
            <EditableBlockRenderer block={child} />
          </div>
        )
      })}

      {list.length === 0 && (
        <div className="ter-flex ter-min-h-[36px] ter-items-center ter-justify-center ter-gap-1.5 ter-rounded-md ter-border ter-border-dashed ter-border-border ter-px-2 ter-py-2 ter-text-[11px] ter-text-muted-foreground">
          <Plus className="ter-h-3.5 ter-w-3.5" />
          {emptyLabel ?? config.labels.dragToStart}
        </div>
      )}
    </div>
  )
}
