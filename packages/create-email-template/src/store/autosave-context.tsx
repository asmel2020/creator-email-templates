"use client";

// Contexto del estado de autoguardado. Vive en un módulo separado para evitar
// el ciclo provider ↔ use-autosave.
import { createContext, useContext } from "react";

export interface AutosaveStatus<TData = unknown> {
  isSaving: boolean;
  lastSavedAt: Date | null;
  lastError: unknown;
  /** Última respuesta de `onSave` (ej. `{ json, html }` del backend). */
  lastResult: TData | null;
  /** Fuerza un guardado inmediato (respeta el guard de dirty/in-flight). */
  saveNow: () => Promise<void>;
}

export const AutosaveStatusContext = createContext<AutosaveStatus | null>(
  null,
);

/** Estado del autoguardado: `{ isSaving, lastSavedAt, lastError, lastResult, saveNow }`. */
export const useAutosaveStatus = (): AutosaveStatus => {
  const ctx = useContext(AutosaveStatusContext);
  if (!ctx) {
    throw new Error(
      "useAutosaveStatus debe usarse dentro de <EmailBuilderProvider autosave={...}>",
    );
  }
  return ctx;
};
