import { newId } from "./id.js";

export type EmailBlockType =
  | "header"
  | "hero"
  | "heading"
  | "text"
  | "list"
  | "button"
  | "image"
  | "quote"
  | "columns"
  | "container"
  | "grid"
  | "divider"
  | "spacer"
  | "footer"
  | "social"
  | "gallery"
  | "stats"
  | "pricing"
  | "product"
  | "testimonial"
  | "features"
  | "avatar"
  | "code"
  | "link"
  | "checkout"
  | "downloads";

/**
 * Profundidad máxima de anidamiento. 1 = un bloque puede contener hijos, pero
 * esos hijos no pueden volver a contener bloques (sin recursión infinita).
 */
export const MAX_BLOCK_DEPTH = 1;

/** Tipos que pueden contener bloques hijos. */
export const CONTAINER_BLOCK_TYPES: EmailBlockType[] = [
  "container",
  "columns",
  "grid",
  "footer",
];

export const isContainerType = (type: string): boolean =>
  type === "container" ||
  type === "columns" ||
  type === "grid" ||
  type === "footer";


export interface BlockCommonProps {
  align?: "left" | "center" | "right";
  backgroundColor?: string;
  paddingY?: number;
  paddingX?: number;
  /** Overrides por lado; ganan a `paddingY`/`paddingX` cuando están definidos. */
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  /** Separación externa del bloque (se aplica a la tabla contenedora). */
  marginTop?: number;
  marginBottom?: number;
  /** Separación interna entre hijos (columnas, elementos de lista). */
  gap?: number;
}

export interface HeaderProps extends BlockCommonProps {
  brandName: string;
  tagline?: string;
  logoUrl?: string;
}

export interface HeroProps extends BlockCommonProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
}

export interface HeadingProps extends BlockCommonProps {
  text: string;
  size?: number;
  color?: string;
}

export interface TextProps extends BlockCommonProps {
  text: string;
  size?: number;
  color?: string;
}

/**
 * Estilos de la lista (patrones de react.email/components/list):
 * `bullets` viñetas simples, `numbered` badge numerado + título + descripción,
 * `with-image` imagen a la izquierda con badge, título, descripción y enlace.
 */
export type ListVariant = "bullets" | "numbered" | "with-image";

export interface ListEntry {
  id: string;
  title: string;
  description?: string;
  /** Texto del badge circular; vacío = número de la posición. */
  number?: string;
  /** Imagen de la fila (solo variante `with-image`). */
  image?: string;
  href?: string;
  linkLabel?: string;
}

export interface ListProps extends BlockCommonProps {
  /** Viñetas de la variante `bullets` (la clásica). */
  items: string[];
  icon?: string;
  /** Estilo de la lista (default `"bullets"` = la de siempre). */
  variant?: ListVariant;
  /** Filas de las variantes `numbered` / `with-image`. */
  entries?: ListEntry[];
  /** Color del badge numerado (y del enlace "Learn more"). */
  accentColor?: string;
  /** Borde redondeado de la imagen en px (default 4). */
  radius?: number;
  /** Alto de la imagen en px (default 168). */
  imageHeight?: number;
}

export const LIST_ICONS = [
  "✓",
  "•",
  "●",
  "→",
  "★",
  "✦",
  "◆",
  "▸",
  "»",
  "–",
];

export interface ButtonProps extends BlockCommonProps {
  label: string;
  href: string;
  backgroundColor?: string;
  color?: string;
  blockBackgroundColor?: string;
}

export interface ImageProps extends BlockCommonProps {
  src: string;
  alt?: string;
  width?: number;
  href?: string;
}

export interface QuoteProps extends BlockCommonProps {
  text: string;
  author?: string;
  borderColor?: string;
  borderWidth?: number;
  marginLeft?: number;
}

export interface ColumnsProps extends BlockCommonProps {
  columns: ColumnDef[];
}

/** Columna de `columns` v2 / `grid`: contiene bloques hijos. */
export interface ColumnDef {
  id: string;
  blocks: EmailBlock[];
  /** Ancho en porcentaje (solo `grid`); `undefined` = reparto equitativo. */
  width?: number;
}

