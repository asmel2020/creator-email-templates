import sanitizeHtml from "sanitize-html";

const RICH_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "del",
  "strike",
  "code",
  "a",
  "ul",
  "ol",
  "li",
  "span",
  "blockquote",
];

export const sanitizeRichText = (html: string): string =>
  sanitizeHtml(html, {
    allowedTags: RICH_TAGS,
    allowedAttributes: {
      a: ["href", "target", "rel", "style"],
      span: ["style"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        target: "_blank",
        rel: "noopener",
        style: "color:#a98a1e;text-decoration:underline;",
      }),
    },
  });

export const escapeHtml = (text: string): string =>
  text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const isRichText = (content: string): boolean =>
  /<\/?[a-z][\s\S]*>/i.test(content);

export const normalizeBlockHtml = (html: string): string =>
  html
    .replace(/<div([^>]*)>/gi, "<p$1>")
    .replace(/<\/div>/gi, "</p>")
    .replace(/<p[^>]*>\s*<br\s*\/?>\s*<\/p>/gi, "<p>&nbsp;</p>")
    .replace(/<p[^>]*>\s*<\/p>/gi, "<p>&nbsp;</p>");

const applyRichInlineStyles = (html: string): string =>
  html
    .replace(/<p(?![^>]*style=)/gi, '<p style="margin:0;padding:0"')
    .replace(
      /<ul(?![^>]*style=)/gi,
      '<ul style="margin:0 0 6px;padding-left:20px"',
    )
    .replace(/<li(?![^>]*style=)/gi, '<li style="margin:0 0 4px"')
    .replace(
      /<code(?![^>]*style=)/gi,
      '<code style="background:#f1e8dc;padding:1px 5px;border-radius:4px;font-size:0.9em"',
    )
    .replace(
      /<blockquote(?![^>]*style=)/gi,
      '<blockquote style="margin:0 0 6px;border-left:3px solid #d7b227;padding-left:12px"',
    );

export const renderRichText = (content: string): string => {
  if (!content) return "";
  if (isRichText(content)) {
    return applyRichInlineStyles(sanitizeRichText(normalizeBlockHtml(content)));
  }
  return `<span>${escapeHtml(content)}</span>`;
};