// Red de seguridad de paridad: snapshot del HTML email-safe por tipo de bloque.
// Cualquier refactor (registry, anidamiento) debe mantener estos bytes salvo
// que se actualice el snapshot de forma consciente y revisada.
import { describe, expect, it } from "vitest";
import { renderEmailHtml } from "../src/html-render.js";
import {
  DEFAULT_BLOCK_LIBRARY,
  DEFAULT_PALETTE,
  DEFAULT_SETTINGS,
} from "../src/default-blocks.js";
import {
  DEFAULT_CONTEXTUAL_VARIABLES,
  SAMPLE_CONTEXT,
} from "../src/variables.js";
import type { EmailBlock, EmailBlockType } from "../src/types.js";

const CONTEXT = {
  ...SAMPLE_CONTEXT,
  webinarName: "Masterclass de Email",
  webinarDate: "12 de octubre",
  webinarTime: "19:00",
  webinarDuration: "90 min",
  webinarUrl: "https://example.com/webinar",
  registerUrl: "https://example.com/register",
  liveUrl: "https://example.com/live",
  slotsLeft: "12",
  reminderDate: "11 de octubre",
} as Record<string, string>;

const blockOfType = (type: EmailBlockType): EmailBlock => {
  const def = DEFAULT_BLOCK_LIBRARY.find((b) => b.type === type);
  if (!def) throw new Error(`missing definition for ${type}`);
  return {
    id: `id-${type}`,
    type,
    props: structuredClone(def.defaultProps) as EmailBlock["props"],
  };
};

// Ids deterministas: algunos defaultProps llaman newId() al importar.
const stableBlock = (type: EmailBlockType): EmailBlock => {
  const block = blockOfType(type);
  let n = 0;
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (value && typeof value === "object") {
      const obj = value as Record<string, unknown>;
      if (typeof obj.id === "string") {
        n += 1;
        obj.id = `id-${type}-${n}`;
      }
      for (const v of Object.values(obj)) walk(v);
    }
  };
  walk(block.props);
  return block;
};

describe("renderEmailHtml parity snapshots", () => {
  it("covers every built-in block type", () => {
    expect(DEFAULT_BLOCK_LIBRARY.map((b) => b.type).sort()).toEqual(
      [
        "avatar",
        "button",
        "checkout",
        "code",
        "columns",
        "container",
        "divider",
        "features",
        "footer",
        "gallery",
        "grid",
        "header",
        "heading",
        "hero",
        "image",
        "link",
        "list",
        "pricing",
        "product",
        "quote",
        "social",
        "spacer",
        "stats",
        "testimonial",
        "text",
      ].sort(),
    );
  });

  for (const def of DEFAULT_BLOCK_LIBRARY) {
    it(`renders ${def.type}`, async () => {
      const html = await renderEmailHtml({
        blocks: [stableBlock(def.type)],
        subject: "Asunto de prueba {name}",
        context: CONTEXT,
        settings: DEFAULT_SETTINGS,
        palette: DEFAULT_PALETTE,
      });
      expect(html).toMatchSnapshot();
    });
  }

  it("renders full sample email with all block types", async () => {
    const blocks = DEFAULT_BLOCK_LIBRARY.map((def) => stableBlock(def.type));
    const html = await renderEmailHtml({
      blocks,
      subject: "Email completo",
      context: CONTEXT,
      settings: DEFAULT_SETTINGS,
      palette: DEFAULT_PALETTE,
    });
    expect(html).toMatchSnapshot();
  });

  it("resolves variables in heading text", async () => {
    const block = blockOfType("heading");
    (block.props as { text: string }).text = "Hola {firstName} de {companyName}";
    const html = await renderEmailHtml({
      blocks: [block],
      context: CONTEXT,
    });
    expect(html).toContain("Hola Juan de Mi Empresa");
    expect(html).not.toContain("{firstName}");
  });

  it("unknown block type renders empty string", async () => {
    const html = await renderEmailHtml({
      blocks: [
        {
          id: "x",
          type: "no-existe" as EmailBlockType,
          props: {} as EmailBlock["props"],
        },
      ],
    });
    // solo el documento envoltorio, sin cuerpo de bloque
    expect(html).not.toContain("no-existe");
    expect(DEFAULT_CONTEXTUAL_VARIABLES.length).toBeGreaterThan(0);
  });
});
