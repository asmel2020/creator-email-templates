import { describe, expect, it } from "vitest";
import { renderEmailHtml } from "../src/html-render.js";
import { normalizeBlocks } from "../src/normalize.js";
import type { EmailBlock } from "../src/types.js";

const text = (id: string, value: string): EmailBlock => ({
  id,
  type: "text",
  props: { text: value, align: "left", paddingY: 0, paddingX: 0 } as never,
});

describe("footer variants", () => {
  it("classic (default) keeps the dark bar with text/brandName", async () => {
    const html = await renderEmailHtml({
      blocks: [
        {
          id: "f",
          type: "footer",
          props: {
            text: "Recibes esto por estar suscrito",
            brandName: "Tu Marca",
          } as never,
        },
      ],
    });
    expect(html).toContain("Recibes esto por estar suscrito");
    expect(html).toContain("Tu Marca");
    expect(html).toContain("padding:24px 32px");
  });

  it("one-column renders a single 100% cell with nested blocks", async () => {
    const html = await renderEmailHtml({
      blocks: [
        {
          id: "f",
          type: "footer",
          props: {
            variant: "one-column",
            backgroundColor: "#f9fafb",
            columns: [{ id: "c1", width: 100, blocks: [text("t", "Pie")] }],
          } as never,
        },
      ],
    });
    expect(html).toContain("Pie");
    expect(html).toContain('width="100%"');
    expect(html).toContain("#f9fafb");
  });

  it("two-columns renders both cells and a gutter", async () => {
    const html = await renderEmailHtml({
      blocks: [
        {
          id: "f",
          type: "footer",
          props: {
            variant: "two-columns",
            gap: 16,
            columns: [
              { id: "c1", width: 50, blocks: [text("a", "Izquierda")] },
              { id: "c2", width: 50, blocks: [text("b", "Derecha")] },
            ],
          } as never,
        },
      ],
    });
    expect(html).toContain("Izquierda");
    expect(html).toContain("Derecha");
    expect(html.match(/padding-right:16px;/g)?.length).toBe(1);
  });

  it("normalizes variant columns like a grid", () => {
    const out = normalizeBlocks([
      {
        id: "f",
        type: "footer",
        props: {
          variant: "two-columns",
          columns: [
            { id: "c1", width: "40", blocks: [{ type: "text", props: { text: "x" } }] },
            { id: "c2", blocks: [] },
          ],
        },
      },
    ]);
    const props = out[0].props as {
      variant: string;
      columns: { width?: number; blocks: EmailBlock[] }[];
    };
    expect(props.variant).toBe("two-columns");
    expect(props.columns[0].width).toBe(40);
    expect(props.columns[0].blocks[0].type).toBe("text");
  });

  it("legacy payloads (text/brandName) stay classic", () => {
    const out = normalizeBlocks([
      { id: "f", type: "footer", props: { text: "Hola", brandName: "Marca" } },
    ]);
    const props = out[0].props as { variant: string; columns: unknown[] };
    expect(props.variant).toBe("classic");
    expect(props.columns).toEqual([]);
  });
});
