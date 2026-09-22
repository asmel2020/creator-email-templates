import { describe, expect, it } from "vitest";
import { renderEmailHtml } from "../src/html-render.js";
import { normalizeBlocks } from "../src/normalize.js";
import type { EmailBlock } from "../src/types.js";

const block = (
  type: EmailBlock["type"],
  props: Record<string, unknown>,
): EmailBlock => ({ id: `id-${type}`, type, props: props as never });

describe("layout props", () => {
  it("emits shorthands unchanged when no per-side overrides exist", async () => {
    const html = await renderEmailHtml({
      blocks: [block("text", { text: "Hola", paddingY: 20, paddingX: 30 })],
    });
    expect(html).toContain("padding:20px 30px");
    expect(html).not.toContain("padding-top");
  });

  it("per-side padding overrides the shorthand", async () => {
    const html = await renderEmailHtml({
      blocks: [
        block("text", {
          text: "Hola",
          paddingY: 20,
          paddingX: 30,
          paddingTop: 4,
        }),
      ],
    });
    expect(html).toContain("padding-top:4px");
    expect(html).toContain("padding-bottom:20px");
    expect(html).toContain("padding-left:30px");
    expect(html).not.toContain("padding:20px 30px");
  });

  it("routes margins to the wrapping table, not the cell", async () => {
    const html = await renderEmailHtml({
      blocks: [block("text", { text: "Hola", marginTop: 12, marginBottom: 8 })],
    });
    const table = html.match(/<table[^>]*style="[^"]*margin-top:12px[^"]*"/);
    expect(table).not.toBeNull();
    expect(html).toContain("margin-bottom:8px");
  });

  it("uses gap as the column gutter", async () => {
    const html = await renderEmailHtml({
      blocks: [
        block("columns", {
          gap: 24,
          columns: [
            { id: "a", text: "A" },
            { id: "b", text: "B" },
          ],
        }),
      ],
    });
    expect(html).toContain("padding-right:24px");
  });

  it("preserves layout props through normalization", () => {
    const [normalized] = normalizeBlocks([
      {
        id: "x",
        type: "text",
        props: { text: "Hola", paddingTop: 5, marginBottom: 12, gap: 3 },
      },
    ]);
    expect(normalized.props).toMatchObject({
      text: "Hola",
      paddingTop: 5,
      marginBottom: 12,
      gap: 3,
    });
  });

  it("drops unknown legacy layout keys", () => {
    const [normalized] = normalizeBlocks([
      {
        id: "x",
        type: "text",
        props: { text: "Hola", marginLeft: 99 },
      },
    ]);
    expect(normalized.props).not.toHaveProperty("marginLeft");
  });
});
