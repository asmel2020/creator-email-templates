// Core puro (sin React): tipos, variables, richtext, bloques por defecto y
// serializador HTML. La UI de edición vive en create-email-template,
// que consume este paquete como única fuente de verdad del modelo.
export * from "./types.js";
export * from "./variables.js";
export * from "./richtext.js";
export * from "./default-blocks.js";
export * from "./normalize.js";
export * from "./html-render.js";
export * from "./server.js";
