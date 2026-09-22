import { describe, expect, it } from "vitest";
import { renderEmailHtml } from "../src/html-render.js";
import { normalizeBlocks } from "../src/normalize.js";
import type { EmailBlock, ListProps } from "../src/types.js";

const block = (props: Partial<ListProps>): EmailBlock =>
  ({
    id: "l1",
    type: "list",
    props: {
      items: ["Beneficio 1", "Beneficio 2"],
      icon: "✓",
      variant: "bullets",
      entries: [
        { id: "e1", title: "Paso 1", description: "Primero" },
        { id: "e2", title: "Paso 2", description: "Segundo" },
      ],
      accentColor: "#d7b227",
      radius: 4,
      imageHeight: 168,
      align: "left",
      paddingY: 12,
      paddingX: 32,
      ...props,
    },
  }) as EmailBlock;

const html = (props: Partial<ListProps>) =>
  renderEmailHtml({ blocks: [block(props)] });

const count = (haystack: string, needle: string) =>
  haystack.split(needle).length - 1;

describe("list variants", () => {
  it("keeps the classic bullets byte-identical by default", async () => {
    const out = await html({});
    expect(count(out, 'style="margin-bottom:8px;"')).toBe(2);
    expect(out).toContain(
      '<td width="24" valign="top"><p style="color:#d7b227;font-weight:700;margin:0;font-size:14px">✓</p>',
    );
    expect(out).toContain("Beneficio 1");
    // Sin badge circular ni títulos de entrada.
    expect(out).not.toContain("border-radius:9999px");
    expect(out).not.toContain("Paso 1");
  });

  it("honours gap between bullets", async () => {
    const out = await html({ gap: 16 });
    expect(count(out, 'style="margin-bottom:16px;"')).toBe(2);
  });

  it("renders numbered entries with a badge, title and description", async () => {
    const out = await html({ variant: "numbered", gap: 24 });
    expect(count(out, "border-radius:9999px")).toBe(2);
    expect(out).toContain("Paso 1");
    expect(out).toContain("Primero");
    expect(out).toContain('style="width:24px;padding-right:18px;"');
    // Sin columna de imagen.
    expect(out).not.toContain('width="40%"');
    // Separación entre filas (la última sin margen).
    expect(out).toContain("margin-bottom:24px");
    expect(out).toContain("margin-bottom:0");
  });

  it("renders image + title + link in the with-image variant (no number)", async () => {
    const out = await html({
      variant: "with-image",
      accentColor: "#4f46e5",
      radius: 4,
      imageHeight: 168,
      entries: [
        {
          id: "e1",
          title: "Empieza",
          description: "Busca lo que necesitas",
          image: "foto.png",
          href: "https://ejemplo.com",
          linkLabel: "Ver más →",
        },
      ],
    });
    expect(out).toContain('width="40%" valign="top" style="width:40%;padding-right:24px;"');
    expect(out).toContain('width="60%" valign="top" style="width:60%;padding-right:24px;"');
    expect(out).toContain('height="168"');
    expect(out).toContain("object-fit:cover");
    expect(out).toContain("border-radius:4px");
    expect(out).toContain("Ver más →");
    expect(out).toContain("color:#4f46e5");
    // Sin badge numerado.
    expect(out).not.toContain("border-radius:9999px");
    expect(out).not.toContain('style="width:24px;padding-right:18px;"');
  });

  it("uses the entry number when provided", async () => {
    const out = await html({
      variant: "numbered",
      entries: [{ id: "e1", title: "Uno", number: "A" }],
    });
    expect(out).toContain(">A</td>");
  });

  it("shows the image placeholder when the entry has no image", async () => {
    const out = await html({
      variant: "with-image",
      entries: [{ id: "e1", title: "Sin foto" }],
    });
    expect(out).toContain("(Imagen)");
  });

  it("does not emit a link when href is empty", async () => {
    const out = await html({
      variant: "numbered",
      entries: [{ id: "e1", title: "Uno", href: "" }],
    });
    expect(out).not.toContain("<a href=");
  });

  it("repairs entries when normalizing", () => {
    const out = normalizeBlocks([
      {
        id: "l",
        type: "list",
        props: {
          variant: "with-image",
          entries: [
            { title: "Uno", description: 7, image: "a.png", href: "x" },
          ],
        },
      },
    ]);
    const entries = out[0].props.entries as Array<Record<string, unknown>>;
    expect(entries[0]).toMatchObject({
      title: "Uno",
      description: "7",
      image: "a.png",
      href: "x",
      linkLabel: "",
    });
    expect(typeof entries[0].id).toBe("string");
    expect(out[0].props).toMatchObject({ variant: "with-image" });
  });

  it("falls back to bullets for unknown variants", async () => {
    const out = await html({ variant: "nope" as ListProps["variant"] });
    expect(count(out, 'style="margin-bottom:8px;"')).toBe(2);
  });
});
