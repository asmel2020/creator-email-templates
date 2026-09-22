// Test de documentación: evita que el catálogo de bloques se quede viejo.
// Si añades un bloque (o cambias su label) y olvidas documentarlo, esto falla.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_BLOCK_LIBRARY } from "../src/default-blocks.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (rel: string) => readFileSync(join(root, rel), "utf8");

describe("documentación", () => {
  const blocks = read("docs/BLOCKS.md");
  const skill = read("SKILL.md");
  const mcp = read("docs/MCP.md");
  const llms = read("llms.txt");

  it("documenta los 25 bloques con su label y defaultProps", () => {
    const missing: string[] = [];
    for (const def of DEFAULT_BLOCK_LIBRARY) {
      if (!blocks.includes(`\`${def.type}\``)) missing.push(`type ${def.type}`);
      if (!blocks.includes(def.label)) missing.push(`label ${def.label}`);
      // Un default representativo: la primera clave string de defaultProps.
      const key = Object.keys(def.defaultProps)[0];
      if (key && !blocks.includes(`\`${key}\``)) missing.push(`${def.type}.${key}`);
    }
    expect(missing).toEqual([]);
  });

  it("documenta los arrays de registros y las variantes de los bloques clave", () => {
    for (const key of [
      "entries",
      "images",
      "stats",
      "features",
      "plans",
      "products",
      "lines",
      "links",
    ]) {
      expect(blocks, key).toContain(key);
    }
    for (const variant of [
      "bullets",
      "numbered",
      "with-image",
      "three-columns",
      "horizontal",
      "vertical",
      "classic",
      "one-column",
      "two-columns",
      "offer",
      "two-tiers",
      "image-left",
    ]) {
      expect(blocks, variant).toContain(variant);
    }
  });

  it("mantiene el SKILL con las APIs y el puntero al catálogo", () => {
    for (const api of [
      "renderTemplateEmail",
      "blockJson",
      "templateJson",
      "parseTemplatePayload",
      "tracking",
    ]) {
      expect(skill, api).toContain(api);
    }
    expect(skill).toContain("docs/BLOCKS.md");
    expect(skill).toContain("docs/MCP.md");
  });

  it("documenta las tools del MCP", () => {
    for (const tool of [
      "list_blocks",
      "get_block_schema",
      "build_block",
      "render_email",
      "parse_template",
      "validate_template",
    ]) {
      expect(mcp, tool).toContain(tool);
    }
  });

  it("mantiene llms.txt apuntando a las docs", () => {
    for (const doc of ["SKILL.md", "docs/BLOCKS.md", "docs/MCP.md", "README.md"]) {
      expect(llms, doc).toContain(doc);
    }
  });
});
