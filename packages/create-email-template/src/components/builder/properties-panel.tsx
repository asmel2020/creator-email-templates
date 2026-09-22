"use client"

import { type EmailBlock } from "../../core/types"
import { useEmailBuilderConfig, useEmailBuilderStore } from "../../store/email-builder-provider"
import { FieldsRenderer } from "./field-editors"
import { getBlockView } from "../../block-views"

interface Props {
  block: EmailBlock
}

export const PropertiesPanel = ({ block }: Props) => {
  const config = useEmailBuilderConfig()
  const updateBlockProps = useEmailBuilderStore((s) => s.updateBlockProps)
  const labels = config.labels

  const set = (patch: Record<string, unknown>) => {
    updateBlockProps(block.id, { ...block.props, ...patch })
  }

  const type = block.type
  const def = config.blockMap[type]
  const view = getBlockView(type)

  if (!def) {
    return (
      <p className="ter-py-6 ter-text-center ter-text-sm ter-text-muted-foreground">
        {labels.noSelection}
      </p>
    )
  }

  return (
    <div className="ter-space-y-4">
      <div>
        <h3 className="ter-text-sm ter-font-bold">{def.label}</h3>
        <p className="ter-text-xs ter-text-muted-foreground">{def.description}</p>
      </div>

      {view?.richInline ? (
        <p className="ter-flex ter-items-center ter-gap-1.5 ter-rounded-md ter-border ter-border-dashed ter-border-border ter-bg-muted/40 ter-px-3 ter-py-2 ter-text-xs ter-text-muted-foreground">
          {labels.editInlineHint}
        </p>
      ) : null}

      {view?.fields ? (
        <FieldsRenderer
          props={block.props}
          set={set}
          labels={labels}
          fields={view.fields}
        />
      ) : null}
    </div>
  )
}
