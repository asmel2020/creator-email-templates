import * as React from "react";
void React;
import {
  Html,
  Head,
  Body,
  Preview,
  Container,
  Section,
  Text,
  Button,
  Img,
  Row,
  Column,
  Hr,
  Link,
} from "@react-email/components"
import type {
  EmailBlock,
  EmailBlockProps,
  EmailContext,
  EmailPalette,
  HeaderProps,
  HeroProps,
  HeadingProps,
  TextProps,
  ListProps,
  ButtonProps,
  ImageProps,
  QuoteProps,
  ColumnsProps,
  ColumnDef,
  ContainerProps,
  GridProps,
  DividerProps,
  SpacerProps,
  FooterProps,
  SocialProps,
  GalleryProps,
  StatsProps,
  PricingProps,
  CheckoutProps,
  ProductItem,
  ProductProps,
  TestimonialProps,
  FeaturesProps,
  AvatarProps,
  CodeProps,
  LinkProps,
  DownloadsProps,
  EmailFileAttachment,
} from "./types"
import { DEFAULT_PALETTE } from "./default-blocks"
import { resolveVariables } from "./variables"
import { FILE_KIND_LABELS, fileKind, formatBytes } from "./types"
import { isSafeFileUrl, renderRichText } from "./richtext"
import { getBlockView, type BlockPreviewProps } from "../block-views"

export const alignMap = {
  left: "left",
  center: "center",
  right: "right",
} as const

export { alignMap as blockAlignMap }

export const blockPadding = (props: EmailBlockProps): React.CSSProperties => {
  const layout = props as EmailBlockProps & {
    paddingTop?: number
    paddingRight?: number
    paddingBottom?: number
    paddingLeft?: number
  }
  const py = "paddingY" in layout ? layout.paddingY : undefined
  const px = "paddingX" in layout ? layout.paddingX : undefined
  const { paddingTop, paddingRight, paddingBottom, paddingLeft } = layout
  if (
    paddingTop === undefined &&
    paddingRight === undefined &&
    paddingBottom === undefined &&
    paddingLeft === undefined
  ) {
    return { padding: `${py ?? 0}px ${px ?? 0}px` }
  }
  return {
    paddingTop: paddingTop ?? py ?? 0,
    paddingRight: paddingRight ?? px ?? 0,
    paddingBottom: paddingBottom ?? py ?? 0,
    paddingLeft: paddingLeft ?? px ?? 0,
  }
}

/** Padding por lado + márgenes externos (paridad con el render HTML). */
export const blockSpacing = (props: EmailBlockProps): React.CSSProperties => {
  const layout = props as EmailBlockProps & {
    marginTop?: number
    marginBottom?: number
  }
  return {
    ...blockPadding(props),
    ...(layout.marginTop !== undefined ? { marginTop: layout.marginTop } : {}),
    ...(layout.marginBottom !== undefined
      ? { marginBottom: layout.marginBottom }
      : {}),
  }
}

const BlockHeader = ({
  props,
  context,
  palette,
}: {
  props: HeaderProps
  context: EmailContext
  palette: EmailPalette
}) => (
  <Section
    style={{
      backgroundColor: props.backgroundColor || palette.DARK,
      textAlign: alignMap[props.align || "center"],
      ...blockSpacing(props),
    }}
  >
    {props.logoUrl ? (
      <Img
        src={resolveVariables(props.logoUrl, context)}
        alt={props.brandName}
        width={140}
        style={{ display: "inline-block" }}
      />
    ) : (
      <div
        style={{
          color: palette.GOLD,
          fontSize: 20,
          fontWeight: 700,
          letterSpacing: "1px",
          margin: 0,
        }}
        dangerouslySetInnerHTML={{
          __html: renderRichText(resolveVariables(props.brandName, context)),
        }}
      />
    )}
    {props.tagline ? (
      <div
        style={{
          color: palette.CREAM_DIM,
          fontSize: 11,
          margin: "6px 0 0",
          textTransform: "uppercase",
          letterSpacing: "1.5px",
        }}
        dangerouslySetInnerHTML={{
          __html: renderRichText(resolveVariables(props.tagline, context)),
        }}
      />
    ) : null}
  </Section>
)

const BlockHero = ({
  props,
  context,
  palette,
}: {
  props: HeroProps
  context: EmailContext
  palette: EmailPalette
}) => (
  <Section
    style={{
      textAlign: alignMap[props.align || "center"],
      ...blockSpacing(props),
      ...(props.backgroundColor
        ? { backgroundColor: props.backgroundColor }
        : {}),
    }}
  >
    {props.imageUrl ? (
      <Img
        src={resolveVariables(props.imageUrl, context)}
        alt=""
        width={480}
        style={{ maxWidth: "100%", margin: "0 auto 24px", display: "block" }}
      />
    ) : null}
    <div
      style={{
        color: palette.DARK,
        fontSize: 32,
        lineHeight: 1.2,
        margin: "0 0 12px",
        fontWeight: 700,
      }}
      dangerouslySetInnerHTML={{
        __html: renderRichText(resolveVariables(props.title, context)),
      }}
    />
    {props.subtitle ? (
      <div
        style={{ color: palette.INK, fontSize: 16, lineHeight: 1.6, margin: 0 }}
        dangerouslySetInnerHTML={{
          __html: renderRichText(resolveVariables(props.subtitle, context)),
        }}
      />
    ) : null}
  </Section>
)

const BlockHeading = ({
  props,
  context,
  palette,
}: {
  props: HeadingProps
  context: EmailContext
  palette: EmailPalette
}) => (
  <Section
    style={{
      textAlign: alignMap[props.align || "left"],
      ...blockSpacing(props),
      ...(props.backgroundColor
        ? { backgroundColor: props.backgroundColor }
        : {}),
    }}
  >
    <div
      style={{
        color: props.color || palette.DARK,
        fontSize: props.size ?? 22,
        lineHeight: 1.3,
        margin: 0,
        fontWeight: 700,
      }}
      dangerouslySetInnerHTML={{
        __html: renderRichText(resolveVariables(props.text, context)),
      }}
    />
  </Section>
)

const BlockText = ({
  props,
  context,
  palette,
}: {
  props: TextProps
  context: EmailContext
  palette: EmailPalette
}) => (
  <Section
    style={{
      textAlign: alignMap[props.align || "left"],
      ...blockSpacing(props),
      ...(props.backgroundColor
        ? { backgroundColor: props.backgroundColor }
        : {}),
    }}
  >
    <div
      style={{
        color: props.color || palette.INK,
        fontSize: props.size || 15,
        lineHeight: 1.6,
        margin: 0,
      }}
      dangerouslySetInnerHTML={{
        __html: renderRichText(resolveVariables(props.text, context)),
      }}
    />
  </Section>
)

/** Badge circular con el número del paso (24px, como react.email). */
const ListBadge = ({ label, accent }: { label: string; accent: string }) => (
  <table
    role="presentation"
    border={0}
    cellPadding={0}
    cellSpacing={0}
    style={{ borderCollapse: "collapse" }}
  >
    <tbody>
      <tr>
        <td
          width={24}
          height={24}
          align="center"
          valign="middle"
          style={{
            width: 24,
            height: 24,
            borderRadius: 9999,
            backgroundColor: accent,
            color: "#ffffff",
            fontSize: 12,
            fontWeight: 600,
            lineHeight: 1,
            textAlign: "center",
          }}
        >
          {label}
        </td>
      </tr>
    </tbody>
  </table>
)

