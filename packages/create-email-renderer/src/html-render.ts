// Serializador puro JSON -> HTML email-safe. Es el equivalente sin React de
// EmailTemplate (blocks.tsx): mismas estructuras (tablas + estilos inline),
// mismas variables, mismo richtext. Debe mantenerse visualmente sincronizado.
import { escapeHtml, renderRichText } from "./richtext.js";
import {
  DEFAULT_BLOCK_LIBRARY,
  DEFAULT_PALETTE,
  DEFAULT_SETTINGS,
} from "./default-blocks.js";
import { getBlockRenderHtml, registerBlock } from "./registry.js";
import { resolveVariables, SAMPLE_CONTEXT } from "./variables.js";
import type {
  AvatarProps,
  BlockCommonProps,
  ButtonProps,
  CodeProps,
  ColumnsProps,
  ColumnDef,
  ContainerProps,
  DividerProps,
  EmailBlock,
  EmailBlockProps,
  EmailBlockType,
  EmailContext,
  EmailPalette,
  EmailSettings,
  FeaturesProps,
  FooterProps,
  GalleryProps,
  GridProps,
  HeaderProps,
  HeadingProps,
  HeroProps,
  ImageProps,
  LinkProps,
  ListProps,
  PricingProps,
  ProductProps,
  QuoteProps,
  SocialProps,
  SpacerProps,
  StatsProps,
  TestimonialProps,
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

// Props CSS que aceptan números sin unidad (como los inline styles de React).
const UNITLESS = new Set([
  "font-weight",
  "line-height",
  "opacity",
  "z-index",
  "flex",
  "flex-grow",
  "flex-shrink",
  "flex-basis",
  "order",
  "column-count",
  "animation-iteration-count",
  "orphans",
  "widows",
  "zoom",
]);

const styleToString = (
  style: Record<string, string | number | undefined>,
): string =>
  Object.entries(style)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => {
      const prop = k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
      // Los números llevan px salvo las props unitless (igual que React).
      const value =
        typeof v === "number" && v !== 0 && !UNITLESS.has(prop)
          ? `${v}px`
          : String(v);
      return `${prop}:${value}`;
    })
    .join(";");

const blockPadding = (
  props: EmailBlockProps,
): Record<string, string | number | undefined> => {
  const layout = props as BlockCommonProps;
  const py = "paddingY" in props ? layout.paddingY : undefined;
  const px = "paddingX" in props ? layout.paddingX : undefined;
  const top = layout.paddingTop;
  const right = layout.paddingRight;
  const bottom = layout.paddingBottom;
  const left = layout.paddingLeft;
  // Sin overrides por lado emitimos el shorthand (paridad con versiones previas).
  if (top === undefined && right === undefined && bottom === undefined && left === undefined) {
    return { padding: `${py ?? 0}px ${px ?? 0}px` };
  }
  return {
    paddingTop: top ?? py ?? 0,
    paddingRight: right ?? px ?? 0,
    paddingBottom: bottom ?? py ?? 0,
    paddingLeft: left ?? px ?? 0,
  };
};

/** Padding por lado + márgenes externos del bloque. */
const blockSpacing = (
  props: EmailBlockProps,
): Record<string, string | number | undefined> => {
  const layout = props as BlockCommonProps;
  return {
    ...blockPadding(props),
    ...(layout.marginTop !== undefined ? { marginTop: layout.marginTop } : {}),
    ...(layout.marginBottom !== undefined
      ? { marginBottom: layout.marginBottom }
      : {}),
  };
};

