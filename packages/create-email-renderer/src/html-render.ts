// Serializador puro JSON -> HTML email-safe. Es el equivalente sin React de
// EmailTemplate (blocks.tsx): mismas estructuras (tablas + estilos inline),
// mismas variables, mismo richtext. Debe mantenerse visualmente sincronizado.
import { escapeHtml, renderRichText } from "./richtext.js";
import { DEFAULT_PALETTE, DEFAULT_SETTINGS } from "./default-blocks.js";
import { resolveVariables, SAMPLE_CONTEXT } from "./variables.js";
import type {
  ButtonProps,
  ColumnsProps,
  DividerProps,
  EmailBlock,
  EmailBlockProps,
  EmailBlockType,
  EmailContext,
  EmailPalette,
  EmailSettings,
  FooterProps,
  HeaderProps,
  HeadingProps,
  HeroProps,
  ImageProps,
  ListProps,
  QuoteProps,
  SpacerProps,
  TextProps,
} from "./types.js";

export interface RenderEmailHtmlOptions {
  blocks: EmailBlock[];
  subject?: string;
  context?: EmailContext;
  settings?: Partial<EmailSettings>;
  palette?: EmailPalette;
}

const alignMap = {
  left: "left",
  center: "center",
  right: "right",
} as const;

const styleToString = (
  style: Record<string, string | number | undefined>,
): string =>
  Object.entries(style)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(
      ([k, v]) => `${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}:${v}`,
    )
    .join(";");

const blockPadding = (props: EmailBlockProps) => {
  const py = "paddingY" in props ? (props.paddingY ?? 0) : 0;
  const px = "paddingX" in props ? (props.paddingX ?? 0) : 0;
  return { padding: `${py}px ${px}px` };
};

/** Tabla full-width con una celda: equivalente email-safe de <Section>. */
const section = (
  style: Record<string, string | number | undefined>,
  content: string,
): string =>
  `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td style="${styleToString(style)}">${content}</td></tr></tbody></table>`;

const text = (
  content: string,
  style: Record<string, string | number | undefined>,
): string => `<p style="${styleToString(style)}">${content}</p>`;

const renderHeader = (
  props: HeaderProps,
  context: EmailContext,
  palette: EmailPalette,
): string => {
  const logo = props.logoUrl
    ? `<img src="${escapeHtml(resolveVariables(props.logoUrl, context))}" alt="${escapeHtml(props.brandName)}" width="140" style="display:inline-block;border:0;outline:none;" />`
    : `<div style="${styleToString({ color: palette.GOLD, fontSize: 20, fontWeight: 700, letterSpacing: "1px", margin: 0 })}">${renderRichText(resolveVariables(props.brandName, context))}</div>`;
  const tagline = props.tagline
    ? `<div style="${styleToString({ color: palette.CREAM_DIM, fontSize: 11, margin: "6px 0 0", textTransform: "uppercase", letterSpacing: "1.5px" })}">${renderRichText(resolveVariables(props.tagline, context))}</div>`
    : "";
  return section(
    {
      backgroundColor: props.backgroundColor || palette.DARK,
      textAlign: alignMap[props.align || "center"],
      ...blockPadding(props),
    },
    logo + tagline,
  );
};

const renderHero = (
  props: HeroProps,
  context: EmailContext,
  palette: EmailPalette,
): string => {
  const image = props.imageUrl
    ? `<img src="${escapeHtml(resolveVariables(props.imageUrl, context))}" alt="" width="480" style="max-width:100%;margin:0 auto 24px;display:block;border:0;" />`
    : "";
  const title = `<div style="${styleToString({ color: palette.DARK, fontSize: 32, lineHeight: 1.2, margin: "0 0 12px", fontWeight: 700 })}">${renderRichText(resolveVariables(props.title, context))}</div>`;
  const subtitle = props.subtitle
    ? `<div style="${styleToString({ color: palette.INK, fontSize: 16, lineHeight: 1.6, margin: 0 })}">${renderRichText(resolveVariables(props.subtitle, context))}</div>`
    : "";
  return section(
    {
      textAlign: alignMap[props.align || "center"],
      ...blockPadding(props),
      ...(props.backgroundColor
        ? { backgroundColor: props.backgroundColor }
        : {}),
    },
    image + title + subtitle,
  );
};

const renderHeading = (
  props: HeadingProps,
  context: EmailContext,
  palette: EmailPalette,
): string =>
  section(
    {
      textAlign: alignMap[props.align || "left"],
      ...blockPadding(props),
      ...(props.backgroundColor
        ? { backgroundColor: props.backgroundColor }
        : {}),
    },
    `<div style="${styleToString({ color: props.color || palette.DARK, fontSize: props.size ?? 22, lineHeight: 1.3, margin: 0, fontWeight: 700 })}">${renderRichText(resolveVariables(props.text, context))}</div>`,
  );

