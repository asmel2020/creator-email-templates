"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SelectionToolbar } from "./selection-toolbar";

const rgbToHex = (rgb: string): string | null => {
  const m = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  const [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])];
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
};

const walkSelectedTextNodes = (range: Range, cb: (el: Element) => void) => {
  const container =
    range.commonAncestorContainer.nodeType === Node.TEXT_NODE
      ? (range.commonAncestorContainer.parentElement as Element)
      : (range.commonAncestorContainer as Element);
  if (!container) return;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      range.intersectsNode(node)
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT,
  });
  let node: Node | null = walker.nextNode();
  while (node) {
    const el = node.parentElement;
    if (el) cb(el);
    node = walker.nextNode();
  }
};

const collectFontSizes = (range: Range): number[] => {
  const sizes = new Set<number>();
  walkSelectedTextNodes(range, (el) => {
    const fs = parseFloat(window.getComputedStyle(el).fontSize);
    if (Number.isFinite(fs)) sizes.add(Math.round(fs));
  });
  return Array.from(sizes);
};

const collectColors = (range: Range): string[] => {
  const colors = new Set<string>();
  walkSelectedTextNodes(range, (el) => {
    const hex = rgbToHex(window.getComputedStyle(el).color);
    if (hex) colors.add(hex);
  });
  return Array.from(colors);
};

interface Props {
  value: string;
  onChange: (next: string) => void;
  rich?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onEnter?: () => void;
  onDeleteWhenEmpty?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
}