const ListEntryRow = ({
  entry,
  index,
  context,
  palette,
  accent,
  radius,
  imageHeight,
  withImage,
  marginBottom,
}: {
  entry: { number?: string; title: string; description?: string; image?: string; href?: string; linkLabel?: string }
  index: number
  context: EmailContext
  palette: EmailPalette
  accent: string
  radius: number
  imageHeight: number
  withImage: boolean
  marginBottom: number
}) => {
  const badge = (
    <ListBadge
      label={entry.number && entry.number.trim() !== "" ? entry.number : String(index + 1)}
      accent={accent}
    />
  )
  const title = (
    <div style={{ color: palette.DARK, fontSize: 18, fontWeight: 700, lineHeight: 1.4, margin: "0 0 4px" }}>
      {entry.title}
    </div>
  )
  const description = entry.description ? (
    <div style={{ color: palette.INK, fontSize: 13, lineHeight: 1.5, margin: 0 }}>
      {entry.description}
    </div>
  ) : null
  const link = entry.href ? (
    <Link
      href={resolveVariables(entry.href, context)}
      style={{ color: accent, fontSize: 14, fontWeight: 600, textDecoration: "none", display: "block", marginTop: 12 }}
    >
      {entry.linkLabel || "Aprender más →"}
    </Link>
  ) : null

  if (!withImage) {
    return (
      <Row style={{ marginBottom }}>
        <Column width={24} style={{ width: 24, verticalAlign: "top", paddingRight: 18 }}>
          {badge}
        </Column>
        <Column style={{ verticalAlign: "top" }}>
          {title}
          {description}
          {link}
        </Column>
      </Row>
    )
  }
  return (
    <Row style={{ marginBottom }}>
      <Column width="40%" style={{ width: "40%", verticalAlign: "top", paddingRight: 24 }}>
        {entry.image ? (
          <Img
            src={resolveVariables(entry.image, context)}
            alt={entry.title}
            width="100%"
            height={imageHeight}
            style={{
              width: "100%",
              display: "block",
              borderRadius: radius,
              height: imageHeight,
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        ) : (
          <Text style={{ color: palette.CREAM_DIM, fontSize: 12, margin: 0 }}>(Imagen)</Text>
        )}
      </Column>
      <Column width="60%" style={{ width: "60%", verticalAlign: "top", paddingRight: 24 }}>
        {title}
        {description}
        {link}
      </Column>
    </Row>
  )
}

const BlockList = ({
  props,
  context,
  palette,
}: {
  props: ListProps
  context: EmailContext
  palette: EmailPalette
}) => {
  const accent = props.accentColor || palette.GOLD
  const entries = props.entries || []
  return (
    <Section
      style={{
        ...blockSpacing(props),
        ...(props.backgroundColor
          ? { backgroundColor: props.backgroundColor }
          : {}),
      }}
    >
      {props.variant === "numbered" || props.variant === "with-image"
        ? entries.map((entry, i) => (
            <ListEntryRow
              key={entry.id}
              entry={entry}
              index={i}
              context={context}
              palette={palette}
              accent={accent}
              radius={props.radius ?? 4}
              imageHeight={props.imageHeight ?? 168}
              withImage={props.variant === "with-image"}
              marginBottom={i === entries.length - 1 ? 0 : props.gap ?? 24}
            />
          ))
        : props.items.map((item, i) => (
            <Row key={i} style={{ marginBottom: props.gap ?? 8 }}>
              <Column width={24} style={{ verticalAlign: "top" }}>
                <Text
                  style={{
                    color: palette.GOLD,
                    fontWeight: 700,
                    margin: 0,
                    fontSize: 14,
                  }}
                >
                  {props.icon || "✓"}
                </Text>
              </Column>
              <Column style={{ verticalAlign: "top" }}>
                <div
                  style={{
                    color: palette.INK,
                    fontSize: 14,
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                  dangerouslySetInnerHTML={{
                    __html: renderRichText(resolveVariables(item, context)),
                  }}
                />
              </Column>
            </Row>
          ))}
    </Section>
  )
}

const BlockButton = ({
  props,
  context,
  palette,
}: {
  props: ButtonProps
  context: EmailContext
  palette: EmailPalette
}) => (
  <Section
    style={{
      textAlign: alignMap[props.align || "center"],
      ...blockSpacing(props),
      ...(props.blockBackgroundColor
        ? { backgroundColor: props.blockBackgroundColor }
        : {}),
    }}
  >
    <Button
      href={resolveVariables(props.href, context)}
      style={{
        backgroundColor: props.backgroundColor || palette.GOLD,
        color: props.color || palette.DARK,
        fontWeight: 700,
        padding: "14px 28px",
        borderRadius: 999,
        fontSize: 14,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      }}
    >
      {resolveVariables(props.label, context)}
    </Button>
  </Section>
)

const BlockImage = ({
  props,
  context,
  palette,
}: {
  props: ImageProps
  context: EmailContext
  palette: EmailPalette
}) => (
  <Section
    style={{
      textAlign: alignMap[props.align || "center"],
      ...blockSpacing(props),
      ...(props.backgroundColor
        ? { backgroundColor: props.backgroundColor }
        : {}),
    }}
  >
    {props.src ? (
      props.href ? (
        <Link
          href={resolveVariables(props.href, context)}
          target="_blank"
          rel="noopener"
        >
          <Img
            src={resolveVariables(props.src, context)}
            alt={props.alt || ""}
            width={props.width || 480}
            style={{ maxWidth: "100%", display: "inline-block" }}
          />
        </Link>
      ) : (
        <Img
          src={resolveVariables(props.src, context)}
          alt={props.alt || ""}
          width={props.width || 480}
          style={{ maxWidth: "100%", display: "inline-block" }}
        />
      )
    ) : (
      <Text style={{ color: palette.CREAM_DIM, fontSize: 12, margin: 0 }}>
        (Selecciona una imagen)
      </Text>
    )}
  </Section>
)

const BlockQuote = ({
  props,
  context,
  palette,
}: {
  props: QuoteProps
  context: EmailContext
  palette: EmailPalette
}) => (
  <Section
    style={{
      borderLeft: `${props.borderWidth ?? 3}px solid ${props.borderColor || palette.GOLD}`,
      ...blockSpacing(props),
      paddingLeft: (props.paddingX ?? 32) + 16,
      ...(props.marginLeft ? { marginLeft: `${props.marginLeft}px` } : {}),
      ...(props.backgroundColor
        ? { backgroundColor: props.backgroundColor }
        : {}),
    }}
  >
    <div
      style={{
        color: palette.INK,
        fontStyle: "italic",
        fontSize: 15,
        lineHeight: 1.6,
        margin: 0,
      }}
      dangerouslySetInnerHTML={{
        __html: `\u201C${renderRichText(resolveVariables(props.text, context))}\u201D`,
      }}
    />
    {props.author ? (
      <div
        style={{ color: palette.CREAM_DIM, fontSize: 12, margin: "8px 0 0" }}
        dangerouslySetInnerHTML={{
          __html: `\u2014 ${renderRichText(resolveVariables(props.author, context))}`,
        }}
      />
    ) : null}
  </Section>
)

const BlockColumns = ({
  props,
  context,
  palette,
}: {
  props: ColumnsProps
  context: EmailContext
  palette: EmailPalette
}) => (
  <Section
    style={{
      ...blockSpacing(props),
      ...(props.backgroundColor
        ? { backgroundColor: props.backgroundColor }
        : {}),
    }}
  >
    <Row>
      {(props.columns as ColumnDef[]).map((col) => (
        <Column
          key={col.id}
          style={{ width: "50%", verticalAlign: "top", paddingRight: props.gap ?? 8 }}
        >
          {(col.blocks ?? []).map((child) => (
            <BlockRenderer
              key={child.id}
              block={child}
              context={context}
              palette={palette}
            />
          ))}
        </Column>
      ))}
    </Row>
  </Section>
)

const BlockContainer = ({
  props,
  context,
  palette,
}: {
  props: ContainerProps
  context: EmailContext
  palette: EmailPalette
}) => (
  <Section
    style={{
      ...blockSpacing(props),
      ...(props.backgroundColor
        ? { backgroundColor: props.backgroundColor }
        : {}),
    }}
  >
    {(props.blocks ?? []).map((child) => (
      <BlockRenderer
        key={child.id}
        block={child}
        context={context}
        palette={palette}
      />
    ))}
  </Section>
)

const ColumnsPreview = ({
  columns,
  gap,
  context,
  palette,
}: {
  columns: ColumnDef[]
  gap: number
  context: EmailContext
  palette: EmailPalette
}) => {
  const fallback = columns.length > 0 ? 100 / columns.length : 100
  return (
    <Row cellSpacing={gap}>
      {columns.map((col) => (
        <Column
          key={col.id}
          style={{ width: `${col.width ?? fallback}%`, verticalAlign: "top" }}
        >
          {(col.blocks ?? []).map((child) => (
            <BlockRenderer
              key={child.id}
              block={child}
              context={context}
              palette={palette}
            />
          ))}
        </Column>
      ))}
    </Row>
  )
}

const BlockGrid = ({
  props,
  context,
  palette,
}: {
  props: GridProps
  context: EmailContext
  palette: EmailPalette
}) => (
  <Section
    style={{
      ...blockSpacing(props),
      ...(props.backgroundColor
        ? { backgroundColor: props.backgroundColor }
        : {}),
    }}
  >
    <ColumnsPreview
      columns={(props.columns as ColumnDef[]) || []}
      gap={props.gap ?? 0}
      context={context}
      palette={palette}
    />
  </Section>
)

const BlockDivider = ({ props }: { props: DividerProps }) => (
  <Section
    style={{
      ...blockSpacing(props),
      ...(props.height !== undefined
        ? { padding: `${props.height}px ${props.paddingX ?? 32}px` }
        : {}),
      ...(props.backgroundColor
        ? { backgroundColor: props.backgroundColor }
        : {}),
    }}
  >
    <Hr style={{ borderColor: props.color || "#e3dccb", margin: 0 }} />
  </Section>
)

const BlockSpacer = ({ props }: { props: SpacerProps }) => (
  <Section
    style={{
      height: props.height || 24,
      ...(props.backgroundColor
        ? { backgroundColor: props.backgroundColor }
        : {}),
    }}
  />
)

const BlockFooter = ({
  props,
  context,
  palette,
}: {
  props: FooterProps
  context: EmailContext
  palette: EmailPalette
}) => {
  // Variantes con columnas (footer 2 / 3): bloques anidados editables.
  if (props.variant && props.variant !== "classic") {
    return (
      <Section
        style={{
          textAlign: props.align || "left",
          ...blockSpacing(props),
          ...(props.backgroundColor
            ? { backgroundColor: props.backgroundColor }
            : {}),
        }}
      >
        <ColumnsPreview
          columns={(props.columns as ColumnDef[]) || []}
          gap={props.gap ?? 12}
          context={context}
          palette={palette}
        />
      </Section>
    )
  }

  // Variante clásica (footer 1): barra oscura con text/brandName.
  return (
    <Section
      style={{
        backgroundColor: props.backgroundColor || palette.DARK,
        padding: "24px 32px",
        textAlign: "center",
      }}
    >
      <Text
        style={{
          color: "#f5f1e8",
          fontSize: 12,
          lineHeight: 1.6,
          margin: "0 0 12px",
        }}
      >
        {props.text
          ? resolveVariables(props.text, context)
          : "Recibes este correo por estar registrado en nuestra plataforma."}
      </Text>
      {props.brandName ? (
        <div
          style={{
            color: palette.GOLD,
            fontSize: 11,
            letterSpacing: "1px",
            margin: "12px 0 0",
          }}
          dangerouslySetInnerHTML={{
            __html: renderRichText(resolveVariables(props.brandName, context)),
          }}
        />
      ) : null}
    </Section>
  )
}

const withPreviewProps = <P,>(
  Comp: React.ComponentType<P>,
): React.ComponentType<BlockPreviewProps> => {
  const C = Comp as React.ComponentType<BlockPreviewProps>
  const Wrapped = (p: BlockPreviewProps) => <C {...p} />
  Wrapped.displayName = `Preview(${Comp.displayName || Comp.name || "Block"})`
  return Wrapped
}

const isAssetUrl = (value: string): boolean =>
  /^(https?:)?\/\//.test(value.trim()) || value.trim().startsWith("data:")

const chunk = <T,>(arr: T[], size: number): T[][] => {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

/**
 * Archivos globales del correo (`settings.files`): se suben en Ajustes y el
 * bloque `downloads` los lee de aquí. El contexto los baja por cualquier
 * anidamiento (contenedor/columnas/grid) sin pasarlos por props.
 */
export const EmailFilesContext = React.createContext<EmailFileAttachment[]>([])

const useEmailFiles = (): EmailFileAttachment[] =>
  React.useContext(EmailFilesContext)

const BlockSocial = ({ props, context, palette }: { props: SocialProps; context: EmailContext; palette: EmailPalette }) => {
  const accent = props.accentColor || palette.GOLD
  const logo = props.mode === "logo"
  const size = props.iconSize ?? 32
  const half = (props.gap ?? 6) / 2
  return (
    <Section
      style={{
        textAlign: props.align || "center",
        ...blockSpacing(props),
        ...(props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}),
      }}
    >
      {(props.links || []).map((l) =>
        logo ? (
          <Link
            key={l.id}
            href={resolveVariables(l.href, context)}
            style={{ display: "inline-block", margin: `0 ${half}px`, textDecoration: "none" }}
          >
            {(isAssetUrl(l.icon || ""))
              ? <Img src={resolveVariables(l.icon || "", context)} alt={l.label} width={size} height={size} style={{ display: "inline-block", borderRadius: "50%", width: size, height: size, objectFit: "cover" }} />
              : (
                <span
                  style={{
                    display: "inline-block",
                    width: size,
                    height: size,
                    lineHeight: `${size}px`,
                    textAlign: "center",
                    borderRadius: "50%",
                    backgroundColor: accent,
                    color: palette.DARK,
                    fontSize: Math.round(size * 0.4),
                    fontWeight: 700,
                  }}
                >
                  {(l.icon || l.label).slice(0, 2)}
                </span>
              )}
          </Link>
        ) : (
          <Link
            key={l.id}
            href={resolveVariables(l.href, context)}
            style={{
              color: props.color || palette.INK,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              margin: "0 10px",
              display: "inline-block",
            }}
          >
            {resolveVariables(l.label, context)}
          </Link>
        ),
      )}
    </Section>
  )
}

const GalleryImageEl = ({
  image,
  context,
  palette,
  radius,
  height,
}: {
  image?: { id?: string; src?: string; alt?: string; href?: string }
  context: EmailContext
  palette: EmailPalette
  radius: number
  height: number
}) => {
  const inner =
    !image || !image.src ? (
      <Text style={{ color: palette.CREAM_DIM, fontSize: 12, margin: 0 }}>
        (Imagen)
      </Text>
    ) : (
      <Img
        src={resolveVariables(image.src, context)}
        alt={image.alt || ""}
        width={height > 0 ? "100%" : 240}
        height={height > 0 ? height : undefined}
        style={{
          maxWidth: "100%",
          display: "block",
          borderRadius: radius,
          ...(height > 0 ? { width: "100%", height, objectFit: "cover" as const } : {}),
        }}
      />
    )
  return image?.href ? (
    <Link href={resolveVariables(image.href, context)}>{inner}</Link>
  ) : (
    inner
  )
}

const BlockGallery = ({ props, context, palette }: { props: GalleryProps; context: EmailContext; palette: EmailPalette }) => {
  const images = props.images || []
  const radius = typeof props.radius === "number" ? props.radius : 6
  const height = typeof props.imageHeight === "number" ? props.imageHeight : 0
  const half = (props.gap ?? 12) / 2
  const img = (image: (typeof images)[number] | undefined) => (
    <GalleryImageEl image={image} context={context} palette={palette} radius={radius} height={height} />
  )
  const cell = (extra: React.CSSProperties) => ({
    ...extra,
    verticalAlign: "top" as const,
  })

  let content: React.ReactNode
  switch (props.variant) {
    case "three-columns": {
      const width = `${Math.round((100 / 3) * 100) / 100}%`
      content = (
        <Row>
          {[0, 1, 2].map((i) => (
            <Column
              key={i}
              style={cell({
                width,
                ...(i === 0
                  ? { paddingRight: half }
                  : i === 2
                    ? { paddingLeft: half }
                    : { paddingLeft: half, paddingRight: half }),
              })}
            >
              {img(images[i])}
            </Column>
          ))}
        </Row>
      )
      break
    }
    case "horizontal": {
      const tall = height > 0 ? height * 2 + half * 2 : 0
      content = (
        <Row>
          <Column style={cell({ width: "50%", paddingRight: half })}>
            <div style={{ paddingBottom: half }}>{img(images[0])}</div>
            <div style={{ paddingTop: half }}>{img(images[1])}</div>
          </Column>
          <Column
            style={cell({
              width: "50%",
              paddingLeft: half,
              paddingTop: half,
              paddingBottom: half,
            })}
          >
            <GalleryImageEl
              image={images[2]}
              context={context}
              palette={palette}
              radius={radius}
              height={tall}
            />
          </Column>
        </Row>
      )
      break
    }
    case "vertical": {
      content = (
        <>
          <div style={{ paddingBottom: half }}>{img(images[0])}</div>
          <Row>
            <Column style={cell({ width: "50%", paddingTop: half, paddingRight: half })}>
              {img(images[1])}
            </Column>
            <Column style={cell({ width: "50%", paddingTop: half, paddingLeft: half })}>
              {img(images[2])}
            </Column>
          </Row>
        </>
      )
      break
    }
    default: {
      const cols = props.columns === 3 ? 3 : 2
      const width = `${Math.floor(100 / cols)}%`
      content = chunk(images, cols).map((row, ri) => (
        <Row key={ri}>
          {row.map((image) => (
            <Column key={image.id} style={cell({ width, padding: half })}>
              {img(image)}
            </Column>
          ))}
        </Row>
      ))
    }
  }

  return (
    <Section
      style={{
        ...blockSpacing(props),
        ...(props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}),
      }}
    >
      {content}
    </Section>
  )
}

const BlockStats = ({ props, context, palette }: { props: StatsProps; context: EmailContext; palette: EmailPalette }) => (
  <Section
    style={{
      textAlign: props.align || "center",
      ...blockSpacing(props),
      ...(props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}),
    }}
  >
    <Row>
      {(props.stats || []).map((s) => (
        <Column key={s.id} style={{ padding: 8, verticalAlign: "top" }}>
          <Text
            style={{
              color: props.accentColor || palette.GOLD,
              fontSize: 28,
              fontWeight: 700,
              lineHeight: 1.1,
              margin: 0,
            }}
          >
            {resolveVariables(s.value, context)}
          </Text>
          <Text style={{ color: palette.INK, fontSize: 12, margin: "6px 0 0" }}>
            {resolveVariables(s.label, context)}
          </Text>
        </Column>
      ))}
    </Row>
  </Section>
)

const PricingWideButton = ({
  label,
  href,
  background,
  color,
  radius,
  padding,
  fontSize,
  fontWeight,
  context,
}: {
  label?: string
  href?: string
  background: string
  color: string
  radius: number
  padding: string
  fontSize: number
  fontWeight: number
  context: EmailContext
}) =>
  label ? (
    <Button
      href={resolveVariables(href || "", context)}
      style={{
        backgroundColor: background,
        color,
        borderRadius: radius,
        boxSizing: "border-box",
        display: "block",
        fontSize,
        fontWeight,
        letterSpacing: "0.025em",
        padding,
        textAlign: "center",
        textDecoration: "none",
        width: "100%",
      }}
    >
      {resolveVariables(label, context)}
    </Button>
  ) : null

const BlockPricingOffer = ({
  props,
  context,
}: {
  props: PricingProps
  context: EmailContext
}) => {
  const accent = props.accentColor || "#4f46e5"
  return (
    <Section
      style={{
        ...blockSpacing(props),
        ...(props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}),
      }}
    >
      <Section
        style={{
          maxWidth: 500,
          margin: "0 auto",
          backgroundColor: "#ffffff",
          border: "1px solid #d1d5db",
          borderRadius: 12,
          padding: 28,
          textAlign: "left",
          color: "#4b5563",
        }}
      >
        {props.eyebrow ? (
          <Text style={{ color: accent, fontSize: 12, fontWeight: 600, letterSpacing: "0.025em", lineHeight: "20px", textTransform: "uppercase", margin: "0 0 16px" }}>
            {resolveVariables(props.eyebrow, context)}
          </Text>
        ) : null}
        <Text style={{ fontSize: 30, fontWeight: 700, lineHeight: "36px", margin: "0 0 12px" }}>
          <span style={{ color: "#101828" }}>{resolveVariables(props.price, context)}</span>{" "}
          <span style={{ fontSize: 16, fontWeight: 500, lineHeight: "20px" }}>{props.period}</span>
        </Text>
        {props.description ? (
          <Text style={{ color: "#374151", fontSize: 14, lineHeight: "20px", margin: "16px 0 24px" }}>
            {resolveVariables(props.description, context)}
          </Text>
        ) : null}
        <ul style={{ color: "#6b7280", fontSize: 14, lineHeight: "24px", margin: "0 0 32px", paddingLeft: 14 }}>
          {(props.bullets || []).map((b, i) => (
            <li key={i} style={{ marginBottom: 12 }}>{resolveVariables(b, context)}</li>
          ))}
        </ul>
        <PricingWideButton
          label={props.ctaLabel}
          href={props.ctaHref}
          background={accent}
          color="#ffffff"
          radius={8}
          padding="14px"
          fontSize={16}
          fontWeight={700}
          context={context}
        />
        <Hr style={{ borderColor: "#e5e7eb", margin: "24px 0 0" }} />
        {props.note ? (
          <Text style={{ color: "#6b7280", fontSize: 12, lineHeight: "16px", fontStyle: "italic", margin: "24px 0 6px", textAlign: "center" }}>
            {resolveVariables(props.note, context)}
          </Text>
        ) : null}
        {props.note2 ? (
          <Text style={{ color: "#6b7280", fontSize: 12, lineHeight: "16px", margin: 0, textAlign: "center" }}>
            {resolveVariables(props.note2, context)}
          </Text>
        ) : null}
      </Section>
    </Section>
  )
}

const BlockPricingTwoTiers = ({
  props,
  context,
  palette,
}: {
  props: PricingProps
  context: EmailContext
  palette: EmailPalette
}) => {
  const plans = props.plans || []
  const width = `${Math.round((100 / (plans.length || 1)) * 100) / 100}%`
  return (
    <Section
      style={{
        ...blockSpacing(props),
        ...(props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}),
      }}
    >
      {props.heading || props.subtitle ? (
        <Section style={{ textAlign: "center", paddingBottom: 32 }}>
          {props.heading ? (
            <Text style={{ fontSize: 24, lineHeight: "32px", fontWeight: 700, margin: "0 0 12px" }}>
              {resolveVariables(props.heading, context)}
            </Text>
          ) : null}
          {props.subtitle ? (
            <Text style={{ color: "#6b7280", fontSize: 14, lineHeight: "20px", margin: 0 }}>
              {resolveVariables(props.subtitle, context)}
            </Text>
          ) : null}
        </Section>
      ) : null}
      <Row>
        {plans.map((plan, i) => {
          const hl = plan.highlighted === true
          const accent = hl ? "#7c86ff" : props.accentColor || palette.GOLD
          return (
            <Column
              key={plan.id}
              style={{
                width,
                verticalAlign: "top",
                paddingRight: i === plans.length - 1 ? 0 : 20,
              }}
            >
              <Section
                style={{
                  backgroundColor: hl ? "#101828" : "#ffffff",
                  border: `1px solid ${hl ? "#101828" : "#d1d5db"}`,
                  borderRadius: 8,
                  padding: 24,
                  textAlign: "left",
                  color: hl ? "#d1d5db" : "#4b5563",
                }}
              >
                <Text style={{ color: accent, fontSize: 14, fontWeight: 600, lineHeight: "20px", margin: "0 0 16px" }}>
                  {resolveVariables(plan.title, context)}
                </Text>
                <Text style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px" }}>
                  <span style={{ color: hl ? "#ffffff" : "#101828" }}>{resolveVariables(plan.price, context)}</span>{" "}
                  <span style={{ fontSize: 14, lineHeight: "20px" }}>{plan.period}</span>
                </Text>
                {plan.description ? (
                  <Text style={{ margin: "12px 0 24px" }}>{resolveVariables(plan.description, context)}</Text>
                ) : null}
                <ul style={{ fontSize: 12, lineHeight: "20px", margin: "0 0 30px", paddingLeft: 14 }}>
                  {(plan.features || []).map((f, fi) => (
                    <li key={fi} style={{ marginBottom: 8 }}>{resolveVariables(f, context)}</li>
                  ))}
                </ul>
                <PricingWideButton
                  label={plan.ctaLabel}
                  href={plan.ctaHref}
                  background="#4f46e5"
                  color="#ffffff"
                  radius={8}
                  padding="12px"
                  fontSize={14}
                  fontWeight={600}
                  context={context}
                />
              </Section>
            </Column>
          )
        })}
      </Row>
      {props.footnote ? (
        <>
          <Hr style={{ borderColor: "#e5e7eb", margin: "24px 0 0" }} />
          <Text style={{ color: "#6b7280", fontSize: 12, lineHeight: "16px", fontWeight: 500, margin: "30px 0 0", textAlign: "center" }}>
            {resolveVariables(props.footnote, context)}
          </Text>
        </>
      ) : null}
    </Section>
  )
}

