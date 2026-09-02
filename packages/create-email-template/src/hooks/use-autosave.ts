"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AutosaveOptions } from "../config/types";
import type { EmailBuilderStore } from "../store/create-email-builder-store";
import { AutosaveStatusContext } from "../store/autosave-context";
import type { AutosaveStatus } from "../store/autosave-context";

export type { AutosaveStatus };
export { useAutosaveStatus } from "../store/autosave-context";

/**
 * Ciclo de autoguardado: cada `intervalMs`, si el builder está `dirty` y no hay
 * un guardado en vuelo, llama a `onSave(payload)` y marca el store como salvado.
 * La librería no hace network: `onSave` es el fetch del consumidor.
 */
export const useAutosaveEffect = <TData,>(
  options: AutosaveOptions<TData>,
  store: EmailBuilderStore,
): AutosaveStatus<TData> => {
  const { onSave, onSaved, intervalMs = 10_000, enabled = true } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [lastError, setLastError] = useState<unknown>(null);
  const [lastResult, setLastResult] = useState<TData | null>(null);

  // Refs para que el interval no se reinicie en cada render del consumidor.
  // La asignación va en un efecto: react-hooks/refs prohíbe escribir refs
  // durante el render. El interval (declarado después) arranca con el valor
  // vigente porque los efectos corren en orden de declaración.
  const inFlightRef = useRef(false);
  const optionsRef = useRef({ onSave, onSaved, enabled });

  useEffect(() => {
    optionsRef.current = { onSave, onSaved, enabled };
  });

  const runSave = useCallback(async () => {
    if (inFlightRef.current || !optionsRef.current.enabled) return;
    const state = store.getState();
    if (!state.dirty) return;

    inFlightRef.current = true;
    setIsSaving(true);
    const payload = state.getPayload();
    try {
      const data = await optionsRef.current.onSave(payload);
      setLastResult(data);
      setLastSavedAt(new Date());
      setLastError(null);
      // Si el usuario editó durante el guardado, dirty vuelve a true y el
      // próximo tick lo toma: no se pierden cambios.
      store.getState().markSaved();
      optionsRef.current.onSaved?.({
        ok: true,
        data,
        payload,
        savedAt: new Date(),
      });
    } catch (error) {
      setLastError(error);
      optionsRef.current.onSaved?.({ ok: false, error, payload });
    } finally {
      inFlightRef.current = false;
      setIsSaving(false);
    }
  }, [store]);

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      void runSave();
    }, intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs, runSave]);

  const saveNow = useCallback(() => runSave(), [runSave]);

  return useMemo(
    () => ({ isSaving, lastSavedAt, lastError, lastResult, saveNow }),
    [isSaving, lastSavedAt, lastError, lastResult, saveNow],
  );
};

export { AutosaveStatusContext };
