import { newId } from "./id.js"
import type { BlockDefinition, EmailPalette, EmailSettings } from "./types.js"

export const DEFAULT_PALETTE: EmailPalette = {
  INK: "#221d15",
  DARK: "#0d0b08",
  GOLD: "#d7b227",
  CREAM_DIM: "#b8ae9d",
}

export const DEFAULT_SETTINGS: EmailSettings = {
  pageBackground: "#f5f1e8",
  cardBorderWidth: 1,
  cardBorderRadius: 4,
}

export const DEFAULT_BLOCK_LIBRARY: BlockDefinition[] = [
  {
    type: "header",
    label: "Header / Marca",
    description: "Logo y nombre de la marca",
    defaultProps: {
      brandName: "Tu Marca",
      tagline: "Breve descripción de tu marca",
      align: "center",
      backgroundColor: "#0d0b08",
      paddingY: 24,
      paddingX: 32,
    },
  },
  {
    type: "hero",
    label: "Hero",
    description: "Titular grande + subtítulo",
    defaultProps: {
      title: "¡Un gran titular aquí!",
      subtitle: "Un subtítulo de apoyo para tu mensaje.",
      align: "center",
      paddingY: 40,
      paddingX: 32,
    },
  },
  {
    type: "heading",
    label: "Título",
    description: "Título de sección",
    defaultProps: {
      text: "Título de sección",
      size: 22,
      color: "#0d0b08",
      align: "left",
      paddingY: 16,
      paddingX: 32,
    },
  },
  {
    type: "text",
    label: "Texto",
    description: "Párrafo de texto",
    defaultProps: {
      text: "Escribe aquí tu mensaje. Puedes usar variables como {name}.",
      size: 15,
      color: "#221d15",
      align: "left",
      paddingY: 12,
      paddingX: 32,
    },
  },
  {
    type: "list",
    label: "Lista",
    description: "Viñetas de beneficios",
    defaultProps: {
      items: ["Beneficio 1", "Beneficio 2", "Beneficio 3"],
      icon: "✓",
      align: "left",
      paddingY: 12,
      paddingX: 32,
    },
  },
  {
    type: "button",
    label: "Botón CTA",
    description: "Botón con enlace",
    defaultProps: {
      label: "¡Quiero mi cupo!",
      href: "",
      backgroundColor: "#d7b227",
      color: "#0d0b08",
      align: "center",
      paddingY: 16,
      paddingX: 32,
    },
  },
  {
    type: "image",
    label: "Imagen",
    description: "Imagen del correo",
    defaultProps: {
      src: "",
      alt: "Imagen",
      width: 480,
      align: "center",
      paddingY: 16,
      paddingX: 32,
    },
  },
  {
    type: "quote",
    label: "Cita / Testimonio",
    description: "Cita con autor",
    defaultProps: {
      text: "Esto cambió por completo mi manera de pensar.",
      author: "Nombre del participante",
      borderColor: "#d7b227",
      align: "left",
      paddingY: 16,
      paddingX: 32,
    },
  },
  {
    type: "columns",
    label: "Columnas",
    description: "Dos columnas de texto",
    defaultProps: {
      columns: [
        { id: newId(), text: "Columna 1" },
        { id: newId(), text: "Columna 2" },
      ],
      align: "left",
      paddingY: 16,
      paddingX: 32,
    },
  },
  {
    type: "divider",
    label: "Divisor",
    description: "Línea separadora",
    defaultProps: {
      color: "#e3dccb",
      paddingY: 8,
      paddingX: 32,
    },
  },
  {
    type: "spacer",
    label: "Espaciador",
    description: "Altura en píxeles",
    defaultProps: {
      height: 24,
    },
  },
  {
    type: "footer",
    label: "Footer",
    description: "Legal y baja de suscripción",
    defaultProps: {
      text: "Recibes este correo por estar registrado en nuestra plataforma.",
      brandName: "Tu Marca",
    },
  },
]
