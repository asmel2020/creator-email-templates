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
  DividerProps,
  SpacerProps,
  FooterProps,
} from "./types"
import { DEFAULT_PALETTE } from "./default-blocks"
import { resolveVariables } from "./variables"
import { renderRichText } from "./richtext"

export const alignMap = {
  left: "left",
  center: "center",
  right: "right",
} as const

export { alignMap as blockAlignMap }

export const blockPadding = (props: EmailBlockProps) => {
  const py = "paddingY" in props ? (props.paddingY ?? 0) : 0
  const px = "paddingX" in props ? (props.paddingX ?? 0) : 0
  return { padding: `${py}px ${px}px` }
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
      ...blockPadding(props),
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
      ...blockPadding(props),
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
      ...blockPadding(props),
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
      ...blockPadding(props),
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
      ...blockPadding(props),
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
      ...blockPadding(props),
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
      ...blockPadding(props),
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
      ...blockPadding(props),
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
      ...blockPadding(props),
      ...(props.backgroundColor
        ? { backgroundColor: props.backgroundColor }
        : {}),
    }}
  >
    <Row>
      {props.columns.map((col) => (
        <Column
          key={col.id}
          style={{ width: "50%", verticalAlign: "top", paddingRight: 8 }}
        >
          <div
            style={{
              color: palette.INK,
              fontSize: 14,
              lineHeight: 1.5,
              margin: 0,
            }}
            dangerouslySetInnerHTML={{
              __html: renderRichText(resolveVariables(col.text, context)),
            }}
          />
        </Column>
      ))}
    </Row>
  </Section>
)

const BlockDivider = ({ props }: { props: DividerProps }) => (
  <Section
    style={{
      ...(props.height !== undefined
        ? { padding: `${props.height}px ${props.paddingX ?? 32}px` }
        : blockPadding(props)),
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
}) => (
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

export const BlockRenderer = ({
  block,
  context,
  palette = DEFAULT_PALETTE,
}: {
  block: EmailBlock
  context: EmailContext
  palette?: EmailPalette
}) => {
  switch (block.type) {
    case "header":
      return (
        <BlockHeader
          props={block.props as HeaderProps}
          context={context}
          palette={palette}
        />
      )
    case "hero":
      return (
        <BlockHero
          props={block.props as HeroProps}
          context={context}
          palette={palette}
        />
      )
    case "heading":
      return (
        <BlockHeading
          props={block.props as HeadingProps}
          context={context}
          palette={palette}
        />
      )
    case "text":
      return (
        <BlockText
          props={block.props as TextProps}
          context={context}
          palette={palette}
        />
      )
    case "list":
      return (
        <BlockList
          props={block.props as ListProps}
          context={context}
          palette={palette}
        />
      )
    case "button":
      return (
        <BlockButton
          props={block.props as ButtonProps}
          context={context}
          palette={palette}
        />
      )
    case "image":
      return (
        <BlockImage
          props={block.props as ImageProps}
          context={context}
          palette={palette}
        />
      )
    case "quote":
      return (
        <BlockQuote
          props={block.props as QuoteProps}
          context={context}
          palette={palette}
        />
      )
    case "columns":
      return (
        <BlockColumns
          props={block.props as ColumnsProps}
          context={context}
          palette={palette}
        />
      )
    case "divider":
      return <BlockDivider props={block.props as DividerProps} />
    case "spacer":
      return <BlockSpacer props={block.props as SpacerProps} />
    case "footer":
      return (
        <BlockFooter
          props={block.props as FooterProps}
          context={context}
          palette={palette}
        />
      )
    default:
      return null
  }
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