const BlockPricing = ({ props, context, palette }: { props: PricingProps; context: EmailContext; palette: EmailPalette }) => {
  if (props.variant === "offer") {
    return <BlockPricingOffer props={props} context={context} />
  }
  if (props.variant === "two-tiers") {
    return <BlockPricingTwoTiers props={props} context={context} palette={palette} />
  }
  const accent = props.accentColor || palette.GOLD
  const textColor = props.textColor || palette.INK
  return (
    <Section style={{ ...blockSpacing(props), ...(props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}) }}>
      <Section
        style={{
          maxWidth: 420,
          margin: "0 auto",
          border: "1px solid #e3dccb",
          borderRadius: 10,
          padding: 24,
          textAlign: "center",
        }}
      >
        <Text style={{ color: accent, fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", margin: "0 0 8px" }}>
          {resolveVariables(props.title, context)}
        </Text>
        <Text style={{ color: textColor, fontSize: 36, fontWeight: 700, lineHeight: 1.1, margin: 0 }}>
          {resolveVariables(props.price, context)}
          <span style={{ fontSize: 14, fontWeight: 400, color: palette.CREAM_DIM }}>{props.period}</span>
        </Text>
        <div style={{ margin: "16px 0 0", textAlign: "left" }}>
          {(props.bullets || []).map((b, i) => (
            <Text key={i} style={{ color: textColor, fontSize: 14, lineHeight: 1.6, margin: "0 0 6px" }}>
              <span style={{ color: accent, fontWeight: 700 }}>✓</span> {resolveVariables(b, context)}
            </Text>
          ))}
        </div>
        {props.ctaLabel ? (
          <Button
            href={resolveVariables(props.ctaHref, context)}
            style={{
              backgroundColor: accent,
              color: palette.DARK,
              fontWeight: 700,
              padding: "12px 24px",
              borderRadius: 999,
              fontSize: 14,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginTop: 16,
            }}
          >
            {resolveVariables(props.ctaLabel, context)}
          </Button>
        ) : null}
      </Section>
    </Section>
  )
}

/** Imagen de producto con alto fijo y recorte (o placeholder). */
const ProductImage = ({
  src,
  alt,
  context,
  palette,
  height,
  radius,
}: {
  src?: string
  alt: string
  context: EmailContext
  palette: EmailPalette
  height: number
  radius: number
}) =>
  src ? (
    <Img
      src={resolveVariables(src, context)}
      alt={alt}
      width="100%"
      height={height}
      style={{ width: "100%", display: "block", borderRadius: radius, height, objectFit: "cover" }}
    />
  ) : (
    <Text style={{ color: palette.CREAM_DIM, fontSize: 12, margin: 0 }}>(Imagen)</Text>
  )

/** Botón de los diseños de producto (estilo react.email). */
const ProductButton = ({
  label,
  href,
  context,
  style,
}: {
  label?: string
  href?: string
  context: EmailContext
  style?: React.CSSProperties
}) =>
  label ? (
    <Button
      href={resolveVariables(href || "", context)}
      style={{
        backgroundColor: "#4f46e5",
        color: "#ffffff",
        borderRadius: 8,
        padding: "12px 24px",
        fontSize: 16,
        fontWeight: 600,
        display: "inline-block",
        textAlign: "center",
        ...style,
      }}
    >
      {label}
    </Button>
  ) : null

/** "One product": imagen ancha arriba y el texto centrado debajo. */
const BlockProductHero = ({ props, context, palette }: { props: ProductProps; context: EmailContext; palette: EmailPalette }) => {
  const accent = props.accentColor || palette.GOLD
  const height = props.imageHeight && props.imageHeight > 0 ? props.imageHeight : 320
  const radius = props.radius ?? 12
  return (
    <Section
      style={{
        textAlign: props.align || "center",
        ...blockSpacing(props),
        ...(props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}),
      }}
    >
      <ProductImage src={props.imageUrl} alt={props.name} context={context} palette={palette} height={height} radius={radius} />
      {props.eyebrow ? (
        <Text style={{ color: accent, fontSize: 18, fontWeight: 600, lineHeight: "28px", margin: "16px 0 0" }}>
          {resolveVariables(props.eyebrow, context)}
        </Text>
      ) : null}
      <Text style={{ color: palette.DARK, fontSize: 36, fontWeight: 600, lineHeight: "40px", letterSpacing: 0.4, margin: "8px 0 0" }}>
        {resolveVariables(props.name, context)}
      </Text>
      {props.description ? (
        <Text style={{ color: palette.INK, fontSize: 16, lineHeight: "24px", margin: "8px 0 0" }}>
          {resolveVariables(props.description, context)}
        </Text>
      ) : null}
      {props.price ? (
        <Text style={{ color: palette.DARK, fontSize: 16, fontWeight: 600, lineHeight: "24px", margin: "8px 0 0" }}>
          {resolveVariables(props.price, context)}
        </Text>
      ) : null}
      <ProductButton label={props.ctaLabel} href={props.ctaHref} context={context} style={{ backgroundColor: accent, marginTop: 16 }} />
    </Section>
  )
}

