import { describe, expect, it } from "vitest";
import { renderEmailHtml } from "../src/html-render.js";
import { normalizeBlocks } from "../src/normalize.js";
import type { EmailBlock } from "../src/types.js";

const text = (id: string, value: string): EmailBlock => ({
  id,
  type: "text",
  props: { text: value, align: "left", paddingY: 0, paddingX: 0 } as never,
});

const grid = (
  widths: (number | undefined)[],
  gap?: number,
): EmailBlock => ({
  id: "g",
  type: "grid",
  props: {
    columns: widths.map((w, i) => ({
      id: `c${i}`,
      blocks: [text(`t${i}`, `Celda ${i + 1}`)],
      ...(w === undefined ? {} : { width: w }),
    })),
    ...(gap === undefined ? {} : { gap }),
  } as never,
});

describe("grid", () => {
  it("renders fractional widths rounded to 2 decimals", async () => {
    const html = await renderEmailHtml({
      blocks: [grid([33.3333, 66.6667])],
    });
    expect(html).toContain('width="33.33%"');
    expect(html).toContain('width="66.67%"');
    expect(html).toContain("Celda 1");
    expect(html).toContain("Celda 2");
  });

  it("splits evenly when no width is set", async () => {
    const html = await renderEmailHtml({ blocks: [grid([undefined, undefined, undefined])] });
    expect(html.match(/width="33\.33%"/g)?.length).toBe(3);
  });

  it("applies the gutter to every cell except the last", async () => {
    const html = await renderEmailHtml({ blocks: [grid([50, 50], 16)] });
    expect(html.match(/padding-right:16px;/g)?.length).toBe(1);
  });

  it("preserves width through normalization", () => {
    const out = normalizeBlocks([
      {
        id: "g",
        type: "grid",
        props: {
          columns: [
            { id: "a", width: "25", blocks: [] },
            { id: "b", blocks: [] },
          ],
        },
      },
    ]);
    const cols = (
      out[0].props as { columns: { width?: number }[] }
    ).columns;
    expect(cols[0].width).toBe(25);
    expect(cols[1].width).toBeUndefined();
  });

  it("ignores invalid widths", () => {
    const out = normalizeBlocks([
      {
        id: "g",
        type: "grid",
        props: { columns: [{ id: "a", width: 0, blocks: [] }] },
      },
    ]);
    const cols = (out[0].props as { columns: { width?: number }[] }).columns;
    expect(cols[0].width).toBeUndefined();
  });

  it("drops a grid nested inside a grid (depth 1)", () => {
    const out = normalizeBlocks([
      {
        id: "outer",
        type: "grid",
        props: {
          columns: [
            {
              id: "a",
              blocks: [
                {
                  id: "inner",
                  type: "grid",
                  props: { columns: [{ id: "x", blocks: [] }] },
                },
                text("ok", "Permitido"),
              ],
            },
          ],
        },
      },
    ]);
    const cols = (out[0].props as { columns: { blocks: EmailBlock[] }[] })
      .columns;
    expect(cols[0].blocks.map((b) => b.type)).toEqual(["text"]);
  });
});
