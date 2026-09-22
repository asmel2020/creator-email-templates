// Bloque `downloads`: la lista sale de `settings.files` (los archivos que el
// usuario sube en Ajustes), no de las props del bloque. Cubre filtrado
// link/attach, escapado, guard de esquema y el hilo de `settings` por el
// anidamiento (contenedor → hijo).
import { describe, expect, it } from "vitest";
import { renderEmailHtml } from "../src/html-render.js";
import { normalizeFiles } from "../src/normalize.js";
import { DEFAULT_BLOCK_LIBRARY, DEFAULT_SETTINGS } from "../src/default-blocks.js";
import type {
  DownloadsProps,
  EmailBlock,
  EmailSettings,
  EmailFileAttachment,
} from "../src/types.js";

const downloadsDefaults = (): DownloadsProps =>
  structuredClone(
    DEFAULT_BLOCK_LIBRARY.find((d) => d.type === "downloads")!
      .defaultProps as DownloadsProps,
  );

const block = (props: Partial<DownloadsProps> = {}): EmailBlock => ({
  id: "b1",
  type: "downloads",
  props: { ...downloadsDefaults(), ...props },
});

const settingsWith = (files: Partial<EmailFileAttachment>[]): EmailSettings => ({
  ...DEFAULT_SETTINGS,
  files: normalizeFiles(
    files.map((f, i) => ({ id: `f${i}`, name: `archivo-${i}`, ...f })),
  ),
});

const render = (blocks: EmailBlock[], settings: Partial<EmailSettings>) =>
  renderEmailHtml({ blocks, settings });

describe("bloque downloads", () => {
  it("lista los archivos con nombre, tamaño y enlace de descarga", async () => {
    const html = await render(
      [block()],
      settingsWith([
        { url: "https://cdn.test/guia.pdf", name: "Guía.pdf", size: 1536 },
        {
          url: "https://cdn.test/plantilla.xlsx",
          name: "Plantilla.xlsx",
          size: 2_500_000,
        },
      ]),
    );
    expect(html).toContain("Guía.pdf");
    expect(html).toContain("Plantilla.xlsx");
    expect(html).toContain("2 KB");
    expect(html).toContain("2.4 MB");
    expect(html).toContain('href="https://cdn.test/guia.pdf"');
    expect(html).toContain('href="https://cdn.test/plantilla.xlsx"');
    expect(html).toContain("PDF");
    expect(html).toContain("XLS");
    expect(html).toContain("Descargar");
    expect(html).toContain("Recursos descargables");
  });

  it("omite los archivos marcados solo como adjunto (link: false)", async () => {
    const html = await render(
      [block()],
      settingsWith([
        { url: "https://cdn.test/visible.pdf", name: "visible.pdf" },
        {
          url: "https://cdn.test/adjunto.pdf",
          name: "adjunto.pdf",
          link: false,
          attach: true,
        },
      ]),
    );
    expect(html).toContain("visible.pdf");
    expect(html).not.toContain("adjunto.pdf");
  });

  it("ignora URLs con esquemas no permitidos aunque lleguen sin normalizar", async () => {
    const settings: Partial<EmailSettings> = {
      files: [
        {
          id: "x",
          url: "javascript:alert(1)",
          name: "malo.pdf",
          link: true,
        },
        { id: "y", url: "https://cdn.test/bueno.pdf", name: "bueno.pdf" },
      ],
    };
    const html = await render([block()], settings);
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("malo.pdf");
    expect(html).toContain("bueno.pdf");
  });

  it("no pinta nada sin archivos (y respeta emptyText)", async () => {
    const vacío = await render([block()], settingsWith([]));
    expect(vacío).not.toContain("Recursos descargables");
    expect(vacío).not.toContain("Descargar");

    const conMensaje = await render(
      [block({ emptyText: "Sube tus archivos en Ajustes" })],
      settingsWith([]),
    );
    expect(conMensaje).toContain("Sube tus archivos en Ajustes");
  });

  it("escapa nombres y URLs", async () => {
    const html = await render(
      [block({ heading: "<b>Descargas</b>" })],
      settingsWith([
        {
          url: "https://cdn.test/a.pdf?a=1&b=2",
          name: '<img src=x onerror="alert(1)">.pdf',
        },
      ]),
    );
    expect(html).not.toContain("<img src=x");
    expect(html).toContain("&lt;img src=x");
    expect(html).toContain("a=1&amp;b=2");
  });

  it("aplica el layout del bloque (padding/margen)", async () => {
    const html = await render(
      [block({ paddingY: 24, paddingX: 40, marginTop: 12 })],
      settingsWith([{ url: "https://cdn.test/a.pdf", name: "a.pdf" }]),
    );
    expect(html).toContain("padding:24px 40px");
    expect(html).toContain("margin-top:12px");
  });

  it("resuelve variables en el encabezado y en la URL", async () => {
    const html = await renderEmailHtml({
      blocks: [block({ heading: "Hola {firstName}" })],
      context: { firstName: "Juan" },
      settings: settingsWith([
        { url: "https://cdn.test/{firstName}.pdf", name: "f.pdf" },
      ]),
    });
    expect(html).toContain("Hola Juan");
    expect(html).toContain('href="https://cdn.test/Juan.pdf"');
  });

  it("recibe settings aunque el bloque vaya anidado en un contenedor", async () => {
    const container: EmailBlock = {
      id: "c1",
      type: "container",
      props: {
        ...structuredClone(
          DEFAULT_BLOCK_LIBRARY.find((d) => d.type === "container")!
            .defaultProps,
        ),
        blocks: [block()],
      } as EmailBlock["props"],
    };
    const html = await render(
      [container],
      settingsWith([{ url: "https://cdn.test/anidado.pdf", name: "anidado.pdf" }]),
    );
    expect(html).toContain("anidado.pdf");
  });

  it("mantiene la salida sin archivos idéntica al HTML previo", async () => {
    // Sin `files` en los settings el bloque no emite ni un byte.
    const conBloque = await render([block()], { ...DEFAULT_SETTINGS });
    const sinBloque = await render([], { ...DEFAULT_SETTINGS });
    expect(conBloque).toBe(sinBloque);
  });
});