/** Imagen a la izquierda (50%) y ficha del producto a la derecha. */
const BlockProductImageLeft = ({ props, context, palette }: { props: ProductProps; context: EmailContext; palette: EmailPalette }) => {
  const accent = props.accentColor || palette.GOLD
  const height = props.imageHeight && props.imageHeight > 0 ? props.imageHeight : 220
  const radius = props.radius ?? 8
  return (
    <Section
      style={{
        ...blockSpacing(props),
        ...(props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}),
      }}
    >
      <Row>
        <Column width="50%" style={{ width: "50%", verticalAlign: "top", paddingRight: 32, boxSizing: "border-box" }}>
          <ProductImage src={props.imageUrl} alt={props.name} context={context} palette={palette} height={height} radius={radius} />
        </Column>
        <Column width="50%" style={{ width: "50%", verticalAlign: "baseline" }}>
          <Text style={{ color: palette.DARK, fontSize: 20, fontWeight: 600, lineHeight: "28px", margin: "8px 0 0" }}>
            {resolveVariables(props.name, context)}
          </Text>
          {props.description ? (
            <Text style={{ color: palette.INK, fontSize: 16, lineHeight: "24px", margin: "8px 0 0" }}>
              {resolveVariables(props.description, context)}
            </Text>
          ) : null}
          {props.price ? (
            <Text style={{ color: palette.DARK, fontSize: 18, fontWeight: 600, lineHeight: "28px", margin: "8px 0 0" }}>
              {resolveVariables(props.price, context)}
            </Text>
          ) : null}
          <ProductButton
            label={props.ctaLabel}
            href={props.ctaHref}
            context={context}
            style={{ backgroundColor: accent, width: "75%", boxSizing: "border-box", padding: "12px 16px", marginTop: 16 }}
          />
        </Column>
      </Row>
    </Section>
  )
}

