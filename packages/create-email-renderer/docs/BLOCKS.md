# Catálogo de bloques — `create-email-renderer`

Referencia completa de los **26 bloques built-in**: qué hace cada uno, sus props con el default
real del esquema, sus variantes y un ejemplo copiable con `blockJson`. Si eres una IA leyendo
esto para generar un correo, empieza por [El payload](#el-payload) y luego baja al bloque que
necesites.

> Los defaults de abajo salen de `DEFAULT_BLOCK_LIBRARY` (`src/default-blocks.ts`), la misma
> fuente que usa el panel del editor. Lo que no pases queda con su default.

---

## El payload

Lo que se guarda y lo que se renderiza es:

```ts
interface EmailTemplatePayload {
  content: EmailBlock[];              // los bloques, en orden
  settings: Partial<EmailSettings>;   // ajustes de la tarjeta (opcional)
}

interface EmailBlock {
  id: string;                         // generado por `blockJson` / normalizado si falta
  type: EmailBlockType;               // uno de los 26 de este documento
  props: Record<string, unknown>;     // props del bloque (ver cada sección)
}
```

Para construirlo desde el back-end **no escribas el JSON a mano**: usa `blockJson` y
`templateJson` (rellenan defaults, coaccionan tipos y generan ids).

```ts
import { blockJson, templateJson } from "create-email-renderer";
import { renderTemplateEmail } from "create-email-renderer/server";

const payload = templateJson(
  [
    blockJson("heading", { text: "Hola {firstName}" }),
    blockJson("text", { text: "Tu pedido está listo." }),
    blockJson("checkout", {
      lines: [{ name: "Camiseta", quantity: "1", price: "$20" }],
    }),
  ],
  { cardBorderWidth: 0, fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif" },
);

const { html, subject } = await renderTemplateEmail({
  subject: "Tu pedido {orderId}",
  payload,
  context: { firstName: "Ana", orderId: "A-123" },
});
```

### Props comunes a (casi) todos los bloques

Todos heredan `BlockCommonProps`:

| Prop | Tipo | Default | Notas |
|---|---|---|---|
| `align` | `"left" \| "center" \| "right"` | según bloque | Alineación del contenido. |
| `paddingY` / `paddingX` | `number` (px) | según bloque | Padding vertical / horizontal del bloque. |
| `paddingTop` / `paddingRight` / `paddingBottom` / `paddingLeft` | `number` (px) | `undefined` | Overrides por lado; **ganan** sobre el shorthand. |
| `marginTop` / `marginBottom` | `number` (px) | `undefined` | Separación externa (se aplica a la tabla contenedora, no al `<td>`). |
| `gap` | `number` (px) | según bloque | Separación interna (gutter de columnas, filas de listas, celdas de galería). |

Excepciones: `spacer` tiene layout fijo y `footer` lo resuelve por variante.

### Variables `{key}`

Cualquier campo de texto (y los `src`/`href`) acepta `{clave}` y se resuelve con el `context`:

```ts
await renderTemplateEmail({
  subject: "Hola {firstName}",
  payload,
  context: { firstName: "Ana", unsubscribeUrl: "https://…/baja" },
});
```

Claves de ejemplo ya presentes en `SAMPLE_CONTEXT`: `name`, `firstName`, `lastName`, `email`,
`phone`, `role`, `companyName`, `unsubscribeUrl`, `link`, `date`, `year`, `siteUrl`,
`supportEmail`, `webinarName`, `webinarDate`, `slotsLeft`, `productName`, `amountVes`,
`paymentUrl`… Una `{clave}` desconocida **se deja tal cual** (no se vacía).

### Ajustes (`settings`)

| Prop | Tipo | Default | Notas |
|---|---|---|---|
| `pageBackground` | `string` | `#f5f1e8` | Fondo de la página (fuera de la tarjeta). |
| `cardBorderWidth` | `number` (px) | `1` | Borde de la tarjeta del correo (0 = sin marco). |
| `cardBorderRadius` | `number` (px) | `4` | Redondeo de la tarjeta. |
| `fontFamily` | `string` | stack de sistema | Tipografía del correo; `""` = no emitir (hereda la del cliente). |
| `files` | `EmailFileAttachment[]` | `[]` | Archivos subidos (en el editor: **Ajustes**). Los lista el bloque `downloads` y tu backend los adjunta al enviar. |

Cada archivo de `settings.files`:

```ts
interface EmailFileAttachment {
  id: string;
  url: string;        // URL PÚBLICA (https/data). Obligatoria.
  name: string;       // "guia.pdf" (se deriva de la URL si falta)
  size?: number;      // bytes (informativo)
  mimeType?: string;  // "application/pdf" (elige el ícono)
  attach?: boolean;   // true = adjuntar al correo (lo hace tu ESP)
  link?: boolean;     // default true = listarlo en el bloque `downloads`
}
```

**Contrato con tu backend/ESP** (los adjuntos no viajan en el HTML):

```ts
const { content, settings } = parseTemplatePayload(payload);   // normaliza y repara
const attachments = settings.files
  .filter((f) => f.attach)
  .map((f) => ({ filename: f.name, path: f.url }));            // p. ej. Resend/SES
const { html, subject } = await renderTemplateEmail({ subject, payload, context });
```

> Los esquemas permitidos son `http:`, `https:` y `data:`; cualquier otro (`javascript:`, `blob:`)
> se descarta al normalizar. Los `blob:` del navegador solo sirven para previsualizar.

### Anidamiento

`container`, `columns`, `grid` y `footer` son **contenedores**: guardan hijos en
`blocks: EmailBlock[]` o `columns: ColumnDef[]` (`{ id, blocks, width? }`).
**Profundidad máxima = 1** (`MAX_BLOCK_DEPTH`): un bloque puede contener hijos, pero esos hijos
no pueden volver a contener bloques (se descartan al normalizar). Un `footer` **no** se puede
anidar.

```ts
blockJson("grid", {
  layout: "50-50",
  columns: [
    { width: 50, blocks: [blockJson("heading", { text: "Izquierda" })] },
    { width: 50, blocks: [["image", { src: "https://…/foto.jpg" }]] },
  ],
});
```

---

## 1. `header` — Header / Marca

Cabecera con logo o nombre de marca y una línea de apoyo.

| Prop | Tipo | Default |
|---|---|---|
| `brandName` | `string` | `"Tu Marca"` |
| `tagline` | `string` | `"Breve descripción de tu marca"` |
| `logoUrl` | `string` | `""` (si falta, pinta el `brandName` en texto) |
| `backgroundColor` | `string` | `#0d0b08` |

```ts
blockJson("header", {
  brandName: "Tu Marca",
  tagline: "Novedades de la semana",
  logoUrl: "https://…/logo.png",
  backgroundColor: "#0d0b08",
});
```

## 2. `hero` — Hero

Titular grande + subtítulo (y opcionalmente una imagen), centrado por defecto.

| Prop | Tipo | Default |
|---|---|---|
| `title` | `string` | `"¡Un gran titular aquí!"` |
| `subtitle` | `string` | `"Un subtítulo de apoyo para tu mensaje."` |
| `imageUrl` | `string` | `""` |

```ts
blockJson("hero", { title: "Todo lo que llega este mes", subtitle: "Novedades y ofertas" });
```

## 3. `heading` — Título

Título de sección.

| Prop | Tipo | Default |
|---|---|---|
| `text` | `string` (richText) | `"Título de sección"` |
| `size` | `number` (px) | `22` |
| `color` | `string` | `#0d0b08` |

## 4. `text` — Texto

Párrafo de texto (admite richText: `<strong>`, `<em>`, `<a>`… saneado con `sanitize-html`).

| Prop | Tipo | Default |
|---|---|---|
| `text` | `string` (richText) | `"Escribe aquí tu mensaje…"` |
| `size` | `number` (px) | `15` |
| `color` | `string` | `#221d15` |

## 5. `list` — Lista (3 estilos)

| `variant` | Qué pinta |
|---|---|
| `bullets` (default) | viñetas con `icon` + `items: string[]` |
| `numbered` | badge circular numerado + `title` + `description` |
| `with-image` | imagen 40% + título + descripción + enlace (sin badge) |

| Prop | Tipo | Default | Aplica a |
|---|---|---|---|
| `items` | `string[]` | 3 beneficios | `bullets` |
| `icon` | `string` | `"✓"` | `bullets` |
| `entries` | `ListEntry[]` (`title`, `description`, `number`, `image`, `href`, `linkLabel`) | 3 filas | `numbered`, `with-image` |
| `accentColor` | `string` | `#d7b227` | badge y enlace |
| `radius` / `imageHeight` | `number` (px) | `4` / `168` | `with-image` |
| `gap` | `number` (px) | `8` (bullets) / `24` | separación entre filas |

```ts
blockJson("list", {
  variant: "numbered",
  items: [],
  entries: [
    { title: "Envíos en 24 h", description: "Entrega exprés." },
    { title: "Soporte ampliado", description: "También los domingos." },
  ],
  accentColor: "#4f46e5",
});
```

## 6. `button` — Botón CTA

| Prop | Tipo | Default |
|---|---|---|
| `label` | `string` | `"¡Quiero mi cupo!"` |
| `href` | `string` | `""` |
| `backgroundColor` | `string` | `#d7b227` |
| `color` | `string` | `#0d0b08` |
| `blockBackgroundColor` | `string` | `undefined` (fondo del bloque) |

> Si `href` está vacío el botón se pinta como texto (sin `<a>`), no navega.

## 7. `image` — Imagen

| Prop | Tipo | Default |
|---|---|---|
| `src` | `string` | `""` (placeholder "(Selecciona una imagen)") |
| `alt` | `string` | `"Imagen"` |
| `width` | `number` (px) | `480` |
| `href` | `string` | `""` (opcional: envuelve la imagen en un enlace) |

## 8. `quote` — Cita / Testimonio

| Prop | Tipo | Default |
|---|---|---|
| `text` | `string` (richText) | `"Esto cambió por completo mi manera de pensar."` |
| `author` | `string` | `"Nombre del participante"` |
| `borderColor` | `string` | `#d7b227` |

## 9. `columns` — Columnas (contenedor)

Dos celdas con bloques hijos.

| Prop | Tipo | Default |
|---|---|---|
| `columns` | `ColumnDef[]` = `{ id, blocks: EmailBlock[], width? }` | 2 celdas con un `text` |
| `gap` | `number` (px) | `8` |

## 10. `container` — Contenedor (contenedor)

Agrupa bloques en una columna (útil para mover un bloque como unidad).

| Prop | Tipo | Default |
|---|---|---|
| `blocks` | `EmailBlock[]` | `[]` |

## 11. `grid` — Cuadrícula (contenedor)

Una **fila** de celdas con anchos configurables.

| Prop | Tipo | Default |
|---|---|---|
| `columns` | `ColumnDef[]` con `width` en % | 2 celdas |
| `layout` | `string` (preset: `1-2`, `1-3-2-3`, `2-3-1-3`, `1-3-1-3-1-3`, `1-4-1-4-1-4-1-4`) | `"1-2"` |
| `gap` | `number` (px) | `12` |

## 12. `divider` — Divisor

| Prop | Tipo | Default |
|---|---|---|
| `color` | `string` | `#e3dccb` |

## 13. `spacer` — Espaciador

| Prop | Tipo | Default |
|---|---|---|
| `height` | `number` (px) | `24` |

## 14. `footer` — Footer (3 estilos, contenedor)

| `variant` | Qué pinta |
|---|---|
| `classic` (default) | barra oscura con `text` + `brandName` |
| `one-column` | una celda con bloques hijos (`columns[0]`) |
| `two-columns` | dos celdas con bloques hijos |

| Prop | Tipo | Default | Aplica a |
|---|---|---|---|
| `text` | `string` | `"Recibes este correo por estar registrado…"` | `classic` |
| `brandName` | `string` | `"Tu Marca"` | `classic` |
| `columns` | `ColumnDef[]` | `[]` | `one-column`, `two-columns` |
| `backgroundColor` | `string` | `#0d0b08` | todas |
| `gap` | `number` (px) | `12` | columnas |

> No puede anidarse dentro de otro contenedor.

```ts
blockJson("footer", {
  variant: "one-column",
  columns: [{ blocks: [blockJson("text", { text: "Recibes este correo por…" })] }],
  backgroundColor: "#f9fafb",
});
```

## 15. `social` — Redes sociales (2 modos)

| Prop | Tipo | Default |
|---|---|---|
| `mode` | `"text" \| "logo"` | `"text"` |
| `links` | `{ label, href, icon }[]` | 3 redes |
| `iconSize` | `number` (px) | `32` |
| `gap` | `number` (px) | `6` |
| `color` | `string` | `#221d15` (texto en modo `text`) |
| `accentColor` | `string` | `#d7b227` (medallón en modo `logo`) |

En modo `logo`, `icon` acepta un glifo (`SOCIAL_ICONS`) **o** una URL de imagen (`https:` o `data:`).

## 16. `gallery` — Galería (4 diseños)

| `variant` | Qué pinta |
|---|---|
| `grid` (default) | cuadrícula de 2/3 columnas (`columns`) |
| `three-columns` | una fila de tres |
| `horizontal` | dos apiladas + una alta (cubre las dos + gutter) |
| `vertical` | una ancha arriba + dos abajo |

| Prop | Tipo | Default | Notas |
|---|---|---|---|
| `images` | `{ src, alt, href }[]` | 2 | |
| `columns` | `number` (2 \| 3) | `2` | solo `grid` |
| `radius` | `number` (px) | `6` | |
| `imageHeight` | `number` (px) | `0` = alto automático | con alto fijo añade `object-fit:cover` |
| `gap` | `number` (px) | `12` | gutter entre celdas |

> `object-fit:cover` no lo soporta Outlook escritorio: ahí las imágenes se estiran. Con
> `imageHeight: 0` el correo es "a prueba de balas".

## 17. `stats` — Estadísticas

| Prop | Tipo | Default |
|---|---|---|
| `stats` | `{ value, label }[]` | 3 cifras |
| `accentColor` | `string` | `#d7b227` |

## 18. `pricing` — Precio / Plan (3 estilos)

| `variant` | Qué pinta | Props que usa |
|---|---|---|
| `card` (default) | tarjeta de un plan | `title`, `price`, `period`, `bullets`, `ctaLabel`, `ctaHref` |
| `offer` | tabla de oferta con nota | + `eyebrow`, `description`, `note`, `note2` (botón full-width) |
| `two-tiers` | 2+ planes con uno destacado | `heading`, `subtitle`, `plans[]`, `footnote` |

`PricingPlan` = `{ title, price, period, description, features: string[], ctaLabel, ctaHref, highlighted }`.

| Prop | Tipo | Default |
|---|---|---|
| `plans` | `PricingPlan[]` | `[]` |
| `accentColor` | `string` | `#d7b227` |
| `textColor` | `string` | `#221d15` |

```ts
blockJson("pricing", {
  variant: "two-tiers",
  heading: "Elige tu plan",
  subtitle: "Sin permanencia.",
  plans: [
    { title: "Hobby", price: "$29", period: "/ mes", features: ["25 productos"], ctaLabel: "Empezar" },
    { title: "Enterprise", price: "$99", period: "/ mes", features: ["Todo incluido"], ctaLabel: "Empezar", highlighted: true },
  ],
  footnote: "Precios sin impuestos.",
});
```

## 19. `product` — Producto (4 estilos)

| `variant` | Qué pinta |
|---|---|
| `card` (default) | imagen centrada + nombre + descripción + precio + CTA |
| `hero` | imagen ancha arriba (320) + `eyebrow` + título 36px + … |
| `image-left` | tabla 50/50: imagen izquierda, ficha derecha (botón 75%) |
| `grid` | encabezado opcional + tarjetas de `products[]` (`columns` 2/3/4; con 4 → 2×2 + `Hr`) |

| Prop | Tipo | Default | Notas |
|---|---|---|---|
| `imageUrl`, `name`, `description`, `price` | `string` | ver esquema | variantes de un producto |
| `eyebrow` | `string` | `""` | `hero` |
| `heading` / `subheading` | `string` | `""` | `grid` |
| `products` | `ProductItem[]` (`imageUrl`, `name`, `description`, `price`, `ctaLabel`, `ctaHref`) | 2 tarjetas | `grid` |
| `columns` | `number` (2 \| 3 \| 4) | `2` | `grid` |
| `radius` | `number` (px) | `8` (hero 12) | |
| `imageHeight` | `number` (px) | `0` = default del layout (hero 320 · grid 180/250) | |
| `accentColor` | `string` | `#d7b227` | eyebrow, precio y botón |

## 20. `checkout` — Resumen de pedido

Carrito con líneas de producto y botón de compra full-width.

| Prop | Tipo | Default |
|---|---|---|
| `heading` | `string` | `"Tu carrito te espera"` |
| `lines` | `CheckoutLine[]` = `{ imageUrl, name, quantity, price }` | 2 líneas |
| `ctaLabel` / `ctaHref` | `string` | `"Finalizar compra"` / `""` |
| `imageHeight` | `number` (px) | `110` (miniatura cuadrada) |
| `radius` | `number` (px) | `8` |
| `accentColor` | `string` | `#4f46e5` (botón) |
| `borderColor` | `string` | `#e5e7eb` (caja y líneas de la tabla) |

```ts
blockJson("checkout", {
  heading: "Tu carrito te espera",
  lines: [
    { name: "Reloj clásico", imageUrl: "https://…/reloj.jpg", quantity: "1", price: "$210.00" },
    { name: "Reloj de pared", quantity: "2", price: "$90.00" },
  ],
  ctaLabel: "Volver a mi carrito",
  ctaHref: "https://tienda.com/carrito",
});
```

## 21. `testimonial` — Testimonio

| Prop | Tipo | Default |
|---|---|---|
| `avatarUrl` | `string` | `""` |
| `quote` | `string` (richText) | `"Cambió por completo la forma en que trabajamos."` |
| `name` / `role` | `string` | `"Nombre Apellido"` / `"Cargo en la empresa"` |
| `accentColor` | `string` | `#d7b227` |

## 22. `features` — Características

| Prop | Tipo | Default |
|---|---|---|
| `features` | `{ icon, title, description }[]` | 2 filas |
| `columns` | `number` (2 \| 3) | `2` |
| `accentColor` | `string` | `#d7b227` (ícono) |

## 23. `avatar` — Avatar

| Prop | Tipo | Default |
|---|---|---|
| `imageUrl` | `string` | `""` |
| `name` / `role` | `string` | `"Nombre Apellido"` / `"Cargo"` |
| `size` | `number` (px) | `96` |

## 24. `code` — Código

| Prop | Tipo | Default |
|---|---|---|
| `code` | `string` | `"npm install create-email-template"` |
| `language` | `string` | `"bash"` |
| `backgroundColor` / `color` | `string` | `#0d0b08` / `#f5f1e8` |

Usa un stack monoespaciado propio (gana sobre el `fontFamily` del correo).

## 25. `link` — Enlace

| Prop | Tipo | Default |
|---|---|---|
| `label` | `string` | `"Ver más"` |
| `href` | `string` | `""` |
| `color` | `string` | `#a98a1e` |

> Sin `href` se pinta como texto (sin `<a>`).

## 26. `downloads` — Archivos / Descargas

Lista los archivos de **`settings.files`** (los que se suben en Ajustes) con su tipo, nombre,
tamaño y un enlace de descarga. **No lleva los archivos en las props**: el bloque solo pinta la
lista, así que subir un archivo en Ajustes lo actualiza en todos los correos que tengan el bloque.

| Prop | Tipo | Default |
|---|---|---|
| `heading` | `string` | `"Recursos descargables"` |
| `subheading` | `string` | `""` |
| `buttonLabel` | `string` | `"Descargar"` |
| `accentColor` | `string` | `#d7b227` (enlace y badge) |
| `borderColor` | `string` | `#e3dccb` (caja y filas) |
| `showIcon` / `showSize` | `boolean` | `true` / `true` |
| `radius` | `number` (px) | `8` |
| `emptyText` | `string` | `""` (sin archivos no pinta nada) |

Solo aparecen los archivos con `link !== false`; los marcados únicamente como adjunto
(`attach: true, link: false`) no salen en el HTML. Sin archivos y sin `emptyText` el bloque no
emite ni un byte (la salida es idéntica a la de una plantilla sin el bloque).

```ts
templateJson(
  [blockJson("downloads", { heading: "Recursos de la semana" })],
  {
    files: [
      { id: "f1", url: "https://cdn.tu-sitio.com/guia.pdf", name: "Guía.pdf", size: 1536, mimeType: "application/pdf" },
      { id: "f2", url: "https://cdn.tu-sitio.com/planilla.xlsx", name: "Planilla.xlsx", mimeType: "application/vnd.ms-excel" },
    ],
  },
);
```

---

## Reglas prácticas al generar correos

1. **Usa `blockJson` / `templateJson`**, no JSON a mano: los defaults y los ids salen solos.
2. Los arrays de registros se llaman `images`, `links`, `stats`, `features`, `entries`, `plans`,
   `products` y `lines`. **Nunca `items`** para registros: `items` es la lista de strings de
   `list`.
3. **Imágenes**: mejor URLs `https:` propias. Las `data:` (SVG inline) las descarta Gmail.
4. **Alto fijo + `object-fit`** se ve bien en Gmail/Apple Mail/Outlook web, pero **no** en Outlook
   escritorio (se estira). Para máxima compatibilidad: `imageHeight: 0`.
5. **Enlaces**: si dejas `href: ""` el CTA se pinta como texto; nunca genera `href=""`.
6. **Un solo nivel de anidamiento** y un `footer` por correo.
7. **Peso**: mantén el HTML por debajo de ~102 KB o Gmail lo recortará ("Ver todo el mensaje").
8. **Variables**: úsalas en textos y enlaces; no inventes claves fuera del `context` (se quedan
   visibles como `{clave}`).
9. **Archivos descargables**: van en `settings.files`, no en el bloque; usa URL públicas
   (`https:`) y `attach: true` solo lo que quieras adjuntar de verdad (el HTML no adjunta nada).
