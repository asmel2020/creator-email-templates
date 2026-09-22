import { describe, expect, it } from "vitest";
import { normalizeBlocks } from "../src/normalize.js";
import { renderEmailHtml } from "../src/html-render.js";
import type { EmailBlock } from "../src/types.js";

const propsOf = (blocks: EmailBlock[]) => blocks[0].props as Record<string, unknown>;

describe("new block props normalization", () => {
  it("repairs social links (ids, strings)", () => {
    const out = normalizeBlocks([
      {
        id: "s",
        type: "social",
        props: { links: [{ label: 1, href: null }, null] },
      },
    ]);
    const links = propsOf(out).links as Array<Record<string, unknown>>;
    expect(links).toHaveLength(2);
    expect(links[0]).toMatchObject({ label: "1", href: "" });
    expect(typeof links[0].id).toBe("string");
    expect(typeof links[1].id).toBe("string");
  });

  it("repairs gallery images", () => {
    const out = normalizeBlocks([
      {
        id: "g",
        type: "gallery",
        props: { images: [{ src: "a.png", alt: "A", href: "x" }] },
      },
    ]);
    const images = propsOf(out).images as Array<Record<string, unknown>>;
    expect(images[0]).toMatchObject({ src: "a.png", alt: "A", href: "x" });
  });

  it("repairs stats and features records", () => {
    const out = normalizeBlocks([
      {
        id: "st",
        type: "stats",
        props: { stats: [{ value: 5, label: "X" }] },
      },
      {
        id: "f",
        type: "features",
        props: {
          features: [{ icon: "★", title: "T", description: "D" }],
        },
      },
    ]);
    const stats = (out[0].props as { stats: Array<Record<string, unknown>> })
      .stats;
    expect(stats[0]).toMatchObject({ value: "5", label: "X" });
    const features = (
      out[1].props as { features: Array<Record<string, unknown>> }
    ).features;
    expect(features[0]).toMatchObject({ icon: "★", title: "T", description: "D" });
  });

  it("coerces pricing bullets to string[]", () => {
    const out = normalizeBlocks([
      { id: "p", type: "pricing", props: { bullets: [1, true, "tres"] } },
    ]);
    expect(propsOf(out).bullets).toEqual(["1", "true", "tres"]);
  });

  it("falls back to defaults on corrupt record arrays", () => {
    const out = normalizeBlocks([
      { id: "s", type: "social", props: { links: "nope" } },
    ]);
    const links = propsOf(out).links as unknown[];
    expect(Array.isArray(links)).toBe(true);
    expect(links.length).toBe(3);
  });
});

describe("social mode", () => {
  const links = [
    { id: "a", label: "Instagram", href: "https://ig.com", icon: "◎" },
    { id: "b", label: "X", href: "https://x.com", icon: "X" },
  ];

  it("renders labels in text mode (default)", async () => {
    const html = await renderEmailHtml({
      blocks: [
        { id: "s", type: "social", props: { links } as never },
      ],
    });
    expect(html).toContain("Instagram");
    expect(html).not.toContain(">◎<");
  });

  it("renders icon badges in logo mode", async () => {
    const html = await renderEmailHtml({
      blocks: [
        {
          id: "s",
          type: "social",
          props: { links, mode: "logo", accentColor: "#ff0000" } as never,
        },
      ],
    });
    expect(html).toContain(">◎<");
    expect(html).toContain("border-radius:50%");
    expect(html).toContain("#ff0000");
  });

  it("renders an image when the icon is a URL", async () => {
    const html = await renderEmailHtml({
      blocks: [
        {
          id: "s",
          type: "social",
          props: {
            links: [
              {
                id: "a",
                label: "IG",
                href: "x",
                icon: "https://cdn.example.com/ig.png",
              },
            ],
            mode: "logo",
          } as never,
        },
      ],
    });
    expect(html).toContain('src="https://cdn.example.com/ig.png"');
  });

  it("honours iconSize and gap in logo mode", async () => {
    const html = await renderEmailHtml({
      blocks: [
        {
          id: "s",
          type: "social",
          props: { links, mode: "logo", iconSize: 36, gap: 8 } as never,
        },
      ],
    });
    expect(html).toContain("width:36px");
    expect(html).toContain("margin:0 4px");
  });
});
