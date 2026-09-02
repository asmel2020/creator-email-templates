"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";
import type {
  EmailBuilderState,
  EmailBuilderStore,
} from "./create-email-builder-store";
import { createEmailBuilderStore } from "./create-email-builder-store";
import type {
  AutosaveOptions,
  EmailBuilderConfig,
  ResolvedEmailBuilderConfig,
  UploadImage,
} from "../config/types";
import { resolveEmailBuilderConfig } from "../config/defaults";
import { useAutosaveEffect } from "../hooks/use-autosave";
import { AutosaveStatusContext } from "./autosave-context";

const EmailBuilderContext = createContext<EmailBuilderStore | null>(null);
const EmailBuilderConfigContext =
  createContext<ResolvedEmailBuilderConfig | null>(null);

export const EmailBuilderProvider = ({
  config,
  uploadImage,
  autosave,
  children,
}: {
  config?: EmailBuilderConfig;
  uploadImage?: UploadImage;
  /** Opt-in: ciclo de autoguardado administrado (ver `AutosaveOptions`). */
  autosave?: AutosaveOptions;
  children: React.ReactNode;
}) => {
  const resolved = useMemo(() => {
    const base = resolveEmailBuilderConfig(config);
    return uploadImage ? { ...base, uploadImage } : base;
  }, [config, uploadImage]);
  const store = useMemo(() => createEmailBuilderStore(resolved), [resolved]);

  // Siempre se invoca el hook (reglas de hooks); sin `autosave` queda
  // deshabilitado y `saveNow` es un no-op. Se le pasa el store directamente:
  // el provider no puede consumir su propio contexto.
  const autosaveStatus = useAutosaveEffect(
    autosave ?? { onSave: async () => undefined, enabled: false },
    store,
  );

  return (
    <EmailBuilderConfigContext.Provider value={resolved}>
      <EmailBuilderContext.Provider value={store}>
        <AutosaveStatusContext.Provider value={autosaveStatus}>
          {children}
        </AutosaveStatusContext.Provider>
      </EmailBuilderContext.Provider>
    </EmailBuilderConfigContext.Provider>
  );
};

export const useEmailBuilderStoreInstance = (): EmailBuilderStore => {
  const store = useContext(EmailBuilderContext);
  if (!store) {
    throw new Error(
      "useEmailBuilderStoreInstance debe usarse dentro de <EmailBuilderProvider>",
    );
  }
  return store;
};

export const useEmailBuilderConfig = (): ResolvedEmailBuilderConfig => {
  const config = useContext(EmailBuilderConfigContext);
  if (!config) {
    throw new Error(
      "useEmailBuilderConfig debe usarse dentro de <EmailBuilderProvider>",
    );
  }
  return config;
};

export const useEmailBuilderStore = <T,>(
  selector: (state: EmailBuilderState) => T,
): T => {
  const store = useEmailBuilderStoreInstance();
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getInitialState()),
  );
};