"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useStore } from "zustand";
import type {
  EmailBuilderState,
  EmailBuilderStore,
} from "./create-email-builder-store";
import { createEmailBuilderStore } from "./create-email-builder-store";
import type {
  EmailBuilderConfig,
  ResolvedEmailBuilderConfig,
  UploadImage,
} from "../config/types";
import { resolveEmailBuilderConfig } from "../config/defaults";

const EmailBuilderContext = createContext<EmailBuilderStore | null>(null);
const EmailBuilderConfigContext =
  createContext<ResolvedEmailBuilderConfig | null>(null);

export const EmailBuilderProvider = ({
  config,
  uploadImage,
  children,
}: {
  config?: EmailBuilderConfig;
  uploadImage?: UploadImage;
  children: React.ReactNode;
}) => {
  const resolved = useMemo(() => {
    const base = resolveEmailBuilderConfig(config);
    return uploadImage ? { ...base, uploadImage } : base;
  }, [config, uploadImage]);
  const store = useMemo(() => createEmailBuilderStore(resolved), [resolved]);

  return (
    <EmailBuilderConfigContext.Provider value={resolved}>
      <EmailBuilderContext.Provider value={store}>
        {children}
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
  return useStore(store, selector);
};