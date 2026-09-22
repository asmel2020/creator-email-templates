import { describe, expect, it } from "vitest";
import { normalizeBlocks, normalizeFiles, normalizeSettings } from "../src/normalize.js";
import { DEFAULT_BLOCK_LIBRARY, DEFAULT_SETTINGS } from "../src/default-blocks.js";
import { parseTemplatePayload } from "../src/server.js";

describe("normalizeBlocks", () => {
  it("returns [] for non-array input", () => {
    expect(normalizeBlocks(null)).toEqual([]);
    expect(normalizeBlocks("nope")).toEqual([]);
    expect(normalizeBlocks({})).toEqual([]);
  });

  it("drops unknown block types silently", () => {
    const out = normalizeBlocks([
      { id: "1", type: "text", props: { text: "ok" } },
      { id: "2", type: "mega-banner", props: {} },
      "not-an-object",
      null,
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].type).toBe("text");
  });

  it("fills missing props from defaults and discards legacy keys", () => {
    const out = normalizeBlocks([
      {
        id: "1",
        type: "heading",
        props: { text: "Solo texto", legacyProp: true, size: "28" },
      },
    ]);
    const props = out[0].props as Record<string, unknown>;
    expect(props.text).toBe("Solo texto");
    expect(props.size).toBe(28);
    expect(props.color).toBe("#0d0b08"); // default
    expect(props).not.toHaveProperty("legacyProp");
  });

  it("repairs missing ids", () => {
    const out = normalizeBlocks([{ type: "text", props: { text: "x" } }]);
    expect(out[0].id).toBeTruthy();
    expect(typeof out[0].id).toBe("string");
  });

  it("normalizes columns array shape", () => {
    const out = normalizeBlocks([
      {
        id: "c1",
        type: "columns",
        props: {
          columns: [{ text: "A" }, { id: "", text: 42 }, null],
        },
      },
    ]);
    const cols = (
      out[0].props as {
        columns: { id: string; blocks: { props: { text: string } }[] }[];
      }
    ).columns;
    expect(cols).toHaveLength(3);
    expect(cols[0].blocks[0].props.text).toBe("A");
    expect(cols[0].id).toBeTruthy();
    expect(cols[1].blocks[0].props.text).toBe("42");
    expect(cols[2].id).toBeTruthy();
  });

  it("coerces list items to string[]", () => {
    const out = normalizeBlocks([
      {
        id: "l",
        type: "list",
        props: { items: [1, true, "tres"] },
      },
    ]);
    expect((out[0].props as { items: string[] }).items).toEqual([
      "1",
      "true",
      "tres",
    ]);
  });

  it("uses provided library only", () => {
    const library = DEFAULT_BLOCK_LIBRARY.filter((d) => d.type === "text");
    const out = normalizeBlocks(
      [
        { id: "1", type: "text", props: {} },
        { id: "2", type: "header", props: {} },
      ],
      library,
    );
    expect(out).toHaveLength(1);
    expect(out[0].type).toBe("text");
  });
});

describe("normalizeSettings", () => {
  it("falls back to defaults", () => {
    expect(normalizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(normalizeSettings({ pageBackground: 1 })).toEqual(DEFAULT_SETTINGS);
  });

  it("keeps known keys and coerces numbers", () => {
    expect(
      normalizeSettings({
        pageBackground: "#111111",
        cardBorderWidth: "3",
        cardBorderRadius: 10,
        fontFamily: "Georgia, serif",
        evil: true,
      }),
    ).toEqual({
      pageBackground: "#111111",
      cardBorderWidth: 3,
      cardBorderRadius: 10,
      fontFamily: "Georgia, serif",
      files: [],
    });
  });

  it("falls back to the default font stack and keeps the empty opt-out", () => {
    expect(normalizeSettings({}).fontFamily).toBe(DEFAULT_SETTINGS.fontFamily);
    expect(normalizeSettings({ fontFamily: "" }).fontFamily).toBe("");
    expect(normalizeSettings({ fontFamily: 42 as never }).fontFamily).toBe(
      DEFAULT_SETTINGS.fontFamily,
    );
  });

  describe("files", () => {
    it("defaults to an empty list and repairs corrupt entries", () => {
      expect(normalizeSettings(null).files).toEqual([]);
      expect(normalizeSettings({ files: "nope" as never }).files).toEqual([]);
      const [file] = normalizeFiles([
        // Sin id, sin nombre y con el tamaño como string.
        { url: "https://cdn.test/guia.pdf", size: "1536", attach: "true" },
      ]);
      expect(typeof file.id).toBe("string");
      expect(file.id.length).toBeGreaterThan(0);
      // El nombre se deriva de la URL y los defaults se aplican.
      expect(file.name).toBe("guia.pdf");
      expect(file.size).toBe(1536);
      expect(file.attach).toBe(true);
      expect(file.link).toBe(true);
    });

    it("drops entries without a usable url (scheme whitelist)", () => {
      const files = normalizeFiles([
        { url: "" },
        { url: "   " },
        { name: "sin url" },
        { url: "javascript:alert(1)" },
        { url: "blob:https://local/abc" },
        { url: "https://cdn.test/ok.pdf", name: "ok.pdf" },
        { url: "data:application/pdf;base64,AAAA", name: "inline.pdf" },
      ]);
      expect(files.map((f) => f.url)).toEqual([
        "https://cdn.test/ok.pdf",
        "data:application/pdf;base64,AAAA",
      ]);
    });

    it("respeta link/attach explícitos y el orden de subida", () => {
      const files = normalizeFiles([
        { url: "https://cdn.test/a.pdf", name: "a.pdf", link: false, attach: true },
        { url: "https://cdn.test/b.pdf", name: "b.pdf", link: "false", attach: false },
        { url: "https://cdn.test/c.pdf", name: "c.pdf" },
      ]);
      expect(files.map((f) => [f.name, f.link, f.attach])).toEqual([
        ["a.pdf", false, true],
        ["b.pdf", false, false],
        ["c.pdf", true, false],
      ]);
    });

    it("no deriva el nombre de un data: URL (evita nombres gigantes)", () => {
      const [file] = normalizeFiles([
        { url: "data:application/pdf;base64,JVBERi0xLjQK" },
      ]);
      expect(file.name).toBe("archivo");
    });
  });
});

describe("parseTemplatePayload", () => {
  it("never throws on garbage", () => {
    for (const bad of [null, undefined, "{not json", '"string"', 42]) {
      const out = parseTemplatePayload(bad as never);
      expect(out.content).toEqual([]);
      expect(out.settings).toEqual({});
    }
    // array sin content/settings shape
    const arr = parseTemplatePayload([] as never);
    expect(arr.content).toEqual([]);
  });

  it("keeps empty object payload as empty content", () => {
    expect(parseTemplatePayload({})).toEqual({ content: [], settings: {} });
  });

  it("parses valid JSON string payload", () => {
    const payload = JSON.stringify({
      content: [{ id: "1", type: "text", props: { text: "hola" } }],
      settings: { pageBackground: "#ffffff" },
    });
    const out = parseTemplatePayload(payload);
    expect(out.content).toHaveLength(1);
    expect(out.content[0].type).toBe("text");
    expect(out.settings.pageBackground).toBe("#ffffff");
  });
});
