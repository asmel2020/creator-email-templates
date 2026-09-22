import { describe, expect, it } from "vitest";
import { renderEmailHtml } from "../src/html-render.js";
import { DEFAULT_FONT_STACK, FONT_STACKS } from "../src/types.js";
import type { EmailBlock } from "../src/types.js";

const blocks = (): EmailBlock[] => [
  {
    id: "t1",
    type: "text",
    props: { text: "Hola", align: "left", paddingY: 12, paddingX: 32 },
  } as EmailBlock,
  {
    id: "c1",
    type: "code",
    props: { code: "npm install", language: "sh" },
  } as EmailBlock,
];

const html = (fontFamily?: string) =>
  renderEmailHtml({
    blocks: blocks(),
    settings: fontFamily === undefined ? undefined : { fontFamily },
  });

describe("font family", () => {
  it("emits the default system stack on the body and the wrapper cell", async () => {
    const out = await html();
    expect(out).toContain(
      `<body style="margin:0;padding:0;background-color:#f5f1e8;font-family:${DEFAULT_FONT_STACK}">`,
    );
    expect(out).toContain(
      `<tbody><tr><td style="font-family:${DEFAULT_FONT_STACK}">`,
    );
  });

  it("uses a safe stack: no double quotes inside the style attribute", async () => {
    const out = await html();
    const bodyStyle = out.split("<body style=\"")[1].split("\">")[0];
    expect(bodyStyle).not.toContain('"');
    expect(bodyStyle).toContain("font-family:");
    // Todas las familias con espacios van entre comillas simples.
    for (const font of FONT_STACKS) {
      expect(font.stack).not.toContain('"');
    }
  });

  it("honours a custom stack", async () => {
    const out = await html("Georgia, 'Times New Roman', serif");
    expect(out).toContain("font-family:Georgia, 'Times New Roman', serif");
  });

  it("omits font-family entirely when disabled with an empty string", async () => {
    const out = await html("");
    const bodyStyle = out.split('<body style="')[1].split('">')[0];
    expect(bodyStyle).not.toContain("font-family");
    // La celda contenedora vuelve a no llevar atributo style (paridad con antes).
    expect(out).toContain("<tbody><tr><td><table");
  });

  it("lets the code block keep its monospace stack", async () => {
    const out = await html();
    expect(out).toContain(
      "font-family:ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
    );
  });
});