const renderText = (
  props: TextProps,
  context: EmailContext,
  palette: EmailPalette,
): string =>
  section(
    {
      textAlign: alignMap[props.align || "left"],
      ...blockPadding(props),
      ...(props.backgroundColor
        ? { backgroundColor: props.backgroundColor }
        : {}),
    },
    `<div style="${styleToString({ color: props.color || palette.INK, fontSize: props.size || 15, lineHeight: 1.6, margin: 0 })}">${renderRichText(resolveVariables(props.text, context))}</div>`,
  );

const renderList = (
  props: ListProps,
  context: EmailContext,
  palette: EmailPalette,
): string => {
  const items = props.items
    .map(
      (item) =>
        `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:8px;"><tbody><tr><td width="24" valign="top">${text(escapeHtml(props.icon || "✓"), { color: palette.GOLD, fontWeight: 700, margin: 0, fontSize: 14 })}</td><td valign="top"><div style="${styleToString({ color: palette.INK, fontSize: 14, lineHeight: 1.5, margin: 0 })}">${renderRichText(resolveVariables(item, context))}</div></td></tr></tbody></table>`,
    )
    .join("");
  return section(
    {
      ...blockPadding(props),
      ...(props.backgroundColor
        ? { backgroundColor: props.backgroundColor }
        : {}),
    },
    items,
  );
};

const renderButton = (
  props: ButtonProps,
  context: EmailContext,
  palette: EmailPalette,
): string =>
  section(
    {
      textAlign: alignMap[props.align || "center"],
      ...blockPadding(props),
      ...(props.blockBackgroundColor
        ? { backgroundColor: props.blockBackgroundColor }
        : {}),
    },
    `<a href="${escapeHtml(resolveVariables(props.href, context))}" target="_blank" style="${styleToString({ backgroundColor: props.backgroundColor || palette.GOLD, color: props.color || palette.DARK, fontWeight: 700, padding: "14px 28px", borderRadius: 999, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.5px", display: "inline-block", textDecoration: "none" })}">${escapeHtml(resolveVariables(props.label, context))}</a>`,
  );

const renderImage = (
  props: ImageProps,
  context: EmailContext,
  palette: EmailPalette,
): string => {
  let content: string;
  if (props.src) {
    const img = `<img src="${escapeHtml(resolveVariables(props.src, context))}" alt="${escapeHtml(props.alt || "")}" width="${props.width || 480}" style="max-width:100%;display:inline-block;border:0;" />`;
    content = props.href
      ? `<a href="${escapeHtml(resolveVariables(props.href, context))}" target="_blank" rel="noopener">${img}</a>`
      : img;
  } else {
    content = text("(Selecciona una imagen)", {
      color: palette.CREAM_DIM,
      fontSize: 12,
      margin: 0,
    });
  }
  return section(
    {
      textAlign: alignMap[props.align || "center"],
      ...blockPadding(props),
      ...(props.backgroundColor
        ? { backgroundColor: props.backgroundColor }
        : {}),
    },
    content,
  );
};

const renderQuote = (
  props: QuoteProps,
  context: EmailContext,
  palette: EmailPalette,
): string => {
  const quote = `<div style="${styleToString({ color: palette.INK, fontStyle: "italic", fontSize: 15, lineHeight: 1.6, margin: 0 })}">\u201C${renderRichText(resolveVariables(props.text, context))}\u201D</div>`;
  const author = props.author
    ? `<div style="${styleToString({ color: palette.CREAM_DIM, fontSize: 12, margin: "8px 0 0" })}">\u2014 ${renderRichText(resolveVariables(props.author, context))}</div>`
    : "";
  return section(
    {
      borderLeft: `${props.borderWidth ?? 3}px solid ${props.borderColor || palette.GOLD}`,
      ...blockPadding(props),
      paddingLeft: (props.paddingX ?? 32) + 16,
      ...(props.marginLeft ? { marginLeft: `${props.marginLeft}px` } : {}),
      ...(props.backgroundColor
        ? { backgroundColor: props.backgroundColor }
        : {}),
    },
    quote + author,
  );
};

