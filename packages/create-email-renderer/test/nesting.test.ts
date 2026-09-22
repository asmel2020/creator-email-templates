import { describe, expect, it } from "vitest";
import { renderEmailHtml } from "../src/html-render.js";
import { normalizeBlocks } from "../src/normalize.js";
import type { EmailBlock } from "../src/types.js";

const text = (id: string, value: string): EmailBlock => ({
  id,
  type: "text",
  props: { text: value, align: "left", paddingY: 0, paddingX: 0 } as never,
});

describe("nesting (depth 1)", () => {
  it("renders container children", async () => {
    const html = await renderEmailHtml({
      blocks: [
        {
          id: "c",
          type: "container",
          props: {
            blocks: [text("t", "Dentro del contenedor")],
            paddingY: 20,
            paddingX: 10,
          } as never,
        },
      ],
    });
    expect(html).toContain("Dentro del contenedor");
    expect(html).toContain("padding:20px 10px");
  });

  it("renders columns v2 children", async () => {
    const html = await renderEmailHtml({
      blocks: [
        {
          id: "cols",
          type: "columns",
          props: {
            columns: [
              { id: "a", blocks: [text("t1", "Izquierda")] },
              { id: "b", blocks: [text("t2", "Derecha")] },
            ],
            gap: 16,
          } as never,
        },
      ],
    });
    expect(html).toContain("Izquierda");
    expect(html).toContain("Derecha");
    expect(html).toContain("padding-right:16px;");
  });

  it("drops container blocks nested one level deep", () => {
    const out = normalizeBlocks([
      {
        id: "c",
        type: "container",
        props: {
          blocks: [
            { id: "inner", type: "container", props: { blocks: [] } },
            text("ok", "Permitido"),
          ],
        },
      },
    ]);
    const children = (out[0].props as { blocks: EmailBlock[] }).blocks;
    expect(children.map((b) => b.type)).toEqual(["text"]);
  });

  it("migrates legacy columns { id, text } to blocks", () => {
    const out = normalizeBlocks([
      {
        id: "cols",
        type: "columns",
        props: { columns: [{ id: "a", text: "Vieja columna" }] },
      },
    ]);
    const cols = (
      out[0].props as {
        columns: { id: string; blocks: EmailBlock[] }[];
      }
    ).columns;
    expect(cols[0].blocks).toHaveLength(1);
    expect(cols[0].blocks[0].type).toBe("text");
    expect(
      (cols[0].blocks[0].props as { text: string }).text,
    ).toBe("Vieja columna");
  });

  it("keeps container children layout props", () => {
    const out = normalizeBlocks([
      {
        id: "c",
        type: "container",
        props: {
          blocks: [
            { id: "t", type: "text", props: { text: "x", paddingTop: 6 } },
          ],
        },
      },
    ]);
    const child = (out[0].props as { blocks: EmailBlock[] }).blocks[0];
    expect(child.props).toMatchObject({ paddingTop: 6 });
  });
});
