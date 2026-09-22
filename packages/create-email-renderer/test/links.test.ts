import { describe, expect, it } from "vitest";
import { renderEmailHtml } from "../src/html-render.js";
import type { EmailBlock } from "../src/types.js";

const block = (type: string, props: Record<string, unknown>): EmailBlock =>
  ({ id: `id-${type}`, type, props }) as EmailBlock;

const html = (type: string, props: Record<string, unknown>) =>
  renderEmailHtml({ blocks: [block(type, props)] });

const count = (haystack: string, needle: string) =>
  haystack.split(needle).length - 1;

describe("CTAs without href", () => {
  it("renders text instead of an empty anchor in every CTA", async () => {
    const cases: Array<[string, Record<string, unknown>, string]> = [
      ["button", { label: "Comprar", href: "" }, "Comprar"],
      [
        "pricing",
        { variant: "two-tiers", plans: [{ title: "Pro", price: "$9", ctaLabel: "Empezar" }] },
        "Empezar",
      ],
      ["pricing", { title: "Pro", price: "$9", ctaLabel: "Suscribirme", ctaHref: "" }, "Suscribirme"],
      ["product", { name: "Reloj", price: "$9", ctaLabel: "Comprar ahora", ctaHref: "" }, "Comprar ahora"],
      ["checkout", { ctaLabel: "Finalizar compra", ctaHref: "" }, "Finalizar compra"],
      ["link", { label: "Ver más", href: "" }, "Ver más"],
      ["social", { links: [{ label: "Instagram", href: "", icon: "" }] }, "Instagram"],
    ];
    for (const [type, props, label] of cases) {
      const out = await html(type, props);
      expect(out, type).toContain(label);
      expect(out, `${type} no debe emitir <a>`).not.toContain("<a ");
      expect(out, `${type} sin href`).not.toContain('href=""');
      expect(out, `${type} usa span`).toContain("<span");
    }
  });

  it("keeps the anchor (with target) when there is an href", async () => {
    const button = await html("button", {
      label: "Comprar",
      href: "https://tienda.com",
    });
    expect(button).toContain(
      '<a href="https://tienda.com" target="_blank" style="',
    );

    const link = await html("link", { label: "Ver", href: "https://tienda.com" });
    expect(link).toContain('<a href="https://tienda.com" target="_blank"');

    const social = await html("social", {
      links: [{ label: "X", href: "https://x.com", icon: "" }],
    });
    expect(social).toContain('<a href="https://x.com" target="_blank"');
  });

  it("keeps the styles so the button still looks like a button", async () => {
    const withHref = await html("button", {
      label: "Comprar",
      href: "https://tienda.com",
    });
    const withoutHref = await html("button", { label: "Comprar", href: "" });
    const style = (out: string) =>
      out.split('style="')[1].split('"')[0];
    expect(style(withoutHref)).toBe(style(withHref));
    expect(count(withoutHref, "text-decoration:none")).toBeGreaterThan(0);
  });

  it("does not double-escape hrefs that already contain &", async () => {
    const out = await html("link", {
      label: "Ver",
      href: "https://tienda.com/?a=1&b=2",
    });
    expect(out).toContain('href="https://tienda.com/?a=1&amp;b=2"');
    expect(out).not.toContain("&amp;amp;");
  });
});
