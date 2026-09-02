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
  | "divider"
  | "spacer"
  | "footer";

export interface BlockCommonProps {
  align?: "left" | "center" | "right";
  backgroundColor?: string;
  paddingY?: number;
  paddingX?: number;
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

export interface ListProps extends BlockCommonProps {
  items: string[];
  icon?: string;
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
  columns: { id: string; text: string }[];
}

export interface DividerProps extends BlockCommonProps {
  color?: string;
  height?: number;
}

export interface SpacerProps {
  height?: number;
  backgroundColor?: string;
}

export interface FooterProps {
  text?: string;
  brandName?: string;
  backgroundColor?: string;
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
  | DividerProps
  | SpacerProps
  | FooterProps;

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
  "divider",
  "spacer",
  "footer",
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