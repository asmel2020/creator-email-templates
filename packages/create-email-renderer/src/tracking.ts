// Trackeo de correo (aperturas y clics) aplicado como post-proceso sobre el
// HTML ya generado: no toca los renderers de bloque ni los defaults, así que
// sin `tracking` la salida es byte-idéntica. Puro y tolerante: nunca lanza.
import { escapeHtml } from "./richtext.js";
import { resolveVariables } from "./variables.js";
import type { EmailContext, EmailTracking } from "./types.js";

/** Pixel 1×1 de apertura. */
const openPixel = (url: string): string =>
  `<img src="${escapeHtml(url)}" width="1" height="1" alt="" style="display:none;border:0;outline:none;" />`;

/** Hrefs que nunca se reescriben (baja, anclas, esquemas sin http). */
const isExcluded = (href: string, exclude: string[]): boolean =>
  href === "" ||
  href.startsWith("#") ||
  href.startsWith("{") ||
  exclude.some((needle) => needle !== "" && href.includes(needle));

/** Añade (o sobreescribe) los UTM del destino. Si no es una URL válida, no toca nada. */
const withUtm = (
  href: string,
  utm: EmailTracking["utm"],
): string => {
  if (!utm) return href;
  try {
    const url = new URL(href);
    for (const [key, value] of Object.entries(utm)) {
      if (value != null && value !== "") url.searchParams.set(`utm_${key}`, value);
    }
    return url.toString();
  } catch {
    return href;
  }
};

/**
 * Aplica el trackeo al HTML: pixel de apertura antes de `</body>` y
 * reescritura de los `<a href>` (según `clickUrl` / `utm` / `transformLink`).
 */
export const applyTracking = (
  html: string,
  tracking: EmailTracking | undefined,
  context: EmailContext,
): string => {
  if (!tracking) return html;
  let out = html;

  if (tracking.clickUrl || tracking.utm || tracking.transformLink) {
    const exclude = [
      ...DEFAULT_TRACKING_EXCLUDE,
      ...(tracking.exclude ?? []),
    ];
    out = out.replace(/<a\b[^>]*>/g, (tag) =>
      tag.replace(/href="([^"]*)"/, (match, raw: string) => {
        // En el atributo los `&` van escapados (`&amp;`): se compara decodificado.
        const href = raw.replace(/&amp;/g, "&");
        if (isExcluded(href, exclude)) return match;
        const destination = withUtm(href, tracking.utm);
        const wrapped = tracking.transformLink
          ? tracking.transformLink(destination)
          : tracking.clickUrl
            ? resolveVariables(tracking.clickUrl, context).replace(
                /\{url\}/g,
                encodeURIComponent(destination),
              )
            : destination;
        return `href="${escapeHtml(wrapped)}"`;
      }),
    );
  }

  if (tracking.pixelUrl) {
    const pixel = openPixel(resolveVariables(tracking.pixelUrl, context));
    out = out.includes("</body>")
      ? out.replace("</body>", `${pixel}\n  </body>`)
      : `${out}${pixel}`;
  }

  return out;
};

/**
 * Exclusiones por defecto del click tracking: la baja y los esquemas que no
 * son enlaces web nunca deben pasar por el tracker.
 */
export const DEFAULT_TRACKING_EXCLUDE = [
  "mailto:",
  "tel:",
  "sms:",
  "unsubscribe",
  "/baja",
  "optout",
  "opt-out",
  "darse-de-baja",
];
