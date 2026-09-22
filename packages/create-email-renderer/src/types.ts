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
  | "checkout";

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
  | CheckoutProps;

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

export interface EmailSettings {
  pageBackground: string;
  cardBorderWidth: number;
  cardBorderRadius: number;
}

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