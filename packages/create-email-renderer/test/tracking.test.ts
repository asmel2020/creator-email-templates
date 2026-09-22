import { describe, expect, it } from "vitest";
import { renderEmailHtml } from "../src/html-render.js";
import { applyTracking, DEFAULT_TRACKING_EXCLUDE } from "../src/tracking.js";
import type { EmailBlock, EmailTracking } from "../src/types.js";

const blocks = (): EmailBlock[] =>
  [
    {
      id: "b1",
      type: "button",
      props: {
        label: "Comprar",
        href: "https://tienda.com/carrito?ref=mail#top",
        align: "center",
        paddingY: 12,
        paddingX: 32,
      },
    },
    {
      id: "b2",
      type: "link",
      props: { label: "Darme de baja", href: "https://tienda.com/baja" },
    },
    {
      id: "b3",
      type: "link",
      props: { label: "Soporte", href: "mailto:soporte@tienda.com" },
    },
  ] as EmailBlock[];

const html = (tracking?: EmailTracking, context = {}) =>
  renderEmailHtml({ blocks: blocks(), tracking, context });

const TRACKER = "https://track.tienda.com/c?id=abc&u={url}";

describe("tracking", () => {
  it("leaves the HTML untouched when disabled", async () => {
    const withOut = await html();
    expect(withOut).not.toContain("track.tienda.com");
    expect(withOut).not.toContain("<img src=\"https://track");
    // Byte-idéntico a pasar tracking undefined explícito.
    expect(await html(undefined)).toBe(withOut);
  });

  it("injects the open pixel before </body> and resolves variables", async () => {
    const out = await html(
      { pixelUrl: "https://track.tienda.com/o?id=abc&e={email}" },
      { email: "ana@ejemplo.com" },
    );
    expect(out).toContain(
      '<img src="https://track.tienda.com/o?id=abc&amp;e=ana@ejemplo.com" width="1" height="1"',
    );
    expect(out.indexOf("track.tienda.com/o")).toBeLessThan(out.indexOf("</body>"));
  });

  it("wraps links with the click tracker and escapes the destination", async () => {
    const out = await html({ clickUrl: TRACKER });
    // El query del destino va codificado dentro del parámetro u=.
    expect(out).toContain(
      "https://track.tienda.com/c?id=abc&amp;u=https%3A%2F%2Ftienda.com%2Fcarrito%3Fref%3Dmail%23top",
    );
    // Los enlaces de baja y mailto no se tocan.
    expect(out).toContain('<a href="https://tienda.com/baja"');
    expect(out).toContain('<a href="mailto:soporte@tienda.com"');
  });

  it("adds UTM to the destination (before wrapping) and keeps existing params", async () => {
    const out = await html({
      utm: { source: "email", medium: "email", campaign: "carrito" },
    });
    expect(out).toContain(
      "https://tienda.com/carrito?ref=mail&amp;utm_source=email&amp;utm_medium=email&amp;utm_campaign=carrito#top",
    );
  });

  it("combines UTM with the click tracker", async () => {
    const out = await html({
      clickUrl: TRACKER,
      utm: { campaign: "carrito" },
    });
    expect(out).toContain("utm_campaign%3Dcarrito");
  });

  it("honours the extra exclusions", async () => {
    const out = await html({ clickUrl: TRACKER, exclude: ["/soporte"] });
    expect(out).toContain('<a href="mailto:soporte@tienda.com"');
  });

  it("supports a full custom transform", async () => {
    const out = await html({
      transformLink: (href) => `https://x.io/r?to=${encodeURIComponent(href)}`,
    });
    expect(out).toContain("https://x.io/r?to=https%3A%2F%2Ftienda.com%2Fcarrito");
  });

  it("never throws on garbage URLs", () => {
    const out = applyTracking('<a href="no-es-url">x</a>', { utm: { source: "e" } }, {});
    expect(out).toBe('<a href="no-es-url">x</a>');
  });

  it("exposes sensible default exclusions", () => {
    expect(DEFAULT_TRACKING_EXCLUDE).toContain("mailto:");
    expect(DEFAULT_TRACKING_EXCLUDE).toContain("/baja");
  });
});
