"use client";

import React, { useState } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Palette,
  ChevronUp,
  ChevronDown,
  Check,
} from "lucide-react";

interface Props {
  style: React.CSSProperties;
  onFormat: (command: string, value?: string) => void;
  innerRef?: React.Ref<HTMLDivElement>;
  selectionSize: number | null;
  selectionMaxSize: number;
  selectionColor: string | null;
}

const COLORS = [
  "#0d0b08",
  "#221d15",
  "#6b7280",
  "#ffffff",
  "#d7b227",
  "#a98a1e",
  "#dc2626",
  "#16a34a",
  "#2563eb",
  "#9333ea",
  "#ea580c",
  "#0e7490",
];

export const SelectionToolbar = ({
  style,
  onFormat,
  innerRef,
  selectionSize,
  selectionMaxSize,
  selectionColor,
}: Props) => {
  const [colorOpen, setColorOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [override, setOverride] = useState<number | null>(null);
  const [prevSelectionSize, setPrevSelectionSize] = useState(selectionSize);

  const activeColor = selectionColor?.toLowerCase() ?? null;
  const isPresetColor =
    activeColor !== null && COLORS.some((c) => c === activeColor);

  if (prevSelectionSize !== selectionSize) {
    setPrevSelectionSize(selectionSize);
    setOverride(null);
  }

  const displayValue = override ?? selectionSize ?? "";

  const toggleColor = (open: boolean) => {
    setColorOpen(open);
    if (open) setLinkOpen(false);
  };

  const toggleLink = (open: boolean) => {
    setLinkOpen(open);
    if (open) {
      setColorOpen(false);
      setLinkUrl("");
    }
  };

  const saveLink = (e: React.FormEvent) => {
    e.preventDefault();
    const url = linkUrl.trim();
    if (!url) return;
    onFormat("createLink", url);
    setLinkUrl("");
    setLinkOpen(false);
  };

  const pickColor = (hex: string) => {
    onFormat("foreColor", hex);
    setColorOpen(false);
  };

  const applySize = (value: number) => {
    if (!Number.isFinite(value) || value === 0) return;
    const clamped = Math.min(64, Math.max(8, value));
    setOverride(clamped);
    onFormat("fontSize", String(clamped));
  };

  const stepSize = (dir: 1 | -1) => {
    const base = override ?? selectionSize ?? selectionMaxSize;
    applySize(base + dir);
  };

  const btn =
    "ter-p-1.5 ter-rounded ter-text-[#f5f1e8] ter-hover:bg-white/10 ter-transition-colors";
  const sep = "ter-mx-0.5 ter-h-4 ter-w-px ter-bg-white/20";

  return (
    <div
      ref={innerRef}
      className="ter-absolute ter-z-50 ter-flex ter-max-w-[480px] ter-flex-wrap ter-items-center ter-gap-0.5 ter-rounded-lg ter-border ter-border-[#d7b227]/40 ter-bg-[#0d0b08] ter-px-1.5 ter-py-1 ter-shadow-xl"
      style={style}
      onMouseDown={(e) => {
        if (e.target instanceof HTMLInputElement) return;
        e.preventDefault();
      }}
      role="toolbar"
      aria-label="Formato de texto"
    >
      <button type="button" className={btn} title="Negrita" onClick={() => onFormat("bold")}>
        <Bold className="ter-h-4 ter-w-4" />
      </button>
      <button type="button" className={btn} title="Cursiva" onClick={() => onFormat("italic")}>
        <Italic className="ter-h-4 ter-w-4" />
      </button>
      <button type="button" className={btn} title="Subrayado" onClick={() => onFormat("underline")}>
        <Underline className="ter-h-4 ter-w-4" />
      </button>
      <button type="button" className={btn} title="Tachado" onClick={() => onFormat("strikeThrough")}>
        <Strikethrough className="ter-h-4 ter-w-4" />
      </button>
      <button type="button" className={btn} title="Código" onClick={() => onFormat("code")}>
        <Code className="ter-h-4 ter-w-4" />
      </button>

      <div className="ter-relative">
        <button
          type="button"
          className={btn}
          title="Enlace"
          onClick={() => toggleLink(!linkOpen)}
        >
          <LinkIcon className="ter-h-4 ter-w-4" />
        </button>

        {linkOpen && (
          <form
            className="ter-absolute ter-right-0 ter-top-full ter-z-50 ter-mt-1 ter-flex ter-w-60 ter-items-center ter-gap-1.5 ter-rounded-lg ter-border ter-border-[#d7b227]/40 ter-bg-[#0d0b08] ter-p-2 ter-shadow-xl"
            onSubmit={saveLink}
          >
            <input
              type="url"
              placeholder="https://..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="ter-h-7 ter-flex-1 ter-rounded ter-border ter-border-white/25 ter-bg-transparent ter-px-2 ter-text-xs ter-text-[#f5f1e8] ter-outline-none ter-focus:border-[#d7b227]"
            />
            <button
              type="submit"
              className="ter-rounded ter-p-1 ter-text-[#d7b227] ter-hover:bg-white/10"
              title="Guardar enlace"
            >
              <Check className="ter-h-4 ter-w-4" />
            </button>
          </form>
        )}
      </div>

      <span className={sep} />

      <div className="ter-relative">
        <button
          type="button"
          className={btn}
          title="Color de texto"
          onClick={() => toggleColor(!colorOpen)}
        >
          <Palette className="ter-h-4 ter-w-4" />
        </button>

        {colorOpen && (
          <div className="ter-absolute ter-right-0 ter-top-full ter-z-50 ter-mt-1 ter-w-44 ter-rounded-lg ter-border ter-border-[#d7b227]/40 ter-bg-[#0d0b08] ter-p-2 ter-shadow-xl">
            <div className="ter-grid ter-grid-cols-6 ter-gap-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`ter-h-6 ter-w-6 ter-rounded ter-border ter-border-white/25 ter-transition-transform ter-hover:scale-110 ${
                    activeColor === c
                      ? "ter-ring-2 ter-ring-[#d7b227] ter-ring-offset-1 ter-ring-offset-[#0d0b08]"
                      : ""
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => pickColor(c)}
                />
              ))}
            </div>
            <label
              className={`ter-mt-2 ter-flex ter-items-center ter-gap-2 ter-rounded ter-border ter-px-1.5 ter-py-1 ter-text-[10px] ter-uppercase ter-tracking-wide ter-text-[#b8ae9d] ${
                !isPresetColor && activeColor
                  ? "ter-border-[#d7b227] ter-bg-[#d7b227]/10"
                  : "ter-border-transparent"
              }`}
            >
              Personalizado
              <input
                type="color"
                value={
                  activeColor && /^#[0-9a-f]{6}$/i.test(activeColor)
                    ? activeColor
                    : "#0d0b08"
                }
                onChange={(e) => pickColor(e.target.value)}
                className="ter-h-5 ter-w-9 ter-cursor-pointer ter-rounded ter-border-0 ter-bg-transparent"
              />
            </label>
          </div>
        )}
      </div>

      <span className={sep} />

      <div className="ter-flex ter-items-center ter-gap-1">
        <div className="ter-flex ter-flex-col">
          <button
            type="button"
            className="ter-rounded ter-px-0.5 ter-py-0.5 ter-text-[#f5f1e8] ter-hover:bg-white/10"
            title="Aumentar tamaño"
            onClick={() => stepSize(1)}
          >
            <ChevronUp className="ter-h-3 ter-w-3" />
          </button>
          <button
            type="button"
            className="ter-rounded ter-px-0.5 ter-py-0.5 ter-text-[#f5f1e8] ter-hover:bg-white/10"
            title="Disminuir tamaño"
            onClick={() => stepSize(-1)}
          >
            <ChevronDown className="ter-h-3 ter-w-3" />
          </button>
        </div>
        <input
          type="number"
          min={8}
          max={64}
          value={displayValue}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "") {
              setOverride(null);
              return;
            }
            const num = Number(val);
            if (!Number.isFinite(num) || num === 0) return;
            applySize(num);
          }}
          className="ter-h-7 ter-w-14 ter-rounded ter-border ter-border-white/25 ter-bg-transparent ter-px-1 ter-text-center ter-text-xs ter-text-[#f5f1e8] ter-outline-none ter-focus:border-[#d7b227] ter-[appearance:textfield] ter-[&::-webkit-inner-spin-button]:appearance-none"
        />
        <span className="ter-text-[10px] ter-text-[#b8ae9d]">px</span>
      </div>
    </div>
  );
};
