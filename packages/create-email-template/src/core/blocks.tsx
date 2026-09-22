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
  ProductProps,
  TestimonialProps,
  FeaturesProps,
  AvatarProps,
  CodeProps,
  LinkProps,
} from "./types"
import { DEFAULT_PALETTE } from "./default-blocks"
import { resolveVariables } from "./variables"
import { renderRichText } from "./richtext"
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

const BlockList = ({
  props,
  context,
  palette,
}: {
  props: ListProps
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
    {props.items.map((item, i) => (
      <Row key={i} style={{ marginBottom: 8 }}>
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

const BlockGallery = ({ props, context, palette }: { props: GalleryProps; context: EmailContext; palette: EmailPalette }) => {
  const cols = props.columns === 3 ? 3 : 2
  const width = `${Math.floor(100 / cols)}%`
  return (
    <Section
      style={{
        ...blockSpacing(props),
        ...(props.backgroundColor ? { backgroundColor: props.backgroundColor } : {}),
      }}
    >
      {chunk(props.images || [], cols).map((row, ri) => (
        <Row key={ri}>
          {row.map((img) => (
            <Column key={img.id} style={{ width, padding: 6, verticalAlign: "top" }}>
              {img.src ? (
                <Img
                  src={resolveVariables(img.src, context)}
                  alt={img.alt || ""}
                  width={240}
                  style={{ maxWidth: "100%", borderRadius: 6, display: "block" }}
                />
              ) : (
                <Text style={{ color: palette.CREAM_DIM, fontSize: 12, margin: 0 }}>
                  (Imagen)
                </Text>
              )}
            </Column>
          ))}
        </Row>
      ))}
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

const BlockProduct = ({ props, context, palette }: { props: ProductProps; context: EmailContext; palette: EmailPalette }) => (
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
  testimonial: withPreviewProps(BlockTestimonial),
  features: withPreviewProps(BlockFeatures),
  avatar: withPreviewProps(BlockAvatar),
  code: withPreviewProps(BlockCode as never),
  link: withPreviewProps(BlockLink),
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
}: {
  blocks: EmailBlock[]
  context: EmailContext
  palette?: EmailPalette
  cardBorderWidth?: number
  cardBorderRadius?: number
}) => (
  <Container
    style={{
      maxWidth: 600,
      backgroundColor: "#ffffff",
      border: `${cardBorderWidth}px solid #e3dccb`,
      borderRadius: cardBorderRadius,
      margin: "0 auto",
    }}
  >
    {blocks.map((block) => (
      <BlockRenderer
        key={block.id}
        block={block}
        context={context}
        palette={palette}
      />
    ))}
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
}: {
  blocks: EmailBlock[]
  subject: string
  context: EmailContext
  palette?: EmailPalette
  pageBackground?: string
  cardBorderWidth?: number
  cardBorderRadius?: number
}) => (
  <Html>
    <Head />
    <Preview>{resolveVariables(subject, context)}</Preview>
    <Body style={{ margin: 0, padding: 0, backgroundColor: pageBackground }}>
      <EmailBody
        blocks={blocks}
        context={context}
        palette={palette}
        cardBorderWidth={cardBorderWidth}
        cardBorderRadius={cardBorderRadius}
      />
    </Body>
  </Html>
)
