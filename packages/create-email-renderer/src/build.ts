// Constructor de bloques para consumidores sin editor (back-end, Workers,
// scripts): arma un `EmailBlock` válido partiendo de los defaults del esquema
// vivo, coacciona tipos, genera ids y completa los arrays de registros.
// Es puramente aditivo: no altera `normalize`, el render ni los defaults.
import {
  DEFAULT_BLOCK_LIBRARY,
  DEFAULT_SETTINGS,
} from "./default-blocks.js";
import { newId } from "./id.js";
import {
  coerceNumber,
  normalizeRecordArray,
  RECORD_ARRAY_FIELDS,
} from "./records.js";
import { listBlockDefinitions } from "./registry.js";
import { normalizeSettings } from "./normalize.js";
import { isContainerType } from "./types.js";
import type {
  BlockDefinition,
  BlockPropsMap,
  ColumnDef,
  EmailBlock,
  EmailBlockProps,
  EmailBlockType,
  EmailSettings,
} from "./types.js";

/** Props de layout opcionales (mismo conjunto que normaliza `normalize.ts`). */
const LAYOUT_KEYS = [
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "marginTop",
  "marginBottom",
  "gap",
] as const;

/**
 * Registro de un array de registros en la entrada: sin `id` y con todos los
 * campos opcionales (el constructor rellena ids y defaults).
 */
export type RecordInput<T> = Partial<Omit<T, "id">>;

/**
 * Props de entrada de un bloque: todo opcional (los defaults completan) y los
 * arrays de registros aceptan entradas sin `id`.
 */
export type BlockInputProps<T extends EmailBlockType> = Omit<
  {
    [K in keyof BlockPropsMap[T]]?: BlockPropsMap[T][K] extends Array<infer I>
      ? I extends { id: string }
        ? RecordInput<I>[]
        : BlockPropsMap[T][K]
      : BlockPropsMap[T][K];
  },
  never
>;

/** Celda de un contenedor: ancho + hijos (bloques o atajos). */
export interface ColumnInput {
  id?: string;
  width?: number;
  blocks?: BlockInput[];
}

/** Bloque ya construido o el atajo `[type, props]` / `{ type, props }`. */
export type BlockShorthand<T extends EmailBlockType = EmailBlockType> = {
  [K in T]: [K, BlockInputProps<K>?] | { type: K; props?: BlockInputProps<K> };
}[T];

export type BlockInput =
  | EmailBlock
  | BlockShorthand
  | (BlockInputProps<EmailBlockType> & { type: EmailBlockType });

const isEmailBlock = (value: unknown): value is EmailBlock => {
  const block = value as { id?: unknown; type?: unknown; props?: unknown };
  return (
    !!block &&
    typeof block === "object" &&
    typeof block.id === "string" &&
    typeof block.type === "string" &&
    !!block.props &&
    typeof block.props === "object"
  );
};

/** Normaliza las formas aceptadas de un hijo a `[type, props]`. */
const asShorthand = (
  value: BlockInput,
): { type: string; props?: Record<string, unknown> } | null => {
  if (Array.isArray(value)) {
    const [type, props] = value as [string, Record<string, unknown>?];
    return typeof type === "string" ? { type, props } : null;
  }
  if (value && typeof value === "object") {
    const raw = value as { type?: unknown; props?: unknown };
    return typeof raw.type === "string"
      ? { type: raw.type, props: (raw.props as Record<string, unknown>) ?? {} }
      : null;
  }
  return null;
};

const resolveDefinition = (
  type: string,
): BlockDefinition | undefined => {
  const live = listBlockDefinitions();
  const library = live.length > 0 ? live : DEFAULT_BLOCK_LIBRARY;
  return library.find((def) => def.type === type);
};

/**
 * Construye las props de un bloque: defaults del esquema + lo que pases,
 * coaccionando tipos y completando registros e hijos.
 */