const renderColumns = (
  props: ColumnsProps,
  context: EmailContext,
  palette: EmailPalette,
): string => {
  const cols = (props.columns || [])
    .map(
      (col) =>
        `<td width="50%" valign="top" style="width:50%;padding-right:8px;"><div style="${styleToString({ color: palette.INK, fontSize: 14, lineHeight: 1.5, margin: 0 })}">${renderRichText(resolveVariables(col.text, context))}</div></td>`,
    )
    .join("");
  return section(
    {
      ...blockPadding(props),
      ...(props.backgroundColor
        ? { backgroundColor: props.backgroundColor }
        : {}),
    },
    `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr>${cols}</tr></tbody></table>`,
  );
};

const renderDivider = (props: DividerProps): string => {
  const style =
    props.height !== undefined
      ? { padding: `${props.height}px ${props.paddingX ?? 32}px` }
      : blockPadding(props);
  return section(
    {
      ...style,
      ...(props.backgroundColor
        ? { backgroundColor: props.backgroundColor }
        : {}),
    },
    `<hr style="width:100%;border:none;border-top:1px solid ${props.color || "#e3dccb"};margin:0;" />`,
  );
};

const renderSpacer = (props: SpacerProps): string =>
  section(
    {
      height: props.height || 24,
      lineHeight: 0,
      fontSize: 0,
      ...(props.backgroundColor
        ? { backgroundColor: props.backgroundColor }
        : {}),
    },
    "&nbsp;",
  );

const renderFooter = (
  props: FooterProps,
  context: EmailContext,
  palette: EmailPalette,
): string => {
  const body = text(
    escapeHtml(
      props.text
        ? resolveVariables(props.text, context)
        : "Recibes este correo por estar registrado en nuestra plataforma.",
    ),
    { color: "#f5f1e8", fontSize: 12, lineHeight: 1.6, margin: "0 0 12px" },
  );
  const brand = props.brandName
    ? `<div style="${styleToString({ color: palette.GOLD, fontSize: 11, letterSpacing: "1px", margin: "12px 0 0" })}">${renderRichText(resolveVariables(props.brandName, context))}</div>`
    : "";
  return section(
    {
      backgroundColor: props.backgroundColor || palette.DARK,
      padding: "24px 32px",
      textAlign: "center",
    },
    body + brand,
  );
};

const renderBlock = (
  block: EmailBlock,
  context: EmailContext,
  palette: EmailPalette,
): string => {
  switch (block.type as EmailBlockType) {
    case "header":
      return renderHeader(block.props as HeaderProps, context, palette);
    case "hero":
      return renderHero(block.props as HeroProps, context, palette);
    case "heading":
      return renderHeading(block.props as HeadingProps, context, palette);
    case "text":
      return renderText(block.props as TextProps, context, palette);
    case "list":
      return renderList(block.props as ListProps, context, palette);
    case "button":
      return renderButton(block.props as ButtonProps, context, palette);
    case "image":
      return renderImage(block.props as ImageProps, context, palette);
    case "quote":
      return renderQuote(block.props as QuoteProps, context, palette);
    case "columns":
      return renderColumns(block.props as ColumnsProps, context, palette);
    case "divider":
      return renderDivider(block.props as DividerProps);
    case "spacer":
      return renderSpacer(block.props as SpacerProps);
    case "footer":
      return renderFooter(block.props as FooterProps, context, palette);
    default:
      return "";
  }
};

/**
 * Renderiza el payload de bloques a HTML email-safe sin React.
 * Equivalente funcional de `renderEmailHtml` basado en react-email.
 */
export const renderEmailHtml = async ({
  blocks,
  subject = "",
  context = SAMPLE_CONTEXT,
  settings = {},
  palette = DEFAULT_PALETTE,
}: RenderEmailHtmlOptions): Promise<string> => {
  const pageBackground =
    settings.pageBackground ?? DEFAULT_SETTINGS.pageBackground;
  const cardBorderWidth =
    settings.cardBorderWidth ?? DEFAULT_SETTINGS.cardBorderWidth;
  const cardBorderRadius =
    settings.cardBorderRadius ?? DEFAULT_SETTINGS.cardBorderRadius;

  const resolvedSubject = resolveVariables(subject, context);
  const body = blocks
    .map((block) => renderBlock(block, context, palette))
    .join("");

  return `<!DOCTYPE html>
<html dir="ltr" lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>${escapeHtml(resolvedSubject)}</title>
  </head>
  <body style="${styleToString({ margin: 0, padding: 0, backgroundColor: pageBackground })}">
    <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(resolvedSubject)}</div>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" width="100%" style="${styleToString({ maxWidth: 600, width: "100%", backgroundColor: "#ffffff", border: `${cardBorderWidth}px solid #e3dccb`, borderRadius: cardBorderRadius, margin: "0 auto" })}">
      <tbody><tr><td>${body}</td></tr></tbody>
    </table>
  </body>
</html>`;
};
