import "./index.css";

// Core (framework-agnostic)
export * from "./core/types";
export * from "./core/default-blocks";
export * from "./core/variables";
export * from "./core/richtext";
export * from "./core/blocks";
export * from "./core/render";

// Config
export * from "./config/types";
export * from "./config/defaults";

// Store (Zustand por instancia + provider)
export * from "./store/create-email-builder-store";
export * from "./store/email-builder-provider";

// Hooks
export * from "./hooks/use-email-builder";
export * from "./hooks/use-render-email";

// UI
export * from "./components/builder/email-builder";
export * from "./components/builder/block-palette";
export * from "./components/builder/canvas";
export * from "./components/builder/sortable-item";
export * from "./components/builder/editable-block-renderer";
export * from "./components/builder/properties-panel";
export * from "./components/builder/inline-text-editor";
export * from "./components/builder/selection-toolbar";
export * from "./components/builder/variables-info-dialog";