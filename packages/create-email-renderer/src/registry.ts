// Registro extensible de bloques: fuente viva de definiciones + render HTML
// + normalización opcional. Los built-in se registran al importar
// default-blocks (definitions) y html-render (renderers). Consumidores y
// plugins pueden llamar a registerBlock para añadir tipos nuevos sin tocar
// el core.
import type {
  BlockDefinition,
  EmailBlockProps,
  EmailContext,
  EmailPalette,
} from "./types.js";

export interface BlockRenderInput<P = EmailBlockProps> {
  props: P;
  context: EmailContext;
  palette: EmailPalette;
}

export type BlockRenderHtml<P = EmailBlockProps> = (
  input: BlockRenderInput<P>,
) => string;

export type BlockNormalizeProps = (
  rawProps: unknown,
  definition: BlockDefinition,
) => EmailBlockProps;

export interface BlockRegistration<P = EmailBlockProps> {
  definition: BlockDefinition;
  renderHtml?: BlockRenderHtml<P>;
  /** Normalización profunda opcional (arrays de objetos, hijos, etc.). */
  normalizeProps?: BlockNormalizeProps;
}

type StoredRegistration = BlockRegistration<never>;

const registry = new Map<string, StoredRegistration>();

/**
 * Registra (o fusiona) un bloque. Si el `type` ya existe, se sobrescriben
 * las claves presentes y se conserva el resto — permite registrar la
 * definition primero y el renderer después (orden de import de builtins).
 */
export const registerBlock = <P = EmailBlockProps>(
  registration: BlockRegistration<P>,
): void => {
  const { definition } = registration;
  if (!definition || typeof definition.type !== "string" || !definition.type) {
    throw new Error("registerBlock: definition.type is required");
  }
  const existing = registry.get(definition.type);
  registry.set(definition.type, {
    ...(existing as object),
    ...(registration as object),
    definition,
  } as StoredRegistration);
};

export const unregisterBlock = (type: string): void => {
  registry.delete(type);
};

export const getBlockRegistration = (
  type: string,
): BlockRegistration | undefined =>
  registry.get(type) as BlockRegistration | undefined;

export const getBlockRenderHtml = (
  type: string,
): BlockRenderHtml | undefined =>
  registry.get(type)?.renderHtml as BlockRenderHtml | undefined;

export const getBlockNormalizeProps = (
  type: string,
): BlockNormalizeProps | undefined =>
  registry.get(type)?.normalizeProps as BlockNormalizeProps | undefined;

/** Definitions en orden de registro (la paleta consume esto). */
export const listBlockDefinitions = (): BlockDefinition[] =>
  Array.from(registry.values()).map((reg) => reg.definition);

/** Solo para tests: limpia registros no-built-in… en realidad todo el mapa. */
export const clearBlockRegistry = (): void => {
  registry.clear();
};
