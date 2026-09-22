import { describe, expect, it } from "vitest";
import { renderEmailHtml } from "../src/html-render.js";
import { normalizeBlocks } from "../src/normalize.js";
import type {
  CheckoutProps,
  EmailBlock,
  ProductItem,
  ProductProps,
} from "../src/types.js";

const item = (data: Partial<ProductItem> & { name: string }): ProductItem => ({
  id: `p-${data.name}`,
  imageUrl: "",
  description: "",
  price: "",
  ctaLabel: "",
  ctaHref: "",
  ...data,
});

const product = (props: Partial<ProductProps>): EmailBlock =>
  ({
    id: "pr1",
    type: "product",
    props: {
      variant: "card",
      imageUrl: "",
      name: "Nombre del producto",
      description: "Una breve descripción del producto.",
      price: "$49",
      ctaLabel: "Comprar ahora",
      ctaHref: "",
      eyebrow: "",
      heading: "",
      subheading: "",
      products: [item({ name: "Uno" }), item({ name: "Dos" })],
      columns: 2,
      imageHeight: 0,
      radius: 8,
      accentColor: "#d7b227",
      align: "center",
      paddingY: 24,
      paddingX: 32,
      ...props,
    },
  }) as EmailBlock;

const checkout = (props: Partial<CheckoutProps>): EmailBlock =>
  ({
    id: "c1",
    type: "checkout",
    props: {
      heading: "Tu carrito te espera",
      lines: [
        { id: "l1", imageUrl: "", name: "Producto 1", quantity: "1", price: "$49" },
        { id: "l2", imageUrl: "", name: "Producto 2", quantity: "2", price: "$59" },
      ],
      ctaLabel: "Finalizar compra",
      ctaHref: "",
      imageHeight: 110,
      radius: 8,
      accentColor: "#4f46e5",
      borderColor: "#e5e7eb",
      align: "center",
      paddingY: 24,
      paddingX: 32,
      ...props,
    },
  }) as EmailBlock;

const html = (block: EmailBlock) => renderEmailHtml({ blocks: [block] });
const count = (haystack: string, needle: string) =>
  haystack.split(needle).length - 1;