/** Filas de tarjetas: encabezado opcional + 2/3/4 tarjetas (4 = 2×2 con Hr). */
const BlockProductGrid = ({ props, context, palette }: { props: ProductProps; context: EmailContext; palette: EmailPalette }) => {
  const items = props.products || []
  const cols = props.columns === 3 ? 3 : props.columns === 4 ? 4 : 2
  const perRow = cols === 4 ? 2 : cols
  const gutter = cols === 3 ? 4 : 8
  const accent = props.accentColor || palette.GOLD
  const radius = props.radius ?? 8
  const height = props.imageHeight && props.imageHeight > 0 ? props.imageHeight : cols === 3 ? 180 : 250
  const card = (item: ProductItem) => (
    <>
      <ProductImage src={item.imageUrl} alt={item.name} context={context} palette={palette} height={height} radius={radius} />
      <Text style={{ color: palette.DARK, fontSize: 20, fontWeight: 600, lineHeight: "28px", margin: "24px 0 0" }}>
        {resolveVariables(item.name, context)}
      </Text>
      {item.description ? (
        <Text style={{ color: palette.INK, fontSize: 16, lineHeight: "24px", margin: "16px 0 0" }}>
          {resolveVariables(item.description, context)}
        </Text>
      ) : null}
      {item.price ? (
        <Text style={{ color: palette.DARK, fontSize: 16, fontWeight: 600, lineHeight: "24px", margin: "8px 0 0" }}>
          {resolveVariables(item.price, context)}
        </Text>
      ) : null}
      <ProductButton label={item.ctaLabel} href={item.ctaHref} context={context} style={{ backgroundColor: accent, marginTop: 16 }} />
    </>
  )
  const rows = chunk(items, perRow)
  return (
    <Section
      style={{
        textAlign: props.align || "left",
        ...blockSpacing(props),
        ...(props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}),
      }}
    >
      {props.heading || props.subheading ? (
        <Section style={{ paddingBottom: 16 }}>
          {props.heading ? (
            <Text style={{ color: palette.DARK, fontSize: 20, fontWeight: 600, lineHeight: "28px", margin: 0 }}>
              {resolveVariables(props.heading, context)}
            </Text>
          ) : null}
          {props.subheading ? (
            <Text style={{ color: palette.INK, fontSize: 16, lineHeight: "24px", margin: "8px 0 0" }}>
              {resolveVariables(props.subheading, context)}
            </Text>
          ) : null}
        </Section>
      ) : null}
      {rows.map((row, ri) => (
        <Section key={ri}>
          <Row>
            {row.map((item, ci) => (
              <Column
                key={item.id}
                width={`${Math.round((100 / perRow) * 100) / 100}%`}
                style={{
                  width: `${Math.round((100 / perRow) * 100) / 100}%`,
                  verticalAlign: "top",
                  paddingTop: 16,
                  paddingBottom: 16,
                  ...(ci === 0 ? {} : { paddingLeft: gutter }),
                  ...(ci === row.length - 1 ? {} : { paddingRight: gutter }),
                }}
              >
                {card(item)}
              </Column>
            ))}
          </Row>
          {ri === 0 && rows.length > 1 ? <Hr style={{ borderColor: "#e5e7eb", margin: "24px 0" }} /> : null}
        </Section>
      ))}
    </Section>
  )
}

