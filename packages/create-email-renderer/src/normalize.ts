// Normalización de payloads legacy o corruptos: completa props faltantes con
// los defaults de la blockLibrary, descarta tipos desconocidos, repara ids y
// coacciona tipos. Punto único de defensa para plantillas guardadas con una
// versión anterior del esquema (el editor al hidratar y el backend al parsear).
import {
  DEFAULT_BLOCK_LIBRARY,
  DEFAULT_SETTINGS,
} from "./default-blocks.js";
import { newId } from "./id.js";
import type {
  BlockDefinition,
  EmailBlock,
  EmailBlockProps,
  EmailBlockType,
  EmailSettings,
} from "./types.js";

const coerceNumber = (value: unknown, fallback: number): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeColumns = (
  value: unknown,
  fallback: { id: string; text: string }[],
): { id: string; text: string }[] => {
  if (!Array.isArray(value)) return fallback;
  return value.map((col) => ({
    id:
      typeof (col as { id?: unknown })?.id === "string" &&
      (col as { id: string }).id
        ? (col as { id: string }).id
        : newId(),
    text: String((col as { text?: unknown })?.text ?? ""),
  }));
};

/** Rellena props faltantes/corruptas con los defaults del bloque y coacciona tipos. */
const normalizeProps = (
  rawProps: unknown,
  definition: BlockDefinition,
): EmailBlockProps => {
  const props = structuredClone(
    definition.defaultProps,
  ) as Record<string, unknown>;
  const raw =
    rawProps && typeof rawProps === "object"
      ? (rawProps as Record<string, unknown>)
      : {};

  // Solo claves conocidas por el esquema actual: las props legadas desconocidas
  // se descartan (así evolucionar el esquema no rompe plantillas viejas).
  for (const key of Object.keys(props)) {
    const value = raw[key];
    if (value === undefined || value === null) continue; // conserva el default
    const fallback = props[key];
    if (typeof fallback === "number") {
      props[key] = coerceNumber(value, fallback);
    } else if (Array.isArray(fallback)) {
      if (key === "items") {
        props[key] = Array.isArray(value)
          ? value.map((item) => String(item))
          : fallback;
      } else if (key === "columns") {
        props[key] = normalizeColumns(
          value,
          fallback as { id: string; text: string }[],
        );
      } else if (Array.isArray(value)) {
        props[key] = value;
      }
    } else if (typeof fallback === "string") {
      props[key] = String(value);
    } else if (typeof fallback === "boolean") {
      props[key] = Boolean(value);
    } else {
      props[key] = value;
    }
  }
  return props as EmailBlockProps;
};

/**
 * Normaliza un array de bloques de origen desconocido (JSON de la BD, import,
 * versión vieja del esquema): descarta tipos que no están en la librería,
 * completa props con los defaults, repara ids faltantes y coacciona tipos.
 * Nunca lanza.
 */
export const normalizeBlocks = (
  input: unknown,
  library: BlockDefinition[] = DEFAULT_BLOCK_LIBRARY,
): EmailBlock[] => {
  if (!Array.isArray(input)) return [];
  const blockMap = new Map<string, BlockDefinition>(
    library.map((def) => [def.type, def]),
  );

  const blocks: EmailBlock[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const type = (raw as { type?: unknown }).type;
    if (typeof type !== "string" || !blockMap.has(type as EmailBlockType)) {
      continue;
    }
    const definition = blockMap.get(type as EmailBlockType)!;
    const rawId = (raw as { id?: unknown }).id;
    blocks.push({
      id: typeof rawId === "string" && rawId ? rawId : newId(),
      type: type as EmailBlockType,
      props: normalizeProps((raw as { props?: unknown }).props, definition),
    });
  }
  return blocks;
};

/** Normaliza los settings: solo claves conocidas, coacción numérica, defaults. */
export const normalizeSettings = (input: unknown): EmailSettings => {
  const raw =
    input && typeof input === "object"
      ? (input as Record<string, unknown>)
      : {};
  return {
    pageBackground:
      typeof raw.pageBackground === "string"
        ? raw.pageBackground
        : DEFAULT_SETTINGS.pageBackground,
    cardBorderWidth: coerceNumber(
      raw.cardBorderWidth,
      DEFAULT_SETTINGS.cardBorderWidth,
    ),
    cardBorderRadius: coerceNumber(
      raw.cardBorderRadius,
      DEFAULT_SETTINGS.cardBorderRadius,
    ),
  };
};