describe("product variants", () => {
  it("keeps the classic card byte-identical by default", async () => {
    const out = await html(product({ imageUrl: "foto.png" }));
    expect(out).toContain("text-align:center;padding:24px 32px");
    expect(out).toContain('border-radius:8px;margin:0 auto 16px');
    expect(out).toContain("border-radius:999px");
    // Sin layouts nuevos.
    expect(out).not.toContain('width="50%"');
    expect(out).not.toContain("<th");
  });

  it("renders the hero layout with the eyebrow and a wide image", async () => {
    const out = await html(
      product({
        variant: "hero",
        eyebrow: "Relojes clásicos",
        imageUrl: "foto.png",
        imageHeight: 320,
        radius: 12,
        accentColor: "#4f46e5",
      }),
    );
    expect(out).toContain('height="320"');
    expect(out).toContain("object-fit:cover");
    expect(out).toContain("border-radius:12px");
    expect(out).toContain("Relojes clásicos");
    expect(out).toContain("font-size:36px");
    expect(out).toContain("background-color:#4f46e5");
    // El eyebrow va en el color de acento.
    expect(out).toContain("color:#4f46e5");
  });

  it("renders the image-left layout as a 50/50 table", async () => {
    const out = await html(
      product({ variant: "image-left", imageUrl: "foto.png", imageHeight: 220 }),
    );
    expect(out).toContain('width="50%" valign="top" style="width:50%;padding-right:32px;box-sizing:border-box;"');
    expect(out).toContain('vertical-align:baseline;');
    expect(out).toContain('height="220"');
    // Botón al 75%.
    expect(out).toContain("width:75%");
  });

  it("renders three cards in a single row", async () => {
    const out = await html(
      product({
        variant: "grid",
        columns: 3,
        imageHeight: 180,
        products: [item({ name: "Uno" }), item({ name: "Dos" }), item({ name: "Tres" })],
      }),
    );
    expect(count(out, 'style="width:33.33%;padding-top:16px;padding-bottom:16px;')).toBe(3);
    expect(count(out, 'height="180"')).toBe(0); // sin imagen: placeholder
    expect(count(out, "(Imagen)")).toBe(3);
    expect(out).not.toContain("<hr");
  });

  it("renders four cards as 2x2 with a separator between rows", async () => {
    const out = await html(
      product({
        variant: "grid",
        columns: 4,
        imageHeight: 250,
        products: [
          item({ name: "Uno" }),
          item({ name: "Dos" }),
          item({ name: "Tres" }),
          item({ name: "Cuatro" }),
        ],
      }),
    );
    expect(count(out, 'style="width:50%;padding-top:16px;padding-bottom:16px;')).toBe(4);
    expect(count(out, "<hr")).toBe(1);
  });

  it("renders the section header only when set", async () => {
    const withHeader = await html(
      product({ variant: "grid", heading: "Productos", subheading: "Los favoritos" }),
    );
    expect(withHeader).toContain("Productos");
    expect(withHeader).toContain("Los favoritos");
    const withoutHeader = await html(product({ variant: "grid" }));
    expect(withoutHeader).not.toContain("Los favoritos");
  });

  it("repairs products when normalizing", () => {
    const out = normalizeBlocks([
      {
        id: "p",
        type: "product",
        props: {
          variant: "grid",
          products: [{ name: "Uno", price: 12, ctaLabel: "Comprar" }],
        },
      },
    ]);
    const products = out[0].props.products as Array<Record<string, unknown>>;
    expect(products[0]).toMatchObject({
      name: "Uno",
      price: "12",
      ctaLabel: "Comprar",
      imageUrl: "",
    });
    expect(typeof products[0].id).toBe("string");
  });

  it("falls back to the card for unknown variants", async () => {
    const out = await html(product({ variant: "nope" as ProductProps["variant"] }));
    expect(out).toContain("border-radius:999px");
  });
});

describe("checkout block", () => {
  it("renders the cart table and the full-width button", async () => {
    const out = await html(checkout({}));
    expect(out).toContain("Tu carrito te espera");
    expect(out).toContain("Producto");
    expect(out).toContain("Cantidad");
    expect(out).toContain("Precio");
    expect(out).toContain("border:1px solid #e5e7eb;border-radius:8px");
    expect(out).toContain("$49");
    expect(out).toContain(">2<");
    expect(out).toContain("background-color:#4f46e5");
    expect(out).toContain("width:100%;box-sizing:border-box");
  });

  it("honours image height, radius and accent", async () => {
    const out = await html(
      checkout({
        imageHeight: 90,
        radius: 12,
        accentColor: "#111827",
        lines: [
          { id: "l1", imageUrl: "a.png", name: "Uno", quantity: "1", price: "$9" },
        ],
      }),
    );
    expect(out).toContain('width="90" height="90"');
    expect(out).toContain("border-radius:12px");
    expect(out).toContain("background-color:#111827");
  });

  it("shows the image placeholder and hides the heading when empty", async () => {
    const out = await html(
      checkout({
        heading: "",
        lines: [{ id: "l1", name: "Solo texto", quantity: "", price: "" }],
      }),
    );
    expect(out).toContain("(Imagen)");
    expect(out).not.toContain("Tu carrito te espera");
    // Sin cantidad usa 1 por defecto.
    expect(out).toContain(">1<");
  });

  it("repairs lines when normalizing", () => {
    const out = normalizeBlocks([
      {
        id: "c",
        type: "checkout",
        props: { lines: [{ name: "Uno", quantity: 3, price: 9 }] },
      },
    ]);
    const lines = out[0].props.lines as Array<Record<string, unknown>>;
    expect(lines[0]).toMatchObject({
      name: "Uno",
      quantity: "3",
      price: "9",
      imageUrl: "",
    });
    expect(typeof lines[0].id).toBe("string");
  });
});