export const InlineTextEditor = ({
  value,
  onChange,
  rich = false,
  className = "",
  style,
  onEnter,
  onDeleteWhenEmpty,
  autoFocus = false,
  placeholder = "Escribir...",
}: Props) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const elRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [toolbar, setToolbar] = useState<{ top: number; left: number } | null>(null);
  const [selInfo, setSelInfo] = useState<{
    uniform: number | null;
    max: number;
    color: string | null;
  }>({ uniform: null, max: 16, color: null });

  // Sincroniza el valor externo SOLO cuando el foco está fuera del editor/toolbar.
  // Así las ediciones en vivo (que vienen del propio editor) nunca se sobrescriben.
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const focusInside = wrapRef.current?.contains(document.activeElement) ?? false;
    if (focusInside) return;
    const current = rich ? el.innerHTML : el.textContent || "";
    const next = rich ? value : value || "";
    if (current !== next) {
      if (rich) el.innerHTML = next;
      else el.textContent = next;
    }
  }, [value, rich]);

  // Enfoca el editor y coloca el cursor al final cuando autoFocus está activo.
  useEffect(() => {
    if (!autoFocus) return;
    const el = elRef.current;
    if (!el) return;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, [autoFocus]);

  const sync = useCallback(() => {
    const el = elRef.current;
    if (!el) return;
    onChange(rich ? el.innerHTML : el.textContent || "");
  }, [onChange, rich]);

  useEffect(() => {
    const handleSelection = () => {
      const el = elRef.current;
      const wrap = wrapRef.current;
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0 || !el || !wrap) {
        // El ocultado se gestiona con pointerdown; aquí solo se reposiciona.
        return;
      }
      const range = sel.getRangeAt(0);
      if (!el.contains(range.commonAncestorContainer)) return;
      savedRangeRef.current = range.cloneRange();

      const sizes = collectFontSizes(range);
      const uniform =
        sizes.length > 0 && sizes.every((s) => s === sizes[0])
          ? sizes[0]
          : null;
      const max = sizes.length > 0 ? Math.max(...sizes) : 16;

      const colors = collectColors(range);
      const color =
        colors.length > 0 && colors.every((c) => c === colors[0])
          ? colors[0]
          : null;

      setSelInfo({ uniform, max, color });

      const rect = range.getBoundingClientRect();
      const left = Math.max(
        8,
        Math.min(rect.left + rect.width / 2, window.innerWidth - 220),
      );
      const top = Math.max(8, rect.top - 40);
      setToolbar({ top, left });
    };

    const handlePointerDown = (e: PointerEvent) => {
      const toolbar = toolbarRef.current;
      const target = e.target as Node;
      // Interacción con el propio toolbar: mantener.
      if (toolbar?.contains(target)) return;
      // Cualquier otro clic (incluido deseleccionar en el editor): cerrar.
      setToolbar(null);
      savedRangeRef.current = null;
    };

    document.addEventListener("selectionchange", handleSelection);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("selectionchange", handleSelection);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, []);

  const restoreSelection = () => {
    const el = elRef.current;
    const saved = savedRangeRef.current;
    if (!el || !saved) return null;

    const sel = window.getSelection();
    const isToolbarActive =
      toolbarRef.current?.contains(document.activeElement) ?? false;
    if (!isToolbarActive) el.focus();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(saved);
    }
    return saved;
  };

  const reselect = (node: Node) => {
    const sel = window.getSelection();
    const range = document.createRange();
    if (node.nodeType === Node.ELEMENT_NODE) {
      range.selectNodeContents(node);
    } else {
      range.selectNode(node);
    }
    sel?.removeAllRanges();
    sel?.addRange(range);
    savedRangeRef.current = range.cloneRange();
  };

  const applyInlineStyle = (property: string, value: string) => {
    const el = elRef.current;
    if (!el) return;

    // `font-size` requiere unidad (px); sin ella el navegador ignora el valor.
    const normalizedValue =
      property === "font-size" && !/px$/.test(value)
        ? `${value}px`
        : value;

    // Asegurar que el editor sea el contexto activo y obtener un rango válido.
    el.focus();
    const sel = window.getSelection();
    let range: Range | null = null;

    if (
      sel &&
      sel.rangeCount > 0 &&
      !sel.isCollapsed &&
      el.contains(sel.getRangeAt(0).commonAncestorContainer)
    ) {
      range = sel.getRangeAt(0);
    } else if (savedRangeRef.current) {
      range = savedRangeRef.current.cloneRange();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }

    if (!range || range.collapsed) return;

    const frag = range.extractContents();

    // Quitar la propiedad en TODA la selección para que quede uniforme,
    // y envolver todo en un solo span con el nuevo valor.
    const walker = document.createTreeWalker(frag, NodeFilter.SHOW_ELEMENT);
    let node: Node | null = walker.nextNode();
    while (node) {
      const target = node as HTMLElement;
      if (target.style) target.style.removeProperty(property);
      node = walker.nextNode();
    }

    const span = document.createElement("span");
    span.style.setProperty(property, normalizedValue);
    span.appendChild(frag);
    range.insertNode(span);
    reselect(span);

    el.dispatchEvent(new Event("input", { bubbles: true }));
  };

  const handleMouseDown = () => {
    const el = elRef.current;
    if (!el || el.textContent?.trim() !== "") return;
    // Colocar el caret manualmente al hacer clic en un editor vacío.
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  };

  const handleFormat = (command: string, value?: string) => {
    const el = elRef.current;
    if (!el) return;

    if (command === "foreColor") {
      applyInlineStyle("color", value!);
      return;
    }
    if (command === "fontSize") {
      applyInlineStyle("font-size", value!);
      return;
    }

    const saved = restoreSelection();
    if (!saved) return;

    if (command === "code") {
      const range = saved.cloneRange();
      const frag = range.extractContents();
      const code = document.createElement("code");
      code.appendChild(frag);
      range.insertNode(code);
      reselect(code);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }

    document.execCommand(command, false, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    if (command === "createLink") {
      setToolbar(null);
    }
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <div
        ref={elRef}
        contentEditable
        suppressContentEditableWarning
        data-ph={placeholder}
        className={`ter-cursor-text ter-outline-none ${className} ${
          rich && value === ""
            ? "ter-empty-placeholder"
            : ""
        }`}
        style={{
          cursor: "text",
          ...style,
          ...(rich
            ? {}
            : { whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }),
        }}
        onMouseDown={handleMouseDown}
        onInput={sync}
        onBlur={sync}
        onKeyDown={(e) => {
          if (rich && onEnter && e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onEnter();
            return;
          }
          if (
            rich &&
            onDeleteWhenEmpty &&
            (e.key === "Backspace" || e.key === "Delete")
          ) {
            const el = elRef.current;
            const empty = !el || el.textContent?.trim() === "";
            if (empty) {
              e.preventDefault();
              onDeleteWhenEmpty();
            }
          }
        }}
      />
      {rich && toolbar &&
        createPortal(
          <SelectionToolbar
            innerRef={toolbarRef}
            style={{ position: "fixed", top: toolbar.top, left: toolbar.left }}
            onFormat={handleFormat}
            selectionSize={selInfo.uniform}
            selectionMaxSize={selInfo.max}
            selectionColor={selInfo.color}
          />,
          document.body,
        )}
    </div>
  );
};