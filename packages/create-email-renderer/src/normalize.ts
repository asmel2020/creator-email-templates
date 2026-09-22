// Normalización de payloads legacy o corruptos: completa props faltantes con
// los defaults de la blockLibrary, descarta tipos desconocidos, repara ids y
// coacciona tipos. Punto único de defensa para plantillas guardadas con una
// versión anterior del esquema (el editor al hidratar y el backend al parsear).
import {
  DEFAULT_BLOCK_LIBRARY,
  DEFAULT_SETTINGS,
} from "./default-blocks.js";
import { newId } from "./id.js";
import { getBlockNormalizeProps, listBlockDefinitions } from "./registry.js";
import { isContainerType } from "./types.js";
import {
  coerceNumber,
  FILE_FIELDS,
  normalizeRecordArray,
  RECORD_ARRAY_FIELDS,
} from "./records.js";
import { isSafeFileUrl } from "./richtext.js";
import type {
  BlockDefinition,
  ColumnDef,
  EmailBlock,
  EmailBlockProps,
  EmailBlockType,
  EmailFileAttachment,
  EmailSettings,
} from "./types.js";

// Props de layout opcionales que no viven en los defaults (undefined = heredar
// el shorthand); aun así deben sobrevivir a la normalización.
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
 * Normaliza una lista de bloques con límite de profundidad. `depth` es la
 * profundidad de los bloques de esta lista: los hijos de un contenedor se
 * normalizan con `depth + 1` y, a partir de `MAX_BLOCK_DEPTH`, los bloques
 * contenedores se descartan (evita anidamiento infinito).
 */
const normalizeBlockList = (
  input: unknown,
  blockMap: Map<string, BlockDefinition>,
  depth: number,
): EmailBlock[] => {
  if (!Array.isArray(input)) return [];
  const blocks: EmailBlock[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const type = (raw as { type?: unknown }).type;
    if (typeof type !== "string" || !blockMap.has(type)) continue;
    if (depth > 0 && isContainerType(type)) continue;
    const definition = blockMap.get(type)!;
    const rawId = (raw as { id?: unknown }).id;
    const customNormalize = getBlockNormalizeProps(type);
    blocks.push({
      id: typeof rawId === "string" && rawId ? rawId : newId(),
      type: type as EmailBlockType,
      props: customNormalize
        ? customNormalize((raw as { props?: unknown }).props, definition)
        : normalizeProps(
            (raw as { props?: unknown }).props,
            definition,
            blockMap,
            depth,
          ),
    });
  }
  return blocks;
};

/** Ancho opcional de una celda de grid (porcentaje 0–100). */
const normalizeWidth = (value: unknown): number | undefined => {
  const parsed =
    typeof value === "number" ? value : parseFloat(String(value ?? ""));
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return Math.min(100, parsed);
};

/** Normaliza columnas de `columns` (v2 con `blocks`, o legacy `{ id, text }`). */
const normalizeColumns = (
  value: unknown,
  fallback: ColumnDef[],
  blockMap: Map<string, BlockDefinition>,
  childDepth: number,
): ColumnDef[] => {
  if (!Array.isArray(value)) return fallback;
  return value.map((raw) => {
    const col = (raw ?? {}) as {
      id?: unknown;
      text?: unknown;
      blocks?: unknown;
      width?: unknown;
    };
    const id = typeof col.id === "string" && col.id ? col.id : newId();
    const width = normalizeWidth(col.width);
    const withWidth = (blocks: EmailBlock[]): ColumnDef =>
      width === undefined ? { id, blocks } : { id, blocks, width };
    if (Array.isArray(col.blocks)) {
      return withWidth(normalizeBlockList(col.blocks, blockMap, childDepth));
    }
    // Migración legacy: una columna de texto pasa a ser un bloque `text`.
    if (col.text !== undefined && col.text !== null) {
      return withWidth(
        normalizeBlockList(
          [
            {
              type: "text",
              props: {
                text: String(col.text),
                align: "left",
                paddingY: 0,
                paddingX: 0,
              },
            },
          ],
          blockMap,
          childDepth,
        ),
      );
    }
    return withWidth([]);
  });
};

