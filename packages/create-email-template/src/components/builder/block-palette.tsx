"use client"

import { useDraggable } from "@dnd-kit/core"
import { GripVertical } from "lucide-react"
import { type BlockDefinition } from "../../core/types"
import { useEmailBuilderConfig } from "../../store/email-builder-provider"

const PaletteItem = ({
  def,
  desktop,
}: {
  def: BlockDefinition
  desktop: boolean
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${def.type}`,
    data: { source: "palette", type: def.type },
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`ter-flex ter-cursor-grab ter-items-center ter-gap-2 ter-rounded-md ter-border ter-bg-card ter-px-3 ter-py-2.5 ter-text-sm ter-font-medium ter-select-none ter-hover:border-primary ter-shrink-0 ter-lg:shrink ${
        desktop ? "ter-shrink" : ""
      } ${isDragging ? "ter-opacity-40" : ""}`}
    >
      <GripVertical className="ter-h-4 ter-w-4 ter-text-muted-foreground" />
      <div className="ter-min-w-0">
        <div className="ter-truncate">{def.label}</div>
        <div className="ter-truncate ter-text-xs ter-text-muted-foreground">
          {def.description}
        </div>
      </div>
    </div>
  )
}

export const BlockPalette = ({ desktop = false }: { desktop?: boolean }) => {
  const config = useEmailBuilderConfig()
  return (
    <div
      className={`ter-flex ter-gap-2 ter-overflow-x-auto ter-pb-1 ter-lg:flex-col ter-lg:gap-2 ter-lg:overflow-visible ter-lg:pb-0 ${
        desktop ? "ter-flex-col ter-gap-2 ter-overflow-visible ter-pb-0" : ""
      }`}
    >
      {config.blockLibrary.map((def) => (
        <PaletteItem key={def.type} def={def} desktop={desktop} />
      ))}
    </div>
  )
}
