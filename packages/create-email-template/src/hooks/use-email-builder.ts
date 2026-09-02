"use client";

import { useCallback } from "react";
import type { EmailContext } from "../core/types";
import { resolveVariables } from "../core/variables";
import {
  useEmailBuilderConfig,
  useEmailBuilderStore,
  useEmailBuilderStoreInstance,
} from "../store/email-builder-provider";
import { renderEmailHtml } from "../core/render";

export const useEmailBuilder = () => {
  const config = useEmailBuilderConfig();
  const store = useEmailBuilderStoreInstance();

  const blocks = useEmailBuilderStore((s) => s.blocks);
  const selectedId = useEmailBuilderStore((s) => s.selectedId);
  const propertiesOpen = useEmailBuilderStore((s) => s.propertiesOpen);
  const settings = useEmailBuilderStore((s) => s.settings);
  const dirty = useEmailBuilderStore((s) => s.dirty);

  const hydrate = useEmailBuilderStore((s) => s.hydrate);
  const setSettings = useEmailBuilderStore((s) => s.setSettings);
  const addBlock = useEmailBuilderStore((s) => s.addBlock);
  const reorder = useEmailBuilderStore((s) => s.reorder);
  const updateBlockProps = useEmailBuilderStore((s) => s.updateBlockProps);
  const removeBlock = useEmailBuilderStore((s) => s.removeBlock);
  const duplicateBlock = useEmailBuilderStore((s) => s.duplicateBlock);
  const select = useEmailBuilderStore((s) => s.select);
  const setPropertiesOpen = useEmailBuilderStore((s) => s.setPropertiesOpen);
  const markSaved = useEmailBuilderStore((s) => s.markSaved);

  const renderHtml = useCallback(
    async (opts?: { context?: EmailContext; subject?: string }) => {
      const state = store.getState();
      return renderEmailHtml({
        blocks: state.blocks,
        subject: opts?.subject ?? "",
        context: opts?.context ?? config.sampleContext,
        settings: state.settings,
        palette: config.palette,
      });
    },
    [store, config],
  );

  const getSavePayload = useCallback(
    () => store.getState().getPayload(),
    [store],
  );

  /** Inyecta los valores de las etiquetas `{}` en un texto (usa el sampleContext por defecto). */
  const resolve = useCallback(
    (text: string, context?: EmailContext): string =>
      resolveVariables(text, context ?? config.sampleContext),
    [config],
  );

  return {
    config,
    variables: config.variables,
    blockLibrary: config.blockLibrary,
    blockMap: config.blockMap,
    palette: config.palette,
    sampleContext: config.sampleContext,
    labels: config.labels,
    uploadImage: config.uploadImage,

    blocks,
    selectedId,
    propertiesOpen,
    settings,
    dirty,

    hydrate,
    setSettings,
    addBlock,
    reorder,
    updateBlockProps,
    removeBlock,
    duplicateBlock,
    select,
    setPropertiesOpen,
    markSaved,

    getSavePayload,
    renderHtml,
    resolve,
  };
};