/** Rellena props faltantes/corruptas con los defaults del bloque y coacciona tipos. */
const normalizeProps = (
  rawProps: unknown,
  definition: BlockDefinition,
  blockMap: Map<string, BlockDefinition>,
  depth: number,
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
    if (key === "columns" && Array.isArray(fallback)) {
      props[key] = normalizeColumns(
        value,
        fallback as ColumnDef[],
        blockMap,
        depth + 1,
      );
    } else if (key === "columns") {
      // `columns` numérico (gallery: imágenes por fila) no es una lista de columnas.
      props[key] = coerceNumber(value, fallback as number);
    } else if (key === "blocks") {
      props[key] = normalizeBlockList(value, blockMap, depth + 1);
    } else if (RECORD_ARRAY_FIELDS[key]) {
      props[key] = normalizeRecordArray(
        value,
        fallback as Array<Record<string, unknown>>,
        RECORD_ARRAY_FIELDS[key],
      );
    } else if (key === "bullets") {
      props[key] = Array.isArray(value) ? value.map((v) => String(v)) : fallback;
    } else if (typeof fallback === "number") {
      props[key] = coerceNumber(value, fallback);
    } else if (Array.isArray(fallback)) {
      if (key === "items") {
        props[key] = Array.isArray(value)
          ? value.map((item) => String(item))
          : fallback;
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
  for (const key of LAYOUT_KEYS) {
    const value = raw[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      props[key] = value;
    } else if (typeof value === "string" && value.trim() !== "") {
      const parsed = parseFloat(value);
      if (Number.isFinite(parsed)) props[key] = parsed;
    }
  }
  return props as EmailBlockProps;
};

/**
 * Normaliza un array de bloques de origen desconocido (JSON de la BD, import,
 * versión vieja del esquema): descarta tipos que no están en la librería,
 * completa props con los defaults, repara ids y coacciona tipos.
 * Nunca lanza.
 *
 * La librería por defecto es el registry vivo (built-in + `registerBlock`).
 */
export const normalizeBlocks = (
  input: unknown,
  library?: BlockDefinition[],
): EmailBlock[] => {
  const defs =
    library ??
    (listBlockDefinitions().length > 0
      ? listBlockDefinitions()
      : DEFAULT_BLOCK_LIBRARY);
  const blockMap = new Map<string, BlockDefinition>(
    defs.map((def) => [def.type, def]),
  );
  return normalizeBlockList(input, blockMap, 0);
};

/** Tope duro de archivos en un payload (el límite de la UI es configurable). */
const MAX_NORMALIZED_FILES = 50;

/** Nombre legible a partir de la URL del archivo (los `data:` no lo tienen). */
const fileNameFromUrl = (url: string): string => {
  if (/^data:/i.test(url)) return "archivo";
  const clean = url.split("?")[0].split("#")[0];
  const base = clean.split("/").pop() || "";
  let name = base;
  try {
    name = decodeURIComponent(base);
  } catch {
    name = base;
  }
  return name.slice(0, 120) || "archivo";
};

/**
 * Normaliza `settings.files`: repara ids y tipos, descarta entradas sin URL
 * usable (esquema no permitido), deriva el nombre de la URL si falta y aplica
 * los defaults cuando la clave viene ausente (`link: true`, `attach: false`).
 */
export const normalizeFiles = (input: unknown): EmailFileAttachment[] => {
  if (!Array.isArray(input)) return [];
  const raw = input;
  return normalizeRecordArray(input, [], FILE_FIELDS)
    .map((entry, index) => {
      const source = raw[index];
      const src =
        source && typeof source === "object"
          ? (source as Record<string, unknown>)
          : {};
      const url = String(entry.url ?? "").trim();
      return {
        id: String(entry.id),
        url,
        name: String(entry.name ?? "").trim() || fileNameFromUrl(url),
        size: coerceNumber(entry.size, 0),
        mimeType: String(entry.mimeType ?? "").trim(),
        attach: "attach" in src ? entry.attach === true : false,
        link: "link" in src ? entry.link !== false : true,
      };
    })
    .filter((file) => isSafeFileUrl(file.url))
    .slice(0, MAX_NORMALIZED_FILES);
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
    // `""` es válido: desactiva el font-family y deja la fuente del cliente.
    fontFamily:
      typeof raw.fontFamily === "string"
        ? raw.fontFamily
        : DEFAULT_SETTINGS.fontFamily,
    files: normalizeFiles(raw.files),
  };
};