/** Resumen de pedido: tabla de líneas + botón de compra full-width. */
const BlockCheckout = ({ props, context, palette }: { props: CheckoutProps; context: EmailContext; palette: EmailPalette }) => {
  const accent = props.accentColor || "#4f46e5"
  const border = props.borderColor || "#e5e7eb"
  const height = props.imageHeight && props.imageHeight > 0 ? props.imageHeight : 110
  const radius = props.radius ?? 8
  const cell: React.CSSProperties = { padding: "8px 0", borderBottom: `1px solid ${border}` }
  const head: React.CSSProperties = { ...cell, color: "#6b7280", fontSize: 14, fontWeight: 600 }
  const lines = props.lines || []
  return (
    <Section
      style={{
        textAlign: props.align || "center",
        ...blockSpacing(props),
        ...(props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}),
      }}
    >
      {props.heading ? (
        <Text style={{ color: palette.DARK, fontSize: 30, fontWeight: 600, lineHeight: "36px", margin: "0 0 16px", textAlign: "center" }}>
          {resolveVariables(props.heading, context)}
        </Text>
      ) : null}
      <Section style={{ border: `1px solid ${border}`, borderRadius: 8, padding: "0 16px 16px" }}>
        <table width="100%" style={{ borderCollapse: "collapse", marginBottom: 16 }}>
          <tbody>
            <tr>
              <th style={cell}>&nbsp;</th>
              <th align="left" style={{ ...head, textAlign: "left" }}>
                Producto
              </th>
              <th align="center" style={{ ...head, textAlign: "center" }}>
                Cantidad
              </th>
              <th align="center" style={{ ...head, textAlign: "center" }}>
                Precio
              </th>
            </tr>
            {lines.map((line) => (
              <tr key={line.id}>
                <td style={cell}>
                  {line.imageUrl ? (
                    <Img
                      src={resolveVariables(line.imageUrl, context)}
                      alt={line.name}
                      height={height}
                      style={{ height, borderRadius: radius, objectFit: "cover", display: "block" }}
                    />
                  ) : (
                    <Text style={{ color: palette.CREAM_DIM, fontSize: 12, margin: 0 }}>(Imagen)</Text>
                  )}
                </td>
                <td align="left" style={cell}>
                  <Text style={{ color: palette.DARK, fontSize: 14, margin: 0 }}>{resolveVariables(line.name, context)}</Text>
                </td>
                <td align="center" style={cell}>
                  <Text style={{ color: palette.DARK, fontSize: 14, margin: 0, textAlign: "center" }}>
                    {resolveVariables(line.quantity || "1", context)}
                  </Text>
                </td>
                <td align="center" style={cell}>
                  <Text style={{ color: palette.DARK, fontSize: 14, margin: 0, textAlign: "center" }}>
                    {resolveVariables(line.price || "", context)}
                  </Text>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <ProductButton
          label={props.ctaLabel}
          href={props.ctaHref}
          context={context}
          style={{ backgroundColor: accent, display: "block", width: "100%", boxSizing: "border-box", padding: "12px" }}
        />
      </Section>
    </Section>
  )
}

const BlockProductCard = ({ props, context, palette }: { props: ProductProps; context: EmailContext; palette: EmailPalette }) => (
  <Section
    style={{
      textAlign: props.align || "center",
      ...blockSpacing(props),
      ...(props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}),
    }}
  >
    {props.imageUrl ? (
      <Img
        src={resolveVariables(props.imageUrl, context)}
        alt={props.name}
        width={360}
        style={{ maxWidth: "100%", borderRadius: 8, display: "block", margin: "0 auto 16px" }}
      />
    ) : null}
    <Text style={{ color: palette.DARK, fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>
      {resolveVariables(props.name, context)}
    </Text>
    {props.description ? (
      <Text style={{ color: palette.INK, fontSize: 14, lineHeight: 1.6, margin: "0 0 12px" }}>
        {resolveVariables(props.description, context)}
      </Text>
    ) : null}
    <Text style={{ color: palette.GOLD, fontSize: 20, fontWeight: 700, margin: "0 0 16px" }}>
      {resolveVariables(props.price, context)}
    </Text>
    {props.ctaLabel ? (
      <Button
        href={resolveVariables(props.ctaHref, context)}
        style={{
          backgroundColor: palette.GOLD,
          color: palette.DARK,
          fontWeight: 700,
          padding: "12px 24px",
          borderRadius: 999,
          fontSize: 14,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {resolveVariables(props.ctaLabel, context)}
      </Button>
    ) : null}
  </Section>
)

const BlockProduct = ({ props, context, palette }: { props: ProductProps; context: EmailContext; palette: EmailPalette }) => {
  if (props.variant === "hero") return <BlockProductHero props={props} context={context} palette={palette} />
  if (props.variant === "image-left") return <BlockProductImageLeft props={props} context={context} palette={palette} />
  if (props.variant === "grid") return <BlockProductGrid props={props} context={context} palette={palette} />
  return <BlockProductCard props={props} context={context} palette={palette} />
}

const BlockTestimonial = ({ props, context, palette }: { props: TestimonialProps; context: EmailContext; palette: EmailPalette }) => (
  <Section
    style={{
      textAlign: props.align || "left",
      ...blockSpacing(props),
      ...(props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}),
    }}
  >
    {props.avatarUrl ? (
      <Img
        src={resolveVariables(props.avatarUrl, context)}
        alt={props.name}
        width={56}
        height={56}
        style={{ borderRadius: "50%", display: "block", margin: "0 0 12px", width: 56, height: 56, objectFit: "cover" }}
      />
    ) : null}
    <Text style={{ color: palette.INK, fontStyle: "italic", fontSize: 16, lineHeight: 1.6, margin: 0 }}>
      {`\u201C${resolveVariables(props.quote, context)}\u201D`}
    </Text>
    <Text style={{ color: props.accentColor || palette.GOLD, fontSize: 14, fontWeight: 700, margin: "12px 0 0" }}>
      {resolveVariables(props.name, context)}
    </Text>
    {props.role ? (
      <Text style={{ color: palette.CREAM_DIM, fontSize: 12, margin: "2px 0 0" }}>
        {resolveVariables(props.role, context)}
      </Text>
    ) : null}
  </Section>
)

const BlockFeatures = ({ props, context, palette }: { props: FeaturesProps; context: EmailContext; palette: EmailPalette }) => {
  const cols = props.columns === 3 ? 3 : 2
  const width = `${Math.floor(100 / cols)}%`
  const accent = props.accentColor || palette.GOLD
  return (
    <Section
      style={{
        textAlign: props.align || "left",
        ...blockSpacing(props),
        ...(props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}),
      }}
    >
      {chunk(props.features || [], cols).map((row, ri) => (
        <Row key={ri}>
          {row.map((f) => (
            <Column key={f.id} style={{ width, padding: "10px 10px 16px 0", verticalAlign: "top" }}>
              <Text style={{ color: accent, fontSize: 20, fontWeight: 700, margin: "0 0 6px" }}>{f.icon || "✓"}</Text>
              <Text style={{ color: palette.DARK, fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>
                {resolveVariables(f.title, context)}
              </Text>
              <Text style={{ color: palette.INK, fontSize: 13, lineHeight: 1.5, margin: 0 }}>
                {resolveVariables(f.description, context)}
              </Text>
            </Column>
          ))}
        </Row>
      ))}
    </Section>
  )
}

const BlockAvatar = ({ props, context, palette }: { props: AvatarProps; context: EmailContext; palette: EmailPalette }) => {
  const size = props.size || 96
  return (
    <Section
      style={{
        textAlign: props.align || "center",
        ...blockSpacing(props),
        ...(props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}),
      }}
    >
      {props.imageUrl ? (
        <Img
          src={resolveVariables(props.imageUrl, context)}
          alt={props.name}
          width={size}
          height={size}
          style={{ borderRadius: "50%", display: "inline-block", width: size, height: size, objectFit: "cover" }}
        />
      ) : null}
      <Text style={{ color: palette.DARK, fontSize: 16, fontWeight: 700, margin: "12px 0 0" }}>
        {resolveVariables(props.name, context)}
      </Text>
      {props.role ? (
        <Text style={{ color: palette.CREAM_DIM, fontSize: 13, margin: "2px 0 0" }}>
          {resolveVariables(props.role, context)}
        </Text>
      ) : null}
    </Section>
  )
}

const BlockCode = ({ props }: { props: CodeProps }) => (
  <Section style={{ ...blockSpacing(props) }}>
    <pre
      style={{
        backgroundColor: props.backgroundColor || "#0d0b08",
        color: props.color || "#f5f1e8",
        padding: 16,
        borderRadius: 8,
        fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        fontSize: 13,
        lineHeight: 1.5,
        margin: 0,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      {props.code}
    </pre>
  </Section>
)

const BlockLink = ({ props, context, palette }: { props: LinkProps; context: EmailContext; palette: EmailPalette }) => (
  <Section
    style={{
      textAlign: props.align || "left",
      ...blockSpacing(props),
      ...(props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}),
    }}
  >
    <Link
      href={resolveVariables(props.href, context)}
      style={{ color: props.color || palette.GOLD, fontSize: 15, fontWeight: 600, textDecoration: "underline" }}
    >
      {resolveVariables(props.label, context)}
    </Link>
  </Section>
)

/** Lista de archivos descargables (los archivos vienen de Ajustes). */
const BlockDownloads = ({ props, context, palette }: { props: DownloadsProps; context: EmailContext; palette: EmailPalette }) => {
  const accent = props.accentColor || palette.GOLD
  const border = props.borderColor || "#e3dccb"
  const label = props.buttonLabel || "Descargar"
  const heading = props.heading || ""
  const subheading = props.subheading || ""
  const emptyText = props.emptyText || ""
  const files = useEmailFiles().filter(
    (file) => file.link !== false && isSafeFileUrl(file.url),
  )
  const cell: React.CSSProperties = {
    padding: "10px 0",
    borderBottom: `1px solid ${border}`,
    verticalAlign: "middle",
  }
  // Misma regla que el render HTML: sin archivos y sin mensaje, no hay bloque.
  if (files.length === 0 && !emptyText) return null
  return (
    <Section
      style={{
        textAlign: props.align || "left",
        ...blockSpacing(props),
        ...(props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}),
      }}
    >
      {heading || subheading ? (
        <Section style={{ marginBottom: 12 }}>
          {heading ? (
            <Text style={{ color: palette.DARK, fontSize: 20, fontWeight: 700, lineHeight: "26px", margin: 0 }}>
              {resolveVariables(heading, context)}
            </Text>
          ) : null}
          {subheading ? (
            <Text style={{ color: palette.CREAM_DIM, fontSize: 14, margin: "6px 0 0" }}>
              {resolveVariables(subheading, context)}
            </Text>
          ) : null}
        </Section>
      ) : null}
      <Section style={{ border: `1px solid ${border}`, borderRadius: props.radius ?? 8, padding: "4px 16px" }}>
        {files.length === 0 ? (
          <Text style={{ color: palette.CREAM_DIM, fontSize: 14, margin: "10px 0" }}>
            {emptyText}
          </Text>
        ) : (
          <table width="100%" style={{ borderCollapse: "collapse" }}>
            <tbody>
              {files.map((file) => {
                const size = props.showSize === false ? "" : formatBytes(file.size)
                return (
                  <tr key={file.id}>
                    {props.showIcon !== false ? (
                      <td width="46" style={cell}>
                        <Text
                          style={{
                            display: "inline-block",
                            minWidth: 38,
                            padding: "3px 6px",
                            borderRadius: 6,
                            backgroundColor: "#f1e8dc",
                            color: accent,
                            fontSize: 11,
                            fontWeight: 700,
                            textAlign: "center",
                            margin: 0,
                          }}
                        >
                          {FILE_KIND_LABELS[fileKind(file.name || file.url, file.mimeType)]}
                        </Text>
                      </td>
                    ) : null}
                    <td style={cell}>
                      <Text style={{ color: palette.DARK, fontSize: 14, fontWeight: 600, margin: 0, wordBreak: "break-word" }}>
                        {file.name || "archivo"}
                      </Text>
                      {size ? (
                        <Text style={{ color: palette.CREAM_DIM, fontSize: 12, margin: "2px 0 0" }}>{size}</Text>
                      ) : null}
                    </td>
                    <td align="right" style={{ ...cell, whiteSpace: "nowrap" }}>
                      <Link
                        href={resolveVariables(file.url, context)}
                        style={{ color: accent, fontSize: 14, fontWeight: 600, textDecoration: "underline" }}
                      >
                        {label}
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </Section>
    </Section>
  )
}

/** Preview components react-email por tipo — alimentan el registry de vistas. */
export const PREVIEW_COMPONENTS: Record<
  string,
  React.ComponentType<BlockPreviewProps>
> = {
  header: withPreviewProps(BlockHeader),
  hero: withPreviewProps(BlockHero),
  heading: withPreviewProps(BlockHeading),
  text: withPreviewProps(BlockText),
  list: withPreviewProps(BlockList),
  button: withPreviewProps(BlockButton),
  image: withPreviewProps(BlockImage),
  quote: withPreviewProps(BlockQuote),
  columns: withPreviewProps(BlockColumns),
  container: withPreviewProps(BlockContainer),
  grid: withPreviewProps(BlockGrid),
  divider: withPreviewProps(BlockDivider as never),
  spacer: withPreviewProps(BlockSpacer as never),
  footer: withPreviewProps(BlockFooter),
  social: withPreviewProps(BlockSocial),
  gallery: withPreviewProps(BlockGallery),
  stats: withPreviewProps(BlockStats),
  pricing: withPreviewProps(BlockPricing),
  product: withPreviewProps(BlockProduct),
  checkout: withPreviewProps(BlockCheckout),
  testimonial: withPreviewProps(BlockTestimonial),
  features: withPreviewProps(BlockFeatures),
  avatar: withPreviewProps(BlockAvatar),
  code: withPreviewProps(BlockCode as never),
  link: withPreviewProps(BlockLink),
  downloads: withPreviewProps(BlockDownloads),
}

export const BlockRenderer = ({
  block,
  context,
  palette = DEFAULT_PALETTE,
}: {
  block: EmailBlock
  context: EmailContext
  palette?: EmailPalette
}) => {
  const Preview = getBlockView(block.type)?.Preview
  if (!Preview) return null
  return <Preview props={block.props} context={context} palette={palette} />
}

export const EmailBody = ({
  blocks,
  context,
  palette = DEFAULT_PALETTE,
  cardBorderWidth = 1,
  cardBorderRadius = 4,
  fontFamily,
  files = [],
}: {
  blocks: EmailBlock[]
  context: EmailContext
  palette?: EmailPalette
  cardBorderWidth?: number
  cardBorderRadius?: number
  fontFamily?: string
  files?: EmailFileAttachment[]
}) => (
  <Container
    style={{
      maxWidth: 600,
      backgroundColor: "#ffffff",
      border: `${cardBorderWidth}px solid #e3dccb`,
      borderRadius: cardBorderRadius,
      margin: "0 auto",
      ...(fontFamily ? { fontFamily } : {}),
    }}
  >
    <EmailFilesContext.Provider value={files}>
      {blocks.map((block) => (
        <BlockRenderer
          key={block.id}
          block={block}
          context={context}
          palette={palette}
        />
      ))}
    </EmailFilesContext.Provider>
  </Container>
)

export const EmailTemplate = ({
  blocks,
  subject,
  context,
  palette = DEFAULT_PALETTE,
  pageBackground = "#f5f1e8",
  cardBorderWidth = 1,
  cardBorderRadius = 4,
  fontFamily,
  files = [],
}: {
  blocks: EmailBlock[]
  subject: string
  context: EmailContext
  palette?: EmailPalette
  pageBackground?: string
  cardBorderWidth?: number
  cardBorderRadius?: number
  fontFamily?: string
  files?: EmailFileAttachment[]
}) => (
  <Html>
    <Head />
    <Preview>{resolveVariables(subject, context)}</Preview>
    <Body
      style={{
        margin: 0,
        padding: 0,
        backgroundColor: pageBackground,
        ...(fontFamily ? { fontFamily } : {}),
      }}
    >
      <EmailBody
        blocks={blocks}
        context={context}
        palette={palette}
        cardBorderWidth={cardBorderWidth}
        cardBorderRadius={cardBorderRadius}
        fontFamily={fontFamily}
        files={files}
      />
    </Body>
  </Html>
)
