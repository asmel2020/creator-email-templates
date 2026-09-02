"use client"

import { useEffect, useMemo, useState } from "react"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core"
import { PanelRightClose, PanelRightOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { type EmailBlockType } from "../../core/types"
import {
  useEmailBuilderConfig,
  useEmailBuilderStore,
  useEmailBuilderStoreInstance,
} from "../../store/email-builder-provider"
import { BlockPalette } from "./block-palette"
import { SortableCanvas } from "./canvas"
import { PropertiesPanel } from "./properties-panel"

export interface EmailBuilderProps {
  className?: string
}

export const EmailBuilder = ({ className }: EmailBuilderProps) => {
  const config = useEmailBuilderConfig()
  const store = useEmailBuilderStoreInstance()
  const blocks = useEmailBuilderStore((s) => s.blocks)
  const selectedId = useEmailBuilderStore((s) => s.selectedId)
  const propertiesOpen = useEmailBuilderStore((s) => s.propertiesOpen)
  const setPropertiesOpen = useEmailBuilderStore((s) => s.setPropertiesOpen)
  const addBlock = useEmailBuilderStore((s) => s.addBlock)
  const reorder = useEmailBuilderStore((s) => s.reorder)

  // Ctrl/Cmd+Z deshace a nivel de bloque. Si el foco está en un
  // contenteditable, se respeta el undo nativo del editor de texto.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "z") return
      const target = e.target as HTMLElement | null
      if (target?.isContentEditable || target?.closest?.("[contenteditable='true'], input, textarea, select")) {
        return
      }
      if (store.getState().past.length === 0) return
      e.preventDefault()
      store.getState().undo()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [store])

  const [activeDrag, setActiveDrag] = useState<{
    type: EmailBlockType
    source: "palette" | "canvas"
  } | null>(null)
  const [isDesktop, setIsDesktop] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 1024px)").matches
  )

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)")
    const onChange = () => setIsDesktop(mql.matches)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const selectedBlock = useMemo(
    () => blocks.find((b) => b.id === selectedId) || null,
    [blocks, selectedId]
  )

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current
    if (data?.source === "palette") {
      setActiveDrag({ type: data.type as EmailBlockType, source: "palette" })
    } else if (data?.source === "canvas") {
      setActiveDrag({
        type: blocks[data.index as number]?.type as EmailBlockType,
        source: "canvas",
      })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDrag(null)
    const { active, over } = event
    if (!over) return

    const activeData = active.data.current
    const overData = over.data.current

    if (activeData?.source === "palette" && activeData.type) {
      const index = overData?.index ?? blocks.length
      addBlock(activeData.type as EmailBlockType, index)
    } else if (
      activeData?.source === "canvas" &&
      overData?.source === "canvas"
    ) {
      reorder(activeData.index as number, overData.index as number)
    }
  }

  const labels = config.labels

  return (
    <div className={cn("ter-theme ter-flex ter-h-[calc(100vh-120px)] ter-flex-col ter-gap-4", className)}>
      {/* safelist para lg: variantes arbitrarias que van en ternarios */}
      <div className="ter-hidden ter-lg:grid-cols-[240px_1fr_300px] ter-lg:grid-cols-[240px_1fr_48px] ter-lg:grid-rows-1 ter-lg:overflow-hidden ter-lg:min-h-0 ter-lg:overflow-y-auto ter-lg:h-full ter-lg:flex-col ter-lg:gap-2 ter-lg:overflow-visible ter-lg:pb-0 ter-lg:shrink" />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveDrag(null)}
      >
        <div
          className={`ter-grid ter-flex-1 ter-gap-4 ter-grid-cols-1 ter-overflow-y-auto ter-lg:grid-rows-1 ter-lg:overflow-hidden ${
            isDesktop
              ? propertiesOpen
                ? "ter-grid-cols-[240px_1fr_300px]"
                : "ter-grid-cols-[240px_1fr_48px]"
              : ""
          } ${
            propertiesOpen
              ? "ter-lg:grid-cols-[240px_1fr_300px]"
              : "ter-lg:grid-cols-[240px_1fr_48px]"
          }`}
        >
          <div
            className={`ter-rounded-xl ter-border ter-bg-card ter-p-3 ter-shrink-0 ter-lg:min-h-0 ter-lg:overflow-y-auto ${
              isDesktop ? "ter-min-h-0 ter-overflow-y-auto" : "ter-min-h-[110px] ter-overflow-visible"
            }`}
          >
            <h3 className="ter-mb-3 ter-text-sm ter-font-bold">{labels.blocksTitle}</h3>
            <BlockPalette desktop={isDesktop} />
          </div>

          <div
            className={`ter-min-w-0 ter-lg:h-full ter-lg:min-h-0 ${
              isDesktop ? "ter-h-full ter-min-h-0" : ""
            }`}
          >
            <SortableCanvas desktop={isDesktop} />
          </div>

          {isDesktop &&
            (propertiesOpen ? (
              <div className="ter-flex ter-min-h-0 ter-flex-col ter-overflow-y-auto ter-rounded-xl ter-border ter-bg-card ter-p-4">
                <div className="ter-mb-3 ter-flex ter-items-center ter-justify-between">
                  <h3 className="ter-text-sm ter-font-bold">{labels.optionsTitle}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ter-h-7 ter-w-7"
                    title={labels.optionsClose}
                    onClick={() => setPropertiesOpen(false)}
                  >
                    <PanelRightClose className="ter-h-4 ter-w-4" />
                  </Button>
                </div>
                {selectedBlock ? (
                  <PropertiesPanel block={selectedBlock} />
                ) : (
                  <p className="ter-py-10 ter-text-center ter-text-sm ter-text-muted-foreground">
                    {labels.noSelection}
                  </p>
                )}
              </div>
            ) : (
              <div className="ter-flex ter-justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  className="ter-gap-1.5"
                  onClick={() => setPropertiesOpen(true)}
                  title={labels.optionsOpen}
                >
                  <PanelRightOpen className="ter-h-4 ter-w-4" />
                </Button>
              </div>
            ))}
        </div>

        <DragOverlay>
          {activeDrag && (
            <div className="ter-rounded-md ter-border ter-bg-card ter-px-4 ter-py-3 ter-text-sm ter-font-semibold ter-shadow-lg">
              {config.blockMap[activeDrag.type].label}
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {!isDesktop && (
        <>
          <button
            type="button"
            onClick={() => setPropertiesOpen(true)}
            className="ter-fixed ter-right-4 ter-bottom-20 ter-z-30 ter-flex ter-items-center ter-gap-1.5 ter-rounded-full ter-bg-[#0d0b08] ter-px-4 ter-py-2 ter-text-sm ter-font-semibold ter-text-[#d7b227] ter-shadow-lg"
          >
            <PanelRightOpen className="ter-h-4 ter-w-4" />
            {labels.optionsTitle}
          </button>

          <Sheet open={propertiesOpen} onOpenChange={setPropertiesOpen}>
            <SheetContent side="right" className="ter-w-[85vw] ter-p-0 ter-sm:max-w-sm">
              <SheetHeader className="ter-px-4 ter-pt-5 ter-pb-2 ter-text-left">
                <SheetTitle>{labels.optionsTitle}</SheetTitle>
              </SheetHeader>
              <div className="ter-overflow-y-auto ter-px-4 ter-pb-8">
                {selectedBlock ? (
                  <PropertiesPanel block={selectedBlock} />
                ) : (
                  <p className="ter-py-10 ter-text-center ter-text-sm ter-text-muted-foreground">
                    {labels.noSelection}
                  </p>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </>
      )}
    </div>
  )
}
