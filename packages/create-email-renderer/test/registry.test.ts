import { afterEach, describe, expect, it } from "vitest";
import {
  getBlockRegistration,
  listBlockDefinitions,
  registerBlock,
  unregisterBlock,
} from "../src/registry.js";
import { renderEmailHtml } from "../src/html-render.js";
import { normalizeBlocks } from "../src/normalize.js";
import { DEFAULT_BLOCK_LIBRARY } from "../src/default-blocks.js";

describe("block registry", () => {
  afterEach(() => {
    unregisterBlock("plugin-demo");
  });

  it("registers built-in definitions on import", () => {
    const types = listBlockDefinitions().map((d) => d.type);
    for (const def of DEFAULT_BLOCK_LIBRARY) {
      expect(types).toContain(def.type);
    }
    expect(getBlockRegistration("header")?.renderHtml).toBeTypeOf("function");
  });

  it("supports plugin blocks: render + normalize", async () => {
    registerBlock({
      definition: {
        type: "plugin-demo",
        label: "Demo",
        description: "Bloque de prueba",
        defaultProps: {
          title: "Hola",
          count: 1,
        } as never,
      },
      renderHtml: ({ props }) => {
        const p = props as { title: string; count: number };
        return `<div class="plugin-demo">${p.title}×${p.count}</div>`;
      },
      normalizeProps: (raw, def) => {
        const r = (raw ?? {}) as Record<string, unknown>;
        return {
          ...structuredClone(def.defaultProps) as object,
          title: String(r.title ?? "Hola"),
          count: Number(r.count) || 1,
        } as never;
      },
    });

    const html = await renderEmailHtml({
      blocks: [
        {
          id: "p1",
          type: "plugin-demo" as never,
          props: { title: "Custom", count: 3 } as never,
        },
      ],
    });
    expect(html).toContain("Custom×3");

    const normalized = normalizeBlocks([
      { id: "p1", type: "plugin-demo", props: { title: 99, count: "7" } },
    ]);
    expect(normalized).toHaveLength(1);
    expect(normalized[0].props).toMatchObject({ title: "99", count: 7 });

    expect(
      listBlockDefinitions().some((d) => d.type === "plugin-demo"),
    ).toBe(true);
  });

  it("merges partial registration (definition first, renderer later)", () => {
    registerBlock({
      definition: {
        type: "plugin-demo",
        label: "Demo v2",
        description: "x",
        defaultProps: {} as never,
      },
    });
    expect(getBlockRegistration("plugin-demo")?.renderHtml).toBeUndefined();
    registerBlock({
      definition: {
        type: "plugin-demo",
        label: "Demo v2",
        description: "x",
        defaultProps: {} as never,
      },
      renderHtml: () => "<i>ok</i>",
    });
    expect(getBlockRegistration("plugin-demo")?.renderHtml).toBeTypeOf(
      "function",
    );
  });

  it("rejects registration without type", () => {
    expect(() =>
      registerBlock({
        definition: { type: "" } as never,
      }),
    ).toThrow(/definition.type/);
  });
});