/** Tabla full-width con una celda: equivalente email-safe de <Section>. */
const section = (
  style: Record<string, string | number | undefined>,
  content: string,
): string => {
  // Los márgenes no aplican a un <td>; se mueven a la tabla contenedora.
  const cell: Record<string, string | number | undefined> = {};
  const outer: Record<string, string | number | undefined> = {};
  for (const [k, v] of Object.entries(style)) {
    if (k.startsWith("margin")) outer[k] = v;
    else cell[k] = v;
  }
  const outerStyle = styleToString(outer);
  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"${
    outerStyle ? ` style="${outerStyle}"` : ""
  }><tbody><tr><td style="${styleToString(cell)}">${content}</td></tr></tbody></table>`;
};

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
      ...blockSpacing(props),
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
      ...blockSpacing(props),
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
      ...blockSpacing(props),
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
      ...blockSpacing(props),
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
      ...blockSpacing(props),
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
      ...blockSpacing(props),
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
      ...blockSpacing(props),
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
      ...blockSpacing(props),
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
  const gutter = props.gap ?? 8;
  const columns = props.columns || [];
  const cols = columns
    .map((col, i) => {
      const isLast = i === columns.length - 1;
      const inner = (col.blocks || [])
        .map((child) => renderBlock(child, context, palette))
        .join("");
      return `<td width="50%" valign="top" style="width:50%;${
        isLast ? "" : `padding-right:${gutter}px;`
      }"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td>${inner}</td></tr></tbody></table></td>`;
    })
    .join("");
  return section(
    {
      ...blockSpacing(props),
      ...(props.backgroundColor
        ? { backgroundColor: props.backgroundColor }
        : {}),
    },
    `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr>${cols}</tr></tbody></table>`,
  );
};

const renderContainer = (
  props: ContainerProps,
  context: EmailContext,
  palette: EmailPalette,
): string => {
  const inner = (props.blocks || [])
    .map((child) => renderBlock(child, context, palette))
    .join("");
  return section(
    {
      ...blockSpacing(props),
      ...(props.backgroundColor
        ? { backgroundColor: props.backgroundColor }
        : {}),
    },
    inner,
  );
};

