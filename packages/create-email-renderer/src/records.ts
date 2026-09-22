// Piezas internas compartidas por `normalize.ts` (defensa contra payloads
// legacy/corruptos) y `build.ts` (constructor tipado `blockJson`): la
// coerción de tipos y el esquema de los arrays de registros viven aquí para
// que ambos usen exactamente las mismas reglas, sin duplicar lógica.
import { newId } from "./id.js";

export const coerceNumber = (value: unknown, fallback: number): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const parsed = parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : fallback;
};

/** Tipos aceptados por cada campo de un registro. */
export type RecordFieldKind = "string" | "number" | "boolean" | "string[]";

/** Campos de array de registros por clave de prop. */
export const RECORD_ARRAY_FIELDS: Record<
  string,
  Record<string, RecordFieldKind>
> = {
  links: { label: "string", href: "string", icon: "string" },
  images: { src: "string", alt: "string", href: "string" },
  stats: { value: "string", label: "string" },
  products: {
    imageUrl: "string",
    name: "string",
    description: "string",
    price: "string",
    ctaLabel: "string",
    ctaHref: "string",
  },
  lines: {
    imageUrl: "string",
    name: "string",
    quantity: "string",
    price: "string",
  },
  entries: {
    title: "string",
    description: "string",
    number: "string",
    image: "string",
    href: "string",
    linkLabel: "string",
  },
  features: { icon: "string", title: "string", description: "string" },
  plans: {
    title: "string",
    price: "string",
    period: "string",
    description: "string",
    features: "string[]",
    ctaLabel: "string",
    ctaHref: "string",
    highlighted: "boolean",
  },
};

/**
 * Campos de un archivo de `settings.files`. No vive en `RECORD_ARRAY_FIELDS`
 * porque no es una prop de bloque: lo consume `normalizeFiles`.
 */
export const FILE_FIELDS: Record<string, RecordFieldKind> = {
  url: "string",
  name: "string",
  size: "number",
  mimeType: "string",
  attach: "boolean",
  link: "boolean",
};

/** Normaliza un array de registros con campos conocidos (repara ids/tipos). */
export const normalizeRecordArray = (
  value: unknown,
  fallback: Array<Record<string, unknown>>,
  fields: Record<string, RecordFieldKind>,
): Array<Record<string, unknown>> => {
  if (!Array.isArray(value)) return fallback;
  return value.map((raw) => {
    const obj =
      raw && typeof raw === "object"
        ? (raw as Record<string, unknown>)
        : ({} as Record<string, unknown>);
    const out: Record<string, unknown> = {
      id: typeof obj.id === "string" && obj.id ? obj.id : newId(),
    };
    for (const [key, kind] of Object.entries(fields)) {
      if (kind === "number") {
        out[key] = coerceNumber(obj[key], 0);
      } else if (kind === "boolean") {
        out[key] = obj[key] === true || obj[key] === "true";
      } else if (kind === "string[]") {
        out[key] = Array.isArray(obj[key])
          ? (obj[key] as unknown[]).map((v) => String(v))
          : [];
      } else {
        out[key] = String(obj[key] ?? "");
      }
    }
    return out;
  });
};