/** Bloque contenedor de una sola columna. */
export interface ContainerProps extends BlockCommonProps {
  blocks: EmailBlock[];
}

/** Cuadrícula de una fila con celdas de ancho configurable (ratios). */
export interface GridProps extends BlockCommonProps {
  columns: ColumnDef[];
  /** Identificador del preset de anchos (ej. "1-2", "1-3-2-3"). */
  layout?: string;
}

export interface DividerProps extends BlockCommonProps {
  color?: string;
  height?: number;
}

export interface SpacerProps {
  height?: number;
  backgroundColor?: string;
}

export interface FooterProps extends BlockCommonProps {
  /**
   * "classic" (default) = barra oscura con `text`/`brandName`.
   * "one-column" / "two-columns" = layouts de columnas (`columns`).
   */
  variant?: "classic" | "one-column" | "two-columns";
  columns?: ColumnDef[];
  text?: string;
  brandName?: string;
  backgroundColor?: string;
}

export interface SocialLink {
  id: string;
  label: string;
  href: string;
  /** Glifo (emoji/texto) o URL de imagen, usado en modo "logo". */
  icon?: string;
}

export interface SocialProps extends BlockCommonProps {
  links: SocialLink[];
  /** "text" muestra el nombre; "logo" muestra el ícono/logo. */
  mode?: "text" | "logo";
  /** Tamaño del medallón/logo en modo "logo" (px). Default: 32. */
  iconSize?: number;
  color?: string;
  accentColor?: string;
}

/** Glifos sugeridos para el modo logo (editables o sustituibles por una URL). */
export const SOCIAL_ICONS = [
  "◎",
  "f",
  "X",
  "in",
  "▶",
  "♪",
  "✆",
  "✉",
  "@",
  "★",
  "●",
  "◆",
];

export interface GalleryImage {
  id: string;
  src: string;
  alt?: string;
  href?: string;
}

/**
 * Diseños de la galería (patrones de react.email):
 * `grid` cuadrícula 2/3 por fila, `three-columns` tres columnas en una fila,
 * `horizontal` dos apiladas + una alta a la derecha,
 * `vertical` una ancha arriba + dos abajo.
 */
export type GalleryVariant =
  | "grid"
  | "three-columns"
  | "horizontal"
  | "vertical";

export interface GalleryProps extends BlockCommonProps {
  images: GalleryImage[];
  /** Imágenes por fila (2 o 3). Solo aplica a `variant: "grid"`. */
  columns?: number;
  /** Diseño de la galería (default `"grid"` = cuadrícula clásica). */
  variant?: GalleryVariant;
  /** Borde redondeado de las imágenes en px (default 6). */
  radius?: number;
  /** Alto fijo de cada imagen en px; 0 = alto automático. */
  imageHeight?: number;
}

export interface StatItem {
  id: string;
  value: string;
  label: string;
}

export interface StatsProps extends BlockCommonProps {
  stats: StatItem[];
  accentColor?: string;
}

export interface PricingPlan {
  id: string;
  title: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  /** Tarjeta destacada (fondo oscuro). */
  highlighted?: boolean;
}

export interface PricingProps extends BlockCommonProps {
  /**
   * "card" (default) = tarjeta única actual; "offer" = tabla de oferta;
   * "two-tiers" = dos planes con uno destacado.
   */
  variant?: "card" | "offer" | "two-tiers";
  title: string;
  price: string;
  period?: string;
  bullets: string[];
  ctaLabel: string;
  ctaHref: string;
  accentColor?: string;
  textColor?: string;
  /** Variante "offer". */
  eyebrow?: string;
  description?: string;
  note?: string;
  note2?: string;
  /** Variante "two-tiers". */
  heading?: string;
  subtitle?: string;
  plans?: PricingPlan[];
  footnote?: string;
}

/**
 * Diseños del bloque `product` (patrones de react.email/components/ecommerce):
 * `card` la tarjeta de siempre, `hero` imagen ancha arriba con el texto centrado,
 * `image-left` imagen 50% a la izquierda y `grid` fila(s) de tarjetas.
 */
export type ProductVariant = "card" | "hero" | "image-left" | "grid";