const buildProps = (
  definition: BlockDefinition,
  input: Record<string, unknown>,
  depth: number,
): EmailBlockProps => {
  const props = structuredClone(definition.defaultProps) as Record<
    string,
    unknown
  >;
  const def = definition.type;
  for (const key of Object.keys(props)) {
    const value = input[key];
    if (value === undefined || value === null) continue;
    const fallback = props[key];
    if (key === "columns" && Array.isArray(fallback)) {
      props[key] = buildColumns(value, depth);
    } else if (key === "blocks" && def === "container") {
      props[key] = buildBlockList(value, depth + 1);
    } else if (key === "columns" && def === "gallery") {
      props[key] = coerceNumber(value, fallback as number);
    } else if (RECORD_ARRAY_FIELDS[key]) {
      props[key] = normalizeRecordArray(
        value,
        fallback as Array<Record<string, unknown>>,
        RECORD_ARRAY_FIELDS[key],
      );
    } else if (typeof fallback === "number") {
      props[key] = coerceNumber(value, fallback);
    } else if (typeof fallback === "boolean") {
      props[key] = value === true || value === "true";
    } else if (Array.isArray(fallback)) {
      props[key] = Array.isArray(value) ? value.map((v) => String(v)) : fallback;
    } else if (typeof fallback === "string") {
      props[key] = String(value);
    } else {
      props[key] = value;
    }
  }
  // Overrides de layout opcionales que no viven en los defaults.
  for (const key of LAYOUT_KEYS) {
    const value = input[key];
    if (value === undefined || value === null) continue;
    if (typeof value === "number" && Number.isFinite(value)) {
      props[key] = value;
    } else if (typeof value === "string" && value.trim() !== "") {
      const parsed = parseFloat(value);
      if (Number.isFinite(parsed)) props[key] = parsed;
    }
  }
  return props as EmailBlockProps;
};

/** Construye una lista de bloques (hijos de contenedores/columnas). */
const buildBlockList = (input: unknown, depth: number): EmailBlock[] => {
  if (!Array.isArray(input)) return [];
  const blocks: EmailBlock[] = [];
  for (const entry of input) {
    if (isEmailBlock(entry)) {
      // Ya es un bloque (p. ej. salido de `blockJson`): se respeta tal cual,
      // salvo que sea un contenedor demasiado profundo.
      if (depth > 0 && isContainerType(entry.type)) continue;
      blocks.push(entry);
      continue;
    }
    const shorthand = asShorthand(entry as BlockInput);
    if (!shorthand) continue;
    if (depth > 0 && isContainerType(shorthand.type)) continue;
    const definition = resolveDefinition(shorthand.type);
    if (!definition) continue;
    blocks.push({
      id: newId(),
      type: definition.type,
      props: buildProps(definition, shorthand.props ?? {}, depth),
    });
  }
  return blocks;
};

/** Construye las celdas de `columns` / `grid` / `footer`. */
const buildColumns = (input: unknown, depth: number): ColumnDef[] => {
  if (!Array.isArray(input)) return [];
  return input.map((raw) => {
    const col = (raw ?? {}) as {
      id?: unknown;
      width?: unknown;
      blocks?: unknown;
    };
    const id = typeof col.id === "string" && col.id ? col.id : newId();
    const blocks = buildBlockList(col.blocks, depth + 1);
    const width = coerceNumber(col.width, 0);
    return width > 0 ? { id, blocks, width } : { id, blocks };
  });
};

/**
 * Construye un bloque a partir de su tipo y (opcionalmente) props parciales.
 * Lo que no pases queda con el default del esquema; los ids se generan solos.
 * Devuelve `null` si el tipo no existe en la librería viva.
 *
 * ```ts
 * blockJson("image", { src: "https://…/foto.jpg", alt: "Foto" })
 * blockJson("checkout", { lines: [{ name: "Camiseta", price: "$20" }] })
 * ```
 */
export function blockJson<T extends EmailBlockType>(
  type: T,
  props?: BlockInputProps<T>,
): EmailBlock;
export function blockJson(
  type: string,
  props?: Record<string, unknown>,
): EmailBlock | null;
export function blockJson(
  type: string,
  props?: Record<string, unknown>,
): EmailBlock | null {
  if (typeof type !== "string" || !type) return null;
  const definition = resolveDefinition(type);
  if (!definition) return null;
  return {
    id: newId(),
    type: definition.type,
    props: buildProps(definition, props ?? {}, 0),
  };
}

/**
 * Construye el payload completo (`{ content, settings }`) listo para
 * `renderTemplateEmail({ payload })`. Descarta los bloques inválidos (`null`).
 */
export const templateJson = (
  blocks: Array<EmailBlock | null | undefined>,
  settings?: Partial<EmailSettings>,
): { content: EmailBlock[]; settings: Partial<EmailSettings> } => ({
  content: blocks.filter(
    (block): block is EmailBlock => !!block && !!block.props,
  ),
  settings: settings
    ? normalizeSettings({ ...DEFAULT_SETTINGS, ...settings })
    : {},
});
