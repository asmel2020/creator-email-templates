import { describe, expect, it } from "vitest";
import { renderEmailHtml } from "../src/html-render.js";
import { normalizeBlocks } from "../src/normalize.js";
import type { EmailBlock, GalleryProps } from "../src/types.js";

const block = (props: Partial<GalleryProps>): EmailBlock =>
  ({
    id: "g1",
    type: "gallery",
    props: {
      images: [
        { id: "i1", src: "a.png", alt: "A" },
        { id: "i2", src: "b.png", alt: "B" },
        { id: "i3", src: "c.png", alt: "C" },
      ],
      columns: 2,
      variant: "grid",
      radius: 6,
      imageHeight: 0,
      align: "center",
      paddingY: 16,
      paddingX: 32,
      ...props,
    },
  }) as EmailBlock;

const html = (props: Partial<GalleryProps>) =>
  renderEmailHtml({ blocks: [block(props)] });

const count = (haystack: string, needle: string) =>
  haystack.split(needle).length - 1;

/** Contenido de la sección del bloque (después del padding del wrapper). */
const inner = (out: string) => out.split("padding:16px 32px")[1] ?? "";

describe("gallery variants", () => {
  it("keeps the classic grid byte-identical by default", async () => {
    const out = await html({});
    // Celdas 50% con padding 6 (gutter 12 por defecto) y radio 6.
    expect(count(out, 'width="50%" valign="top" style="width:50%;padding:6px;"')).toBe(3);
    expect(out).toContain('width="240" style="max-width:100%;display:block;border:0;border-radius:6px;"');
  });

  it("honours columns 3 in the grid variant", async () => {
    const out = await html({ columns: 3 });
    expect(count(out, 'style="width:33%;padding:6px;"')).toBe(3);
  });

  it("renders three columns in a single row", async () => {
    const out = await html({
      variant: "three-columns",
      radius: 12,
      imageHeight: 186,
      gap: 16,
    });
    expect(count(out, 'style="width:33.33%;padding-right:8px;"')).toBe(1);
    expect(count(out, 'style="width:33.33%;padding-left:8px;padding-right:8px;"')).toBe(1);
    expect(count(out, 'style="width:33.33%;padding-left:8px;"')).toBe(1);
    expect(out).toContain('height="186"');
    expect(out).toContain("border-radius:12px");
    expect(out).toContain("object-fit:cover");
    // Una sola fila.
    expect(count(inner(out), "<tr>")).toBe(1);
  });

  it("stacks two images next to a tall one (horizontal)", async () => {
    const out = await html({
      variant: "horizontal",
      radius: 12,
      imageHeight: 152,
      gap: 16,
    });
    // Izquierda apilada con separación de 8px, derecha alta que cubre las dos + gutter.
    expect(out).toContain('padding-bottom:8px;');
    expect(out).toContain('padding-top:8px;');
    expect(count(out, 'height="152"')).toBe(2);
    expect(count(out, 'height="320"')).toBe(1);
  });

  it("puts a wide image above two columns (vertical)", async () => {
    const out = await html({
      variant: "vertical",
      radius: 12,
      imageHeight: 288,
      gap: 16,
    });
    expect(count(out, 'height="288"')).toBe(3);
    // El hero va en su propia fila, ancho completo.
    expect(out).toContain('padding-bottom:8px;');
    expect(out).toContain('style="width:50%;padding-top:8px;padding-right:8px;"');
    expect(out).toContain('style="width:50%;padding-top:8px;padding-left:8px;"');
    expect(count(inner(out), "<tr>")).toBe(2);
  });

  it("wraps each image in its href and resolves variables", async () => {
    const out = await html({
      images: [
        { id: "i1", src: "{siteUrl}/hero.jpg", alt: "A", href: "{link}" },
        { id: "i2", src: "b.png", alt: "B" },
      ],
      columns: 2,
    });
    expect(out).toContain('href="https://www.ejemplo.com/"');
    expect(out).toContain('src="https://www.ejemplo.com/hero.jpg"');
  });

  it("falls back to the grid for unknown variants and missing images", async () => {
    const out = await html({
      variant: "nope" as GalleryProps["variant"],
      images: [],
    });
    // Sin imágenes no hay filas, pero no lanza.
    expect(out).toContain('width="100%"');
  });

  it("renders the placeholder for empty slots in the new layouts", async () => {
    const out = await html({ variant: "vertical", images: [] });
    expect(count(out, "(Imagen)")).toBe(3);
  });

  it("preserves gallery columns when normalizing", () => {
    const out = normalizeBlocks([
      { id: "g", type: "gallery", props: { columns: 3, variant: "grid" } },
    ]);
    expect(out[0].props).toMatchObject({ columns: 3, variant: "grid" });
  });

  it("coerces corrupt variant/radius/imageHeight", () => {
    const out = normalizeBlocks([
      {
        id: "g",
        type: "gallery",
        props: { radius: "12", imageHeight: "288", variant: 7 },
      },
    ]);
    expect(out[0].props).toMatchObject({
      radius: 12,
      imageHeight: 288,
      variant: "7",
    });
  });
});
