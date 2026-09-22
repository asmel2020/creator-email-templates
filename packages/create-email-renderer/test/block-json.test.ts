import { describe, expect, it } from "vitest";
import { blockJson, templateJson } from "../src/build.js";
import { renderEmailHtml } from "../src/html-render.js";
import { renderTemplateEmail } from "../src/server.js";
import type { EmailBlock, EmailBlockType } from "../src/types.js";

const propsOf = (block: EmailBlock | null) => block?.props as Record<string, unknown>;

describe("blockJson", () => {
  it("builds a block with the schema defaults", () => {
    const block = blockJson("image", { src: "foto.png" });
    expect(typeof block.id).toBe("string");
    expect(block.type).toBe("image");
    expect(propsOf(block)).toMatchObject({
      src: "foto.png",
      alt: "Imagen",
      width: 480,
      align: "center",
      paddingY: 16,
      paddingX: 32,
    });
  });

  it("coerces types like normalize does", () => {
    const block = blockJson("image", { width: "480" });
    expect(propsOf(block).width).toBe(480);
  });

  it("keeps layout overrides that live outside the defaults", () => {
    const block = blockJson("text", { text: "Hola", marginTop: 24, gap: "12" });
    expect(propsOf(block)).toMatchObject({ marginTop: 24, gap: 12 });
  });

  it("completes record arrays and generates their ids", () => {
    const block = blockJson("checkout", {
      lines: [{ name: "Camiseta", price: "$20" }],
    });
    const lines = propsOf(block).lines as Array<Record<string, unknown>>;
    expect(lines).toHaveLength(1);
    expect(typeof lines[0].id).toBe("string");
    expect(lines[0]).toMatchObject({
      name: "Camiseta",
      price: "$20",
      imageUrl: "",
      quantity: "",
    });
  });

  it("coerces record fields (boolean and string[])", () => {
    const block = blockJson("pricing", {
      variant: "two-tiers",
      plans: [{ title: "Pro", features: ["Uno", 2], highlighted: true }],
    });
    const plans = propsOf(block).plans as Array<Record<string, unknown>>;
    expect(plans[0]).toMatchObject({
      title: "Pro",
      features: ["Uno", "2"],
      highlighted: true,
      price: "",
    });
  });

  it("builds nested children from [type, props] shorthands", () => {
    const block = blockJson("columns", {
      columns: [{ blocks: [["text", { text: "Hola" }]] }],
    });
    const columns = propsOf(block).columns as Array<Record<string, unknown>>;
    expect(typeof columns[0].id).toBe("string");
    const children = columns[0].blocks as EmailBlock[];
    expect(children[0].type).toBe("text");
    expect(children[0].props).toMatchObject({ text: "Hola", align: "left" });
  });

  it("accepts the object shorthand and real blocks as children", () => {
    const real = blockJson("heading", { text: "Título" });
    const block = blockJson("container", {
      blocks: [{ type: "text", props: { text: "Hola" } }, real],
    });
    const children = propsOf(block).blocks as EmailBlock[];
    expect(children.map((c) => c.type)).toEqual(["text", "heading"]);
    expect(children[1].id).toBe(real.id);
  });

  it("drops containers nested beyond MAX_BLOCK_DEPTH", () => {
    const block = blockJson("container", {
      blocks: [["columns", { columns: [] }], ["text", { text: "Ok" }]],
    });
    const children = propsOf(block).blocks as EmailBlock[];
    expect(children.map((c) => c.type)).toEqual(["text"]);
  });

  it("returns null for unknown types", () => {
    expect(blockJson("does-not-exist" as string, {})).toBeNull();
    expect(blockJson("" as string)).toBeNull();
  });

  it("ignores props that are not part of the schema", () => {
    const block = blockJson("image", { src: "a.png", nope: "x" } as never);
    expect(propsOf(block)).not.toHaveProperty("nope");
  });

  it("renders the built block as email HTML", async () => {
    const block = blockJson("image", { src: "foto.png", alt: "Foto" });
    const html = await renderEmailHtml({ blocks: [block as EmailBlock] });
    expect(html).toContain('src="foto.png"');
    expect(html).toContain('alt="Foto"');
  });
});

describe("templateJson", () => {
  it("returns a payload ready for renderTemplateEmail", async () => {
    const payload = templateJson(
      [
        blockJson("heading", { text: "Hola {firstName}" }),
        blockJson("image", { src: "foto.png" }),
        blockJson("does-not-exist" as string),
      ],
      { cardBorderWidth: 0 },
    );
    expect(payload.content).toHaveLength(2);
    expect(payload.settings).toMatchObject({ cardBorderWidth: 0 });

    const { html, subject } = await renderTemplateEmail({
      subject: "Para {firstName}",
      payload,
      context: { firstName: "Danny" },
    });
    expect(subject).toBe("Para Danny");
    expect(html).toContain("Hola Danny");
    expect(html).toContain('src="foto.png"');
  });

  it("accepts every built-in type without throwing", () => {
    const types = [
      "header",
      "hero",
      "heading",
      "text",
      "list",
      "button",
      "image",
      "quote",
      "columns",
      "container",
      "grid",
      "divider",
      "spacer",
      "footer",
      "social",
      "gallery",
      "stats",
      "pricing",
      "product",
      "testimonial",
      "features",
      "avatar",
      "code",
      "link",
      "checkout",
    ] as EmailBlockType[];
    for (const type of types) {
      const block = blockJson(type);
      expect(block, type).not.toBeNull();
      expect(block?.type).toBe(type);
    }
  });
});
