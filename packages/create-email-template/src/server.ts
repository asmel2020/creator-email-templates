// Entry server-safe: solo el core (sin UI / sin hooks de cliente).
// Pensado para route handlers / servicios (Next.js, Node) que renderizan el HTML.
export * from "./core/types";
export * from "./core/default-blocks";
export * from "./core/variables";
export * from "./core/richtext";
export * from "./core/blocks";
export * from "./core/render";
export * from "./core/template";