const renderDivider = (props: DividerProps): string => {
  const spacing = blockSpacing(props);
  const style =
    props.height !== undefined
      ? { ...spacing, padding: `${props.height}px ${props.paddingX ?? 32}px` }
      : spacing;
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

const renderFooterClassic = (
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

const renderFooter = (
  props: FooterProps,
  context: EmailContext,
  palette: EmailPalette,
): string => {
  // "classic" (default) mantiene la barra oscura con text/brandName.
  if (!props.variant || props.variant === "classic") {
    return renderFooterClassic(props, context, palette);
  }
  // "one-column" / "two-columns": layout de columnas con bloques anidados.
  return section(
    {
      textAlign: alignMap[props.align || "left"],
      ...blockSpacing(props),
      ...bgStyle(props),
    },
    renderColumnsTable(props.columns || [], props.gap ?? 12, context, palette),
  );
};

const chunkRows = <T,>(arr: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const bgStyle = (props: {
  backgroundColor?: string;
}): Record<string, string | undefined> =>
  props.backgroundColor ? { backgroundColor: props.backgroundColor } : {};

const isRemoteAsset = (value: string): boolean =>
  /^(https?:)?\/\//.test(value) || value.startsWith("data:");

const renderSocial = (
  props: SocialProps,
  context: EmailContext,
  palette: EmailPalette,
): string => {
  const accent = props.accentColor || palette.GOLD;
  const logo = props.mode === "logo";
  const size = props.iconSize ?? 32;
  const half = (props.gap ?? 6) / 2;
  const links = (props.links || [])
    .map((l) => {
      const href = escapeHtml(resolveVariables(l.href, context));
      if (logo) {
        const icon = (l.icon || "").trim();
        const inner = isRemoteAsset(icon)
          ? `<img src="${escapeHtml(resolveVariables(icon, context))}" alt="${escapeHtml(l.label)}" width="${size}" height="${size}" style="display:inline-block;border:0;border-radius:50%;width:${size}px;height:${size}px;object-fit:cover;" />`
          : `<span style="${styleToString({ display: "inline-block", width: size, height: size, lineHeight: `${size}px`, textAlign: "center", borderRadius: "50%", backgroundColor: accent, color: palette.DARK, fontSize: Math.round(size * 0.4), fontWeight: 700 })}">${escapeHtml(icon || resolveVariables(l.label, context).slice(0, 2))}</span>`;
        return `<a href="${href}" target="_blank" style="display:inline-block;margin:0 ${half}px;text-decoration:none;">${inner}</a>`;
      }
      return `<a href="${href}" target="_blank" style="${styleToString({ color: props.color || palette.INK, fontSize: 13, fontWeight: 600, textDecoration: "none", margin: "0 10px", display: "inline-block" })}">${escapeHtml(resolveVariables(l.label, context))}</a>`;
    })
    .join("");
  return section(
    {
      textAlign: alignMap[props.align || "center"],
      ...blockSpacing(props),
      ...bgStyle(props),
    },
    links,
  );
};

const renderGallery = (
  props: GalleryProps,
  context: EmailContext,
  palette: EmailPalette,
): string => {
  const cols = props.columns === 3 ? 3 : 2;
  const width = Math.floor(100 / cols);
  const rows = chunkRows(props.images || [], cols)
    .map((row) => {
      const cells = row
        .map((img) => {
          const el = img.src
            ? `<img src="${escapeHtml(resolveVariables(img.src, context))}" alt="${escapeHtml(img.alt || "")}" width="240" style="max-width:100%;display:block;border:0;border-radius:6px;" />`
            : text("(Imagen)", {
                color: palette.CREAM_DIM,
                fontSize: 12,
                margin: 0,
              });
          const inner = img.href
            ? `<a href="${escapeHtml(resolveVariables(img.href, context))}" target="_blank" rel="noopener">${el}</a>`
            : el;
          return `<td width="${width}%" valign="top" style="width:${width}%;padding:6px;">${inner}</td>`;
        })
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  return section(
    { ...blockSpacing(props), ...bgStyle(props) },
    `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tbody>${rows}</tbody></table>`,
  );
};

const renderStats = (
  props: StatsProps,
  context: EmailContext,
  palette: EmailPalette,
): string => {
  const stats = props.stats || [];
  const width = stats.length > 0 ? Math.floor(100 / stats.length) : 100;
  const cells = stats
    .map(
      (s) =>
        `<td width="${width}%" align="center" valign="top" style="width:${width}%;padding:8px;"><div style="${styleToString({ color: props.accentColor || palette.GOLD, fontSize: 28, fontWeight: 700, lineHeight: 1.1, margin: 0 })}">${renderRichText(resolveVariables(s.value, context))}</div><div style="${styleToString({ color: palette.INK, fontSize: 12, margin: "6px 0 0" })}">${renderRichText(resolveVariables(s.label, context))}</div></td>`,
    )
    .join("");
  return section(
    {
      textAlign: alignMap[props.align || "center"],
      ...blockSpacing(props),
      ...bgStyle(props),
    },
    `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr>${cells}</tr></tbody></table>`,
  );
};

const renderPricingCard = (
  props: PricingProps,
  context: EmailContext,
  palette: EmailPalette,
): string => {
  const accent = props.accentColor || palette.GOLD;
  const textColor = props.textColor || palette.INK;
  const bullets = (props.bullets || [])
    .map(
      (b) =>
        `<div style="${styleToString({ color: textColor, fontSize: 14, lineHeight: 1.6, margin: "0 0 6px" })}"><span style="${styleToString({ color: accent, fontWeight: 700 })}">✓</span> ${renderRichText(resolveVariables(b, context))}</div>`,
    )
    .join("");
  const cta = props.ctaLabel
    ? `<a href="${escapeHtml(resolveVariables(props.ctaHref, context))}" target="_blank" style="${styleToString({ backgroundColor: accent, color: palette.DARK, fontWeight: 700, padding: "12px 24px", borderRadius: 999, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.5px", display: "inline-block", textDecoration: "none", marginTop: 16 })}">${escapeHtml(resolveVariables(props.ctaLabel, context))}</a>`
    : "";
  const card = `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:420px;margin:0 auto;"><tbody><tr><td style="${styleToString({ border: "1px solid #e3dccb", borderRadius: 10, padding: 24, textAlign: "center" })}"><div style="${styleToString({ color: accent, fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px" })}">${renderRichText(resolveVariables(props.title, context))}</div><div style="${styleToString({ color: textColor, fontSize: 36, fontWeight: 700, lineHeight: 1.1, margin: 0 })}">${renderRichText(resolveVariables(props.price, context))}<span style="${styleToString({ fontSize: 14, fontWeight: 400, color: palette.CREAM_DIM })}">${escapeHtml(props.period || "")}</span></div><div style="${styleToString({ margin: "16px 0 0", textAlign: "left" })}">${bullets}</div>${cta}</td></tr></tbody></table>`;
  return section({ ...blockSpacing(props), ...bgStyle(props) }, card);
};

/** Botón ancho completo (email-safe: display:block). */
const pricingButton = (
  label: string,
  href: string,
  background: string,
  color: string,
  options: { radius: number; padding: string; fontWeight: number; fontSize: number; lineHeight: string },
  context: EmailContext,
): string => {
  if (!label) return "";
  return `<a href="${escapeHtml(resolveVariables(href || "", context))}" target="_blank" style="${styleToString({ backgroundColor: background, color, borderRadius: options.radius, boxSizing: "border-box", display: "block", fontSize: options.fontSize, lineHeight: options.lineHeight, fontWeight: options.fontWeight, letterSpacing: "0.025em", padding: options.padding, textAlign: "center", textDecoration: "none", width: "100%" })}">${escapeHtml(resolveVariables(label, context))}</a>`;
};

const pricingRichList = (
  items: string[],
  context: EmailContext,
  style: Record<string, string | number | undefined>,
): string =>
  `<ul style="${styleToString(style)}">${items
    .map(
      (item) =>
        `<li style="margin-bottom:8px">${renderRichText(resolveVariables(item, context))}</li>`,
    )
    .join("")}</ul>`;

const renderPricingOffer = (
  props: PricingProps,
  context: EmailContext,
  palette: EmailPalette,
): string => {
  const accent = props.accentColor || "#4f46e5";
  const eyebrow = props.eyebrow
    ? `<div style="${styleToString({ color: accent, fontSize: 12, fontWeight: 600, letterSpacing: "0.025em", lineHeight: "20px", textTransform: "uppercase", margin: "0 0 16px" })}">${escapeHtml(resolveVariables(props.eyebrow, context))}</div>`
    : "";
  const price = `<div style="${styleToString({ fontSize: 30, fontWeight: 700, lineHeight: "36px", margin: "0 0 12px" })}"><span style="${styleToString({ color: "#101828" })}">${renderRichText(resolveVariables(props.price, context))}</span> <span style="${styleToString({ fontSize: 16, fontWeight: 500, lineHeight: "20px" })}">${escapeHtml(props.period || "")}</span></div>`;
  const description = props.description
    ? `<div style="${styleToString({ color: "#374151", fontSize: 14, lineHeight: "20px", margin: "16px 0 24px" })}">${renderRichText(resolveVariables(props.description, context))}</div>`
    : "";
  const note = props.note
    ? `<div style="${styleToString({ color: "#6b7280", fontSize: 12, lineHeight: "16px", fontStyle: "italic", margin: "24px 0 6px", textAlign: "center" })}">${renderRichText(resolveVariables(props.note, context))}</div>`
    : "";
  const note2 = props.note2
    ? `<div style="${styleToString({ color: "#6b7280", fontSize: 12, lineHeight: "16px", margin: 0, textAlign: "center" })}">${renderRichText(resolveVariables(props.note2, context))}</div>`
    : "";
  const card = `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:500px;margin:0 auto;"><tbody><tr><td style="${styleToString({ backgroundColor: "#ffffff", border: "1px solid #d1d5db", borderRadius: 12, padding: 28, textAlign: "left", color: "#4b5563" })}">${eyebrow}${price}${description}${pricingRichList(props.bullets || [], context, { color: "#6b7280", fontSize: 14, lineHeight: "24px", margin: "0 0 32px", paddingLeft: 14 })}${pricingButton(props.ctaLabel, props.ctaHref, accent, "#ffffff", { radius: 8, padding: "14px", fontWeight: 700, fontSize: 16, lineHeight: "24px" }, context)}<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0 0" />${note}${note2}</td></tr></tbody></table>`;
  return section({ ...blockSpacing(props), ...bgStyle(props) }, card);
};

const renderPricingTwoTiers = (
  props: PricingProps,
  context: EmailContext,
  palette: EmailPalette,
): string => {
  const plans = props.plans || [];
  const fallbackWidth = plans.length > 0 ? 100 / plans.length : 100;
  const cells = plans
    .map((plan, i) => {
      const isLast = i === plans.length - 1;
      const hl = plan.highlighted === true;
      const accent = hl ? "#7c86ff" : props.accentColor || "#4f46e5";
      const width = String(Math.round(fallbackWidth * 100) / 100);
      const card = `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td style="${styleToString({ backgroundColor: hl ? "#101828" : "#ffffff", border: `1px solid ${hl ? "#101828" : "#d1d5db"}`, borderRadius: 8, padding: 24, textAlign: "left", color: hl ? "#d1d5db" : "#4b5563" })}"><div style="${styleToString({ color: accent, fontSize: 14, fontWeight: 600, lineHeight: "20px", margin: "0 0 16px" })}">${renderRichText(resolveVariables(plan.title, context))}</div><div style="${styleToString({ fontSize: 28, fontWeight: 700, margin: "0 0 8px" })}"><span style="${styleToString({ color: hl ? "#ffffff" : "#101828" })}">${renderRichText(resolveVariables(plan.price, context))}</span> <span style="${styleToString({ fontSize: 14, lineHeight: "20px" })}">${escapeHtml(plan.period || "")}</span></div>${
        plan.description
          ? `<div style="${styleToString({ margin: "12px 0 24px" })}">${renderRichText(resolveVariables(plan.description, context))}</div>`
          : ""
      }${pricingRichList(plan.features || [], context, { fontSize: 12, lineHeight: "20px", margin: "0 0 30px", paddingLeft: 14 })}${pricingButton(plan.ctaLabel, plan.ctaHref, "#4f46e5", "#ffffff", { radius: 8, padding: "12px", fontWeight: 600, fontSize: 14, lineHeight: "20px" }, context)}</td></tr></tbody></table>`;
      return `<td width="${width}%" valign="top" style="width:${width}%;${isLast ? "" : "padding-right:20px;"}">${card}</td>`;
    })
    .join("");
  const header =
    props.heading || props.subtitle
      ? `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td style="text-align:center;padding-bottom:32px;">${
          props.heading
            ? `<div style="${styleToString({ fontSize: 24, lineHeight: "32px", fontWeight: 700, margin: "0 0 12px" })}">${renderRichText(resolveVariables(props.heading, context))}</div>`
            : ""
        }${
          props.subtitle
            ? `<div style="${styleToString({ color: "#6b7280", fontSize: 14, lineHeight: "20px", margin: 0 })}">${renderRichText(resolveVariables(props.subtitle, context))}</div>`
            : ""
        }</td></tr></tbody></table>`
      : "";
  const footer = props.footnote
    ? `<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0 0" /><div style="${styleToString({ color: "#6b7280", fontSize: 12, lineHeight: "16px", fontWeight: 500, margin: "30px 0 0", textAlign: "center" })}">${renderRichText(resolveVariables(props.footnote, context))}</div>`
    : "";
  const cards = `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr>${cells}</tr></tbody></table>`;
  return section(
    { ...blockSpacing(props), ...bgStyle(props) },
    header + cards + footer,
  );
};

const renderPricing = (
  props: PricingProps,
  context: EmailContext,
  palette: EmailPalette,
): string => {
  if (props.variant === "offer") {
    return renderPricingOffer(props, context, palette);
  }
  if (props.variant === "two-tiers") {
    return renderPricingTwoTiers(props, context, palette);
  }
  return renderPricingCard(props, context, palette);
};

const renderProduct = (
  props: ProductProps,
  context: EmailContext,
  palette: EmailPalette,
): string => {
  const image = props.imageUrl
    ? `<img src="${escapeHtml(resolveVariables(props.imageUrl, context))}" alt="${escapeHtml(props.name)}" width="360" style="max-width:100%;display:block;border:0;border-radius:8px;margin:0 auto 16px;" />`
    : "";
  const name = `<div style="${styleToString({ color: palette.DARK, fontSize: 22, fontWeight: 700, margin: "0 0 8px" })}">${renderRichText(resolveVariables(props.name, context))}</div>`;
  const desc = props.description
    ? `<div style="${styleToString({ color: palette.INK, fontSize: 14, lineHeight: 1.6, margin: "0 0 12px" })}">${renderRichText(resolveVariables(props.description, context))}</div>`
    : "";
  const price = `<div style="${styleToString({ color: palette.GOLD, fontSize: 20, fontWeight: 700, margin: "0 0 16px" })}">${renderRichText(resolveVariables(props.price, context))}</div>`;
  const cta = props.ctaLabel
    ? `<a href="${escapeHtml(resolveVariables(props.ctaHref, context))}" target="_blank" style="${styleToString({ backgroundColor: palette.GOLD, color: palette.DARK, fontWeight: 700, padding: "12px 24px", borderRadius: 999, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.5px", display: "inline-block", textDecoration: "none" })}">${escapeHtml(resolveVariables(props.ctaLabel, context))}</a>`
    : "";
  return section(
    {
      textAlign: alignMap[props.align || "center"],
      ...blockSpacing(props),
      ...bgStyle(props),
    },
    image + name + desc + price + cta,
  );
};

const renderTestimonial = (
  props: TestimonialProps,
  context: EmailContext,
  palette: EmailPalette,
): string => {
  const avatar = props.avatarUrl
    ? `<img src="${escapeHtml(resolveVariables(props.avatarUrl, context))}" alt="${escapeHtml(props.name)}" width="56" height="56" style="width:56px;height:56px;border-radius:50%;display:block;margin:0 0 12px;border:0;object-fit:cover;" />`
    : "";
  const quote = `<div style="${styleToString({ color: palette.INK, fontStyle: "italic", fontSize: 16, lineHeight: 1.6, margin: 0 })}">\u201C${renderRichText(resolveVariables(props.quote, context))}\u201D</div>`;
  const name = `<div style="${styleToString({ color: props.accentColor || palette.GOLD, fontSize: 14, fontWeight: 700, margin: "12px 0 0" })}">${renderRichText(resolveVariables(props.name, context))}</div>`;
  const role = props.role
    ? `<div style="${styleToString({ color: palette.CREAM_DIM, fontSize: 12, margin: "2px 0 0" })}">${renderRichText(resolveVariables(props.role, context))}</div>`
    : "";
  return section(
    {
      textAlign: alignMap[props.align || "left"],
      ...blockSpacing(props),
      ...bgStyle(props),
    },
    avatar + quote + name + role,
  );
};

const renderFeatures = (
  props: FeaturesProps,
  context: EmailContext,
  palette: EmailPalette,
): string => {
  const cols = props.columns === 3 ? 3 : 2;
  const width = Math.floor(100 / cols);
  const accent = props.accentColor || palette.GOLD;
  const rows = chunkRows(props.features || [], cols)
    .map((row) => {
      const cells = row
        .map(
          (f) =>
            `<td width="${width}%" valign="top" style="width:${width}%;padding:10px 10px 16px 0;"><div style="${styleToString({ color: accent, fontSize: 20, fontWeight: 700, margin: "0 0 6px" })}">${escapeHtml(f.icon || "✓")}</div><div style="${styleToString({ color: palette.DARK, fontSize: 15, fontWeight: 700, margin: "0 0 4px" })}">${renderRichText(resolveVariables(f.title, context))}</div><div style="${styleToString({ color: palette.INK, fontSize: 13, lineHeight: 1.5, margin: 0 })}">${renderRichText(resolveVariables(f.description, context))}</div></td>`,
        )
        .join("");
      return `<tr>${cells}</tr>`;
    })
    .join("");
  return section(
    {
      textAlign: alignMap[props.align || "left"],
      ...blockSpacing(props),
      ...bgStyle(props),
    },
    `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tbody>${rows}</tbody></table>`,
  );
};

const renderAvatar = (
  props: AvatarProps,
  context: EmailContext,
  palette: EmailPalette,
): string => {
  const size = props.size || 96;
  const image = props.imageUrl
    ? `<img src="${escapeHtml(resolveVariables(props.imageUrl, context))}" alt="${escapeHtml(props.name)}" width="${size}" height="${size}" style="width:${size}px;height:${size}px;border-radius:50%;display:inline-block;border:0;object-fit:cover;" />`
    : `<div style="${styleToString({ width: size, height: size, borderRadius: "50%", backgroundColor: palette.CREAM_DIM, display: "inline-block" })}"></div>`;
  const name = `<div style="${styleToString({ color: palette.DARK, fontSize: 16, fontWeight: 700, margin: "12px 0 0" })}">${renderRichText(resolveVariables(props.name, context))}</div>`;
  const role = props.role
    ? `<div style="${styleToString({ color: palette.CREAM_DIM, fontSize: 13, margin: "2px 0 0" })}">${renderRichText(resolveVariables(props.role, context))}</div>`
    : "";
  return section(
    {
      textAlign: alignMap[props.align || "center"],
      ...blockSpacing(props),
      ...bgStyle(props),
    },
    image + name + role,
  );
};

const renderCode = (props: CodeProps): string =>
  section(
    { ...blockSpacing(props) },
    `<pre style="${styleToString({ backgroundColor: props.backgroundColor || DEFAULT_PALETTE.DARK, color: props.color || "#f5f1e8", padding: 16, borderRadius: 8, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", fontSize: 13, lineHeight: 1.5, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" })}">${escapeHtml(props.code || "")}</pre>`,
  );

const renderLink = (
  props: LinkProps,
  context: EmailContext,
  palette: EmailPalette,
): string =>
  section(
    {
      textAlign: alignMap[props.align || "left"],
      ...blockSpacing(props),
      ...bgStyle(props),
    },
    `<a href="${escapeHtml(resolveVariables(props.href, context))}" target="_blank" style="${styleToString({ color: props.color || palette.GOLD, fontSize: 15, fontWeight: 600, textDecoration: "underline" })}">${escapeHtml(resolveVariables(props.label, context))}</a>`,
  );

/** Tabla de columnas (celdas con ancho y gutter) compartida por grid/footer. */
const renderColumnsTable = (
  columns: ColumnDef[],
  gutter: number,
  context: EmailContext,
  palette: EmailPalette,
): string => {
  const fallbackWidth = columns.length > 0 ? 100 / columns.length : 100;
  const cells = columns
    .map((col, i) => {
      const isLast = i === columns.length - 1;
      const width = String(
        Math.round((col.width ?? fallbackWidth) * 100) / 100,
      );
      const inner = (col.blocks || [])
        .map((child) => renderBlock(child, context, palette))
        .join("");
      return `<td width="${width}%" valign="top" style="width:${width}%;${
        isLast ? "" : `padding-right:${gutter}px;`
      }"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr><td>${inner}</td></tr></tbody></table></td>`;
    })
    .join("");
  return `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tbody><tr>${cells}</tr></tbody></table>`;
};

const renderGrid = (
  props: GridProps,
  context: EmailContext,
  palette: EmailPalette,
): string =>
  section(
    {
      ...blockSpacing(props),
      ...bgStyle(props),
    },
    renderColumnsTable(props.columns || [], props.gap ?? 0, context, palette),
  );

/** Renderers built-in por tipo — se registran en el registry al importar. */
const BUILTIN_RENDERERS: Record<
  EmailBlockType,
  (props: never, context: EmailContext, palette: EmailPalette) => string
> = {
  header: renderHeader,
  hero: renderHero,
  heading: renderHeading,
  text: renderText,
  list: renderList,
  button: renderButton,
  image: renderImage,
  quote: renderQuote,
  columns: renderColumns,
  container: renderContainer,
  grid: renderGrid,
  divider: renderDivider as never,
  spacer: renderSpacer as never,
  footer: renderFooter,
  social: renderSocial,
  gallery: renderGallery,
  stats: renderStats,
  pricing: renderPricing,
  product: renderProduct,
  testimonial: renderTestimonial,
  features: renderFeatures,
  avatar: renderAvatar,
  code: renderCode,
  link: renderLink,
};

for (const definition of DEFAULT_BLOCK_LIBRARY) {
  const renderer = BUILTIN_RENDERERS[definition.type];
  registerBlock({
    definition,
    renderHtml: ({ props, context, palette }) =>
      (renderer as (
        p: unknown,
        c: EmailContext,
        a: EmailPalette,
      ) => string)(props, context, palette),
  });
}

const renderBlock = (
  block: EmailBlock,
  context: EmailContext,
  palette: EmailPalette,
): string => {
  const renderHtml = getBlockRenderHtml(block.type);
  if (!renderHtml) return "";
  return renderHtml({ props: block.props, context, palette });
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
