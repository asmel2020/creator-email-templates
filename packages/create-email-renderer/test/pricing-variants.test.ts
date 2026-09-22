import { describe, expect, it } from "vitest";
import { renderEmailHtml } from "../src/html-render.js";
import { normalizeBlocks } from "../src/normalize.js";

describe("pricing variants", () => {
  it("offer renders eyebrow, full-width button, notes and hr", async () => {
    const html = await renderEmailHtml({
      blocks: [
        {
          id: "p",
          type: "pricing",
          props: {
            variant: "offer",
            price: "$12",
            period: "/ mes",
            eyebrow: "Oferta exclusiva",
            bullets: ["Uno", "Dos"],
            ctaLabel: "Reclamar",
            note: "Nota uno",
            note2: "Nota dos",
          } as never,
        },
      ],
    });
    expect(html).toContain("Oferta exclusiva");
    expect(html).toContain("/ mes");
    expect(html).toContain("display:block");
    expect(html).toContain("width:100%");
    expect(html).toContain("Nota uno");
    expect(html).toContain("Nota dos");
    expect(html).toContain("<hr");
  });

  it("two-tiers renders both plans and the highlighted card", async () => {
    const html = await renderEmailHtml({
      blocks: [
        {
          id: "p",
          type: "pricing",
          props: {
            variant: "two-tiers",
            heading: "Elige tu plan",
            subtitle: "Subtítulo",
            footnote: "Equipo",
            plans: [
              {
                id: "a",
                title: "Hobby",
                price: "$29",
                period: "/ mes",
                features: ["25 productos"],
                ctaLabel: "Empezar",
                highlighted: false,
              },
              {
                id: "b",
                title: "Enterprise",
                price: "$99",
                period: "/ mes",
                features: ["Ilimitado"],
                ctaLabel: "Empezar",
                highlighted: true,
              },
            ],
          } as never,
        },
      ],
    });
    expect(html).toContain("Elige tu plan");
    expect(html).toContain("Hobby");
    expect(html).toContain("Enterprise");
    expect(html).toContain("#101828");
    expect(html).toContain("Equipo");
    expect(html.match(/width="50%"/g)?.length).toBe(2);
  });

  it("normalizes plans (features to string[], highlighted to boolean)", () => {
    const out = normalizeBlocks([
      {
        id: "p",
        type: "pricing",
        props: {
          variant: "two-tiers",
          plans: [
            {
              title: "Hobby",
              price: 29,
              features: [1, true, "x"],
              highlighted: "true",
            },
          ],
        },
      },
    ]);
    const plans = (
      out[0].props as {
        plans: {
          price: string;
          features: string[];
          highlighted: boolean;
        }[];
      }
    ).plans;
    expect(plans[0].price).toBe("29");
    expect(plans[0].features).toEqual(["1", "true", "x"]);
    expect(plans[0].highlighted).toBe(true);
  });
});
