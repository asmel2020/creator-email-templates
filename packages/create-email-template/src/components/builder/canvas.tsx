"use client";

import { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableItem } from "./sortable-item";
import {
  useEmailBuilderConfig,
  useEmailBuilderStore,
} from "../../store/email-builder-provider";
import {
  Smartphone,
  Monitor,
  Plus,
  Settings,
  Info,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { VariablesInfoDialog } from "./variables-info-dialog";

type Device = "mobile" | "desktop";

const DEVICE_WIDTH: Record<Device, number> = {
  mobile: 375,
  desktop: 600,
};

export const SortableCanvas = ({
  desktop = false,
}: {
  desktop?: boolean;
}) => {
  const config = useEmailBuilderConfig();
  const blocks = useEmailBuilderStore((s) => s.blocks);
  const select = useEmailBuilderStore((s) => s.select);
  const pageBackground = useEmailBuilderStore((s) => s.settings.pageBackground);
  const cardBorderWidth = useEmailBuilderStore((s) => s.settings.cardBorderWidth);
  const cardBorderRadius = useEmailBuilderStore((s) => s.settings.cardBorderRadius);
  const setSettings = useEmailBuilderStore((s) => s.setSettings);
  const [device, setDevice] = useState<Device>("desktop");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const { setNodeRef: setEndRef, isOver } = useDroppable({
    id: "canvas-end",
    data: { source: "canvas", index: blocks.length },
  });

  return (
    <div
      className={`ter-rounded-xl ter-border ter-p-4 ter-overflow-y-auto ter-min-h-[60vh] ter-lg:h-full ter-lg:min-h-0 ${
        desktop ? "ter-h-full ter-min-h-0" : ""
      }`}
      style={{ backgroundColor: pageBackground }}
      onClick={() => select(null)}
    >
      <div className="ter-mb-3 ter-flex ter-items-center ter-justify-between">
        <span className="ter-flex ter-items-center ter-gap-1.5 ter-text-xs ter-text-muted-foreground">
          <Smartphone className="ter-h-3.5 ter-w-3.5" />
          {config.labels.canvasPreview} ({DEVICE_WIDTH[device]}px)
        </span>

        <div className="ter-flex ter-items-center ter-gap-1.5">
          <button
            type="button"
            title={config.labels.variablesInfoTitle}
            onClick={(e) => {
              e.stopPropagation();
              setSettingsOpen(false);
              setInfoOpen(true);
            }}
            className="ter-rounded-md ter-border ter-bg-background ter-p-1.5 ter-text-muted-foreground ter-transition-colors ter-hover:text-foreground"
          >
            <Info className="ter-h-3.5 ter-w-3.5" />
          </button>

          <div className="ter-relative">
            <button
              type="button"
              title={config.labels.settings}
              onClick={(e) => {
                e.stopPropagation();
                setSettingsOpen((o) => !o);
              }}
              className={cn(
                "ter-rounded-md ter-border ter-bg-background ter-p-1.5 ter-transition-colors",
                settingsOpen
                  ? "ter-border-[#d7b227] ter-text-[#a98a1e]"
                  : "ter-text-muted-foreground ter-hover:text-foreground",
              )}
            >
              <Settings className="ter-h-3.5 ter-w-3.5" />
            </button>

            {settingsOpen && (
              <div
                className="ter-absolute ter-right-0 ter-top-full ter-z-40 ter-mt-1 ter-w-60 ter-rounded-lg ter-border ter-bg-card ter-p-3 ter-shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="ter-grid ter-gap-2.5">
                  <div className="ter-flex ter-items-center ter-justify-between">
                    <span className="ter-text-xs ter-font-semibold ter-text-muted-foreground ter-uppercase">
                      {config.labels.settings}
                    </span>
                    <button
                      type="button"
                      title="Cerrar"
                      onClick={() => setSettingsOpen(false)}
                      className="ter-rounded ter-p-1 ter-text-muted-foreground ter-transition-colors ter-hover:text-foreground"
                    >
                      <X className="ter-h-3.5 ter-w-3.5" />
                    </button>
                  </div>

                  <div className="ter-grid ter-gap-1">
                    <label className="ter-text-xs ter-font-semibold ter-text-muted-foreground ter-uppercase">
                      {config.labels.pageBackground}
                    </label>
                    <div className="ter-flex ter-items-center ter-gap-2">
                      <input
                        type="color"
                        value={
                          /^#[0-9a-fA-F]{6}$/.test(pageBackground)
                            ? pageBackground
                            : "#f5f1e8"
                        }
                        onChange={(e) =>
                          setSettings({ pageBackground: e.target.value })
                        }
                        className="ter-h-7 ter-w-9 ter-cursor-pointer ter-rounded ter-border-0 ter-bg-transparent ter-p-0"
                      />
                      <span className="ter-font-mono ter-text-xs ter-text-muted-foreground">
                        {pageBackground}
                      </span>
                    </div>
                  </div>

                  <div className="ter-grid ter-gap-1">
                    <label className="ter-text-xs ter-font-semibold ter-text-muted-foreground ter-uppercase">
                      {config.labels.cardBorderWidth}
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      value={cardBorderWidth}
                      onChange={(e) =>
                        setSettings({ cardBorderWidth: Number(e.target.value) })
                      }
                    />
                  </div>

                  <div className="ter-grid ter-gap-1">
                    <label className="ter-text-xs ter-font-semibold ter-text-muted-foreground ter-uppercase">
                      {config.labels.cardBorderRadius}
                    </label>
                    <Input
                      type="number"
                      min={0}
                      max={40}
                      value={cardBorderRadius}
                      onChange={(e) =>
                        setSettings({ cardBorderRadius: Number(e.target.value) })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="ter-flex ter-items-center ter-gap-0.5 ter-rounded-md ter-border ter-bg-background ter-p-0.5">
            <button
              type="button"
              title={config.labels.deviceMobile}
              onClick={(e) => {
                e.stopPropagation();
                setDevice("mobile");
              }}
              className={cn(
                "ter-rounded ter-p-1.5 ter-transition-colors",
                device === "mobile"
                  ? "ter-bg-primary ter-text-primary-foreground"
                  : "ter-text-muted-foreground ter-hover:text-foreground",
              )}
            >
              <Smartphone className="ter-h-3.5 ter-w-3.5" />
            </button>
            <button
              type="button"
              title={config.labels.deviceDesktop}
              onClick={(e) => {
                e.stopPropagation();
                setDevice("desktop");
              }}
              className={cn(
                "ter-rounded ter-p-1.5 ter-transition-colors",
                device === "desktop"
                  ? "ter-bg-primary ter-text-primary-foreground"
                  : "ter-text-muted-foreground ter-hover:text-foreground",
              )}
            >
              <Monitor className="ter-h-3.5 ter-w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <SortableContext
        items={blocks.map((b) => b.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          className="ter-mx-auto ter-mt-6 ter-bg-white ter-shadow-sm ter-transition-all ter-duration-300"
          style={{
            maxWidth: DEVICE_WIDTH[device],
            border: `${cardBorderWidth}px solid #e3dccb`,
            borderRadius: cardBorderRadius,
          }}
        >
          {blocks.map((block, index) => (
            <SortableItem
              key={block.id}
              block={block}
              index={index}
              isFirst={index === 0}
              cardBorderRadius={cardBorderRadius}
            />
          ))}

          <div
            ref={setEndRef}
            onClick={(e) => e.stopPropagation()}
            className={`ter-flex ter-min-h-[44px] ter-items-center ter-justify-center ter-gap-2 ter-border-t ter-border-dashed ter-px-3 ter-py-2 ter-text-xs ter-transition-colors ${
              isOver
                ? "ter-border-[#d7b227] ter-bg-[#d7b227]/15 ter-text-[#a98a1e]"
                : "ter-border-transparent ter-text-muted-foreground/60"
            }`}
            style={{
              borderBottomLeftRadius: cardBorderRadius,
              borderBottomRightRadius: cardBorderRadius,
            }}
          >
            <Plus className="ter-h-4 ter-w-4" />
            {blocks.length === 0
              ? config.labels.dragToStart
              : config.labels.dropAtEnd}
          </div>
        </div>
      </SortableContext>

      <VariablesInfoDialog open={infoOpen} onOpenChange={setInfoOpen} />
    </div>
  );
};