/** Tarjeta del diseño `grid` de `product`. */
export interface ProductItem {
  id: string;
  imageUrl?: string;
  name: string;
  description?: string;
  price?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface ProductProps extends BlockCommonProps {
  imageUrl?: string;
  name: string;
  description?: string;
  price: string;
  ctaLabel: string;
  ctaHref: string;
  /** Diseño del bloque (default `"card"` = la tarjeta de siempre). */
  variant?: ProductVariant;
  /** Línea superior del diseño `hero` (p. ej. "Relojes clásicos"). */
  eyebrow?: string;
  /** Título de sección de `grid`. */
  heading?: string;
  /** Bajada del título de sección de `grid`. */
  subheading?: string;
  /** Tarjetas del diseño `grid`. */
  products?: ProductItem[];
  /** Tarjetas por fila del diseño `grid` (2, 3 o 4). */
  columns?: number;
  /** Alto de cada imagen en px (hero 320 · grid 180/250). */
  imageHeight?: number;
  /** Borde redondeado de las imágenes en px (hero 12 · resto 8). */
  radius?: number;
  /** Color del eyebrow, el precio y el botón. */
  accentColor?: string;
}

/** Línea de pedido del bloque `checkout`. */
export interface CheckoutLine {
  id: string;
  imageUrl?: string;
  name: string;
  quantity?: string;
  price?: string;
}

export interface CheckoutProps extends BlockCommonProps {
  heading?: string;
  lines: CheckoutLine[];
  ctaLabel?: string;
  ctaHref?: string;
  /** Alto de la miniatura de cada línea (default 110). */
  imageHeight?: number;
  /** Borde redondeado de la miniatura (default 8). */
  radius?: number;
  /** Color del botón de compra (default `#4f46e5`). */
  accentColor?: string;
  /** Color del borde de la caja y de las líneas de la tabla. */
  borderColor?: string;
}

/**
 * Archivo subido en Ajustes (`settings.files`), no en un bloque: se sube una
 * vez y el bloque `downloads` lo lista donde lo pongas.
 *
 * `url` debe ser una URL **pública** (R2/S3/tu API) para que el destinatario
 * pueda descargarlo o tu backend adjuntarlo; los `blob:` del navegador y los
 * `data:` gigantes solo sirven para previsualizar.
 */
export interface EmailFileAttachment {
  id: string;
  url: string;
  name: string;
  /** Tamaño en bytes (informativo: se muestra junto al nombre). */
  size?: number;
  /** MIME real del archivo (informativo: elige el ícono). */
  mimeType?: string;
  /** Adjuntar el archivo al correo (lo resuelve tu backend/ESP). */
  attach?: boolean;
  /** Mostrar enlace de descarga en el bloque `downloads` (default `true`). */
  link?: boolean;
}

/** Familias de archivo (ícono/etiqueta) del bloque `downloads`. */
export type FileKind = "pdf" | "doc" | "sheet" | "slides" | "zip" | "image" | "file";

/** Etiqueta corta por familia (badge del bloque `downloads`). */
export const FILE_KIND_LABELS: Record<FileKind, string> = {
  pdf: "PDF",
  doc: "DOC",
  sheet: "XLS",
  slides: "PPT",
  zip: "ZIP",
  image: "IMG",
  file: "FILE",
};

const FILE_KIND_BY_EXTENSION: Record<string, FileKind> = {
  pdf: "pdf",
  doc: "doc",
  docx: "doc",
  odt: "doc",
  rtf: "doc",
  txt: "doc",
  xls: "sheet",
  xlsx: "sheet",
  csv: "sheet",
  ods: "sheet",
  ppt: "slides",
  pptx: "slides",
  odp: "slides",
  zip: "zip",
  rar: "zip",
  "7z": "zip",
  gz: "zip",
  tar: "zip",
  png: "image",
  jpg: "image",
  jpeg: "image",
  gif: "image",
  webp: "image",
  avif: "image",
  svg: "image",
  bmp: "image",
};

const KIND_BY_MIME_PREFIX: [string, FileKind][] = [
  ["image/", "image"],
  ["application/pdf", "pdf"],
  ["application/zip", "zip"],
  ["application/x-zip", "zip"],
  ["application/x-rar", "zip"],
  ["application/msword", "doc"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml", "doc"],
  ["application/vnd.ms-excel", "sheet"],
  ["application/vnd.openxmlformats-officedocument.spreadsheetml", "sheet"],
  ["text/csv", "sheet"],
  ["application/vnd.ms-powerpoint", "slides"],
  ["application/vnd.openxmlformats-officedocument.presentationml", "slides"],
  ["text/", "doc"],
];

/** Familia de un archivo a partir del nombre/URL y (si hay) su MIME. */
export const fileKind = (nameOrUrl: string, mimeType?: string): FileKind => {
  const mime = (mimeType || "").toLowerCase().split(";")[0].trim();
  for (const [prefix, kind] of KIND_BY_MIME_PREFIX) {
    if (mime.startsWith(prefix)) return kind;
  }
  const clean = (nameOrUrl || "").split("?")[0].split("#")[0];
  const ext = clean.includes(".") ? clean.split(".").pop()!.toLowerCase() : "";
  return FILE_KIND_BY_EXTENSION[ext] ?? "file";
};

/** `1536` -> `"1.5 KB"`. Tolerante: valores raros devuelven `""`. */
export const formatBytes = (bytes: unknown): string => {
  if (typeof bytes !== "number" || !Number.isFinite(bytes) || bytes <= 0) {
    return "";
  }
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export interface DownloadsProps extends BlockCommonProps {
  heading?: string;
  subheading?: string;
  /** Texto del enlace de descarga (default "Descargar"). */
  buttonLabel?: string;
  /** Color del enlace y del badge (default `#d7b227`). */
  accentColor?: string;
  /** Color del borde de la caja y de las filas. */
  borderColor?: string;
  /** Muestra el tamaño de cada archivo (default `true`). */
  showSize?: boolean;
  /** Muestra el badge con el tipo de archivo (default `true`). */
  showIcon?: boolean;
  /** Borde redondeado de la caja (default 8). */
  radius?: number;
  /** Texto cuando aún no hay archivos (vacío = no pintar nada). */
  emptyText?: string;
}

export interface TestimonialProps extends BlockCommonProps {
  avatarUrl?: string;
  quote: string;
  name: string;
  role?: string;
  accentColor?: string;
}

export interface FeatureItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface FeaturesProps extends BlockCommonProps {
  features: FeatureItem[];
  /** Features por fila (2 o 3). */
  columns?: number;
  accentColor?: string;
}

export interface AvatarProps extends BlockCommonProps {
  imageUrl?: string;
  name: string;
  role?: string;
  size?: number;
}

export interface CodeProps extends BlockCommonProps {
  code: string;
  language?: string;
  backgroundColor?: string;
  color?: string;
}

export interface LinkProps extends BlockCommonProps {
  label: string;
  href: string;
  color?: string;
}

export type EmailBlockProps =
  | HeaderProps
  | HeroProps
  | HeadingProps
  | TextProps
  | ListProps
  | ButtonProps
  | ImageProps
  | QuoteProps
  | ColumnsProps
  | ContainerProps
  | GridProps
  | DividerProps
  | SpacerProps
  | FooterProps
  | SocialProps
  | GalleryProps
  | StatsProps
  | PricingProps
  | ProductProps
  | TestimonialProps
  | FeaturesProps
  | AvatarProps
  | CodeProps
  | LinkProps
  | CheckoutProps
  | DownloadsProps;

/** Props por tipo de bloque (base del tipado de `blockJson`). */
export interface BlockPropsMap {
  header: HeaderProps;
  hero: HeroProps;
  heading: HeadingProps;
  text: TextProps;
  list: ListProps;
  button: ButtonProps;
  image: ImageProps;
  quote: QuoteProps;
  columns: ColumnsProps;
  container: ContainerProps;
  grid: GridProps;
  divider: DividerProps;
  spacer: SpacerProps;
  footer: FooterProps;
  social: SocialProps;
  gallery: GalleryProps;
  stats: StatsProps;
  pricing: PricingProps;
  product: ProductProps;
  testimonial: TestimonialProps;
  features: FeaturesProps;
  avatar: AvatarProps;
  code: CodeProps;
  link: LinkProps;
  checkout: CheckoutProps;
  downloads: DownloadsProps;
}

export interface EmailBlock {
  id: string;
  type: EmailBlockType;
  props: EmailBlockProps;
}

export interface EmailContext {
  [key: string]: string;
}

export interface BlockDefinition {
  type: EmailBlockType;
  label: string;
  description: string;
  defaultProps: EmailBlockProps;
}

/** Parámetros UTM añadidos al destino de cada enlace. */
export interface EmailTrackingUtm {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

/**
 * Trackeo del envío (opcional y **por envío**, no se guarda en la plantilla):
 * pixel de apertura y reescritura de enlaces para registrar clics. Se aplica
 * al final del render, así que sin esto la salida es idéntica.
 */
export interface EmailTracking {
  /** Pixel 1×1 de apertura; se inyecta antes de `</body>`. Acepta `{variables}`. */
  pixelUrl?: string;
  /**
   * URL del tracker de clics. Debe incluir `{url}` (el destino se inserta
   * codificado) y acepta `{variables}` del contexto.
   */
  clickUrl?: string;
  /** Añade UTM al destino **antes** de pasarlo por el tracker. */
  utm?: EmailTrackingUtm;
  /** Substrings extra cuyo href NO se reescribe (se suman a los de por defecto). */
  exclude?: string[];
  /** Control total: devuelve el href final (lo que devuelvas se usa tal cual). */
  transformLink?: (href: string) => string;
}

export interface EmailSettings {
  pageBackground: string;
  cardBorderWidth: number;
  cardBorderRadius: number;
  /**
   * Stack CSS de la tipografía del correo (lista ordenada; el cliente usa la
   * primera que tenga instalada). `""` = no emitir `font-family` y heredar la
   * fuente por defecto del cliente.
   */
  fontFamily: string;
  /**
   * Archivos subidos en Ajustes: el bloque `downloads` los lista y tu backend
   * los adjunta al enviar (`attach`). Nunca se descartan por estar vacío.
   */
  files: EmailFileAttachment[];
}

/** Fuentes seguras (de sistema) para el correo, agrupadas por estilo. */
export const FONT_STACKS = [
  {
    value: "system",
    label: "Sistema",
    stack:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  {
    value: "arial",
    label: "Arial / Helvetica",
    stack: "Arial, 'Helvetica Neue', Helvetica, sans-serif",
  },
  {
    value: "verdana",
    label: "Verdana / Tahoma",
    stack: "Verdana, Tahoma, sans-serif",
  },
  {
    value: "trebuchet",
    label: "Trebuchet MS",
    stack: "'Trebuchet MS', Verdana, sans-serif",
  },
  {
    value: "georgia",
    label: "Georgia (serif)",
    stack: "Georgia, 'Times New Roman', serif",
  },
  {
    value: "times",
    label: "Times New Roman (serif)",
    stack: "'Times New Roman', Times, serif",
  },
  {
    value: "mono",
    label: "Monoespaciada",
    stack: "'Courier New', Courier, monospace",
  },
] as const;

export const DEFAULT_FONT_STACK = FONT_STACKS[0].stack;

export interface EmailPalette {
  INK: string;
  DARK: string;
  GOLD: string;
  CREAM_DIM: string;
}

export const EMAIL_BLOCK_TYPES: EmailBlockType[] = [
  "header",
  "hero",
  "heading",
  "text",
  "list",
  "button",
  "image",
  "quote",
  "columns",
  "container",
  "grid",
  "divider",
  "spacer",
  "footer",
  "social",
  "gallery",
  "stats",
  "pricing",
  "product",
  "testimonial",
  "features",
  "avatar",
  "code",
  "link",
  "checkout",
  "downloads",
];

export const buildBlockMap = (
  library: BlockDefinition[],
): Record<EmailBlockType, BlockDefinition> =>
  Object.fromEntries(library.map((def) => [def.type, def])) as Record<
    EmailBlockType,
    BlockDefinition
  >;

export const createBlock = (
  type: EmailBlockType,
  library: BlockDefinition[],
): EmailBlock => {
  const map = buildBlockMap(library);
  return {
    id: newId(),
    type,
    props: { ...map[type].defaultProps },
  };
};