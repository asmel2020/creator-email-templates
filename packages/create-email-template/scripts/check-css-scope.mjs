#!/usr/bin/env node
// Guard de scoping del CSS del paquete: falla si dist/style.css contiene
// algún selector de nivel superior que no cuelgue de .ter-theme / clases
// ter-*. Un selector global (`*`, `button`, `:root`...) en CSS sin capa pisa
// las utilidades @layer de la app host (Tailwind v4: unlayered siempre gana)
// — exactamente el leak corregido en v0.1.5. Se ejecuta en prepublishOnly.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const cssPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../dist/style.css",
);

const ALLOWED_SELECTORS = [".ter-", ".ter-theme", ":where(.ter-theme", ".dark .ter"];
const ALLOWED_AT_RULES = [
  "@font-face",
  "@keyframes ter-",
  "@media",
  "@supports",
  "@import",
  "@charset",
];

const css = readFileSync(cssPath, "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
const offenders = [];
let selectorCount = 0;

function checkSelector(raw, where) {
  for (const part of raw.split(",")) {
    const sel = part.trim();
    if (!sel) continue;
    selectorCount++;
    if (!ALLOWED_SELECTORS.some((prefix) => sel.startsWith(prefix))) {
      offenders.push(`${where} → ${sel.slice(0, 80)}`);
    }
  }
}

// Índice de la `}` que cierra la `{` en css[open].
function matchBrace(css, open) {
  let depth = 0;
  for (let j = open; j < css.length; j++) {
    if (css[j] === "{") depth++;
    else if (css[j] === "}") {
      depth--;
      if (depth === 0) return j;
    }
  }
  return css.length - 1;
}

// Camina los bloques de nivel superior; los cuerpos de reglas normales y de
// at-rules opacos (@font-face, @keyframes) no se inspeccionan, pero @media y
// @supports se recursan porque sus selectores internos son reales.
function walk(chunk, where) {
  let prelude = "";
  let i = 0;
  while (i < chunk.length) {
    const ch = chunk[i];
    if (ch === "{") {
      const end = matchBrace(chunk, i);
      const sel = prelude.trim();
      prelude = "";
      if (sel.startsWith("@media") || sel.startsWith("@supports")) {
        walk(chunk.slice(i + 1, end), `${where} ${sel.slice(0, 30)}`.trim());
      } else if (sel.startsWith("@")) {
        if (!ALLOWED_AT_RULES.some((prefix) => sel.startsWith(prefix))) {
          offenders.push(`${where} → at-rule no permitido: ${sel.slice(0, 80)}`);
        }
      } else {
        checkSelector(sel, where);
      }
      i = end + 1;
      continue;
    } else if (ch === ";") {
      // Statements sin bloque (@import/@charset ya resueltos por el bundler).
      const sel = prelude.trim();
      prelude = "";
      if (sel.startsWith("@") && !ALLOWED_AT_RULES.some((prefix) => sel.startsWith(prefix))) {
        offenders.push(`${where} → at-rule no permitido: ${sel.slice(0, 80)}`);
      }
    } else {
      prelude += ch;
    }
    i++;
  }
}

walk(css, "top-level");

if (offenders.length > 0) {
  console.error(`✗ dist/style.css tiene ${offenders.length} selector(es) sin scope ter-:`);
  for (const off of offenders.slice(0, 10)) console.error(`  ${off}`);
  if (offenders.length > 10) console.error(`  … y ${offenders.length - 10} más`);
  console.error("Todo selector global (p. ej. `*`, button, :root) pisará las capas @layer del host.");
  process.exit(1);
}

console.log(`✓ dist/style.css limpio: ${selectorCount} selectores, todos bajo .ter-theme / ter-*.`);
