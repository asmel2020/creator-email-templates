import type {
  BlockDefinition,
  EmailBlockProps,
  EmailBlockType,
  EmailContext,
  EmailPalette,
  EmailSettings,
} from "../core/types";
import type { EmailVariable, EmailVariableSection } from "../core/variables";

/** `Partial` distributivo sobre una unión (útil para props de bloques). */
export type DistributivePartial<T> = T extends unknown ? Partial<T> : never;

/** Sube una imagen y devuelve su URL (R2, S3, tu API, etc.). */
export type UploadImage = (file: File) => Promise<string>;

/**
 * Valores por defecto personalizados por tipo de bloque.
 * Se aplican sobre los defaults de la librería (o sobre un `blockLibrary` custom).
 * Ej.: `{ text: { text: "Tu mensaje" }, button: { label: "Ver más" } }`
 */
export type BlockDefaultsMap = Partial<
  Record<EmailBlockType, DistributivePartial<EmailBlockProps>>
>;

export interface EmailBuilderLabels {
  blocksTitle: string;
  optionsTitle: string;
  optionsOpen: string;
  optionsClose: string;
  noSelection: string;
  editInlineHint: string;
  listEditHint: string;
  columnsEditHint: string;
  addListItem: string;
  listItemPlaceholder: string;
  imagePlaceholder: string;
  uploadImage: string;
  replaceImage: string;
  uploading: string;
  imageUploaded: string;
  imageUploadError: string;
  logoUrl: string;
  imageAlt: string;
  imageHref: string;
  imageWidth: string;
  buttonLabel: string;
  buttonHref: string;
  align: string;
  backgroundColor: string;
  buttonBackground: string;
  buttonColor: string;
  textColor: string;
  icon: string;
  quoteAuthor: string;
  quoteBorderColor: string;
  quoteMarginLeft: string;
  quotePaddingY: string;
  quotePaddingX: string;
  quoteBorderWidth: string;
  dividerColor: string;
  dividerHeight: string;
  spacerHeight: string;
  pageBackground: string;
  cardBorderWidth: string;
  cardBorderRadius: string;
  settings: string;
  deviceMobile: string;
  deviceDesktop: string;
  canvasPreview: string;
  variablesInfoTitle: string;
  variablesInfoDescription: string;
  variablesGroup: string;
  dragToStart: string;
  dropAtEnd: string;
  drag: string;
  moveUp: string;
  moveDown: string;
  duplicate: string;
  delete: string;
}

export const DEFAULT_LABELS: EmailBuilderLabels = {
  blocksTitle: "Bloques",
  optionsTitle: "Opciones",
  optionsOpen: "Abrir opciones",
  optionsClose: "Cerrar opciones",
  noSelection: "Selecciona un bloque para editar sus propiedades",
  editInlineHint:
    "Haz clic en el texto del lienzo para editarlo (negrita, cursiva, etc.).",
  listEditHint:
    "Edita cada elemento en el lienzo. Presiona Enter o usa \"+ Agregar elemento\" para crear otro.",
  columnsEditHint: "Edita el texto de cada columna directamente en el lienzo.",
  addListItem: "Agregar elemento",
  listItemPlaceholder: "Escribir elemento...",
  imagePlaceholder: "Selecciona una imagen en el panel derecho",
  uploadImage: "Subir imagen",
  replaceImage: "Reemplazar imagen",
  uploading: "Subiendo...",
  imageUploaded: "Imagen subida",
  imageUploadError: "Error al subir la imagen",
  logoUrl: "Logo (URL)",
  imageAlt: "Texto alternativo",
  imageHref: "Enlace (opcional)",
  imageWidth: "Ancho (px)",
  buttonLabel: "Texto del botón",
  buttonHref: "Enlace (acepta variable)",
  align: "Alineación",
  backgroundColor: "Color de fondo",
  buttonBackground: "Color del botón",
  buttonColor: "Color de texto",
  textColor: "Color de texto",
  icon: "Ícono",
  quoteAuthor: "Autor (con formato)",
  quoteBorderColor: "Color de la barra",
  quoteMarginLeft: "Margen izq. (px)",
  quotePaddingY: "Padding vertical (px)",
  quotePaddingX: "Padding horizontal (px)",
  quoteBorderWidth: "Grosor barra (px)",
  dividerColor: "Color",
  dividerHeight: "Altura (px)",
  spacerHeight: "Altura (px)",
  pageBackground: "Fondo de página",
  cardBorderWidth: "Grosor borde card (px)",
  cardBorderRadius: "Redondeo borde card (px)",
  settings: "Ajustes",
  deviceMobile: "Teléfono",
  deviceDesktop: "Laptop / Escritorio",
  canvasPreview: "Vista previa del correo",
  variablesInfoTitle: "Etiquetas disponibles",
  variablesInfoDescription:
    "Escribe estas etiquetas en cualquier texto (ej. {name}) y se reemplazarán con los datos reales al enviar el correo.",
  variablesGroup: "Etiquetas disponibles",
  dragToStart: "Arrastra bloques aquí para comenzar",
  dropAtEnd: "Suelta aquí para agregar al final",
  drag: "Arrastrar",
  moveUp: "Subir",
  moveDown: "Bajar",
  duplicate: "Duplicar",
  delete: "Eliminar",
};

export interface EmailBuilderConfig {
  variables?: EmailVariable[];
  variableSections?: EmailVariableSection[];
  blockLibrary?: BlockDefinition[];
  blockDefaults?: BlockDefaultsMap;
  palette?: Partial<EmailPalette>;
  defaultSettings?: Partial<EmailSettings>;
  sampleContext?: EmailContext;
  labels?: Partial<EmailBuilderLabels>;
}

export interface ResolvedEmailBuilderConfig {
  variables: EmailVariable[];
  variableSections: EmailVariableSection[];
  blockLibrary: BlockDefinition[];
  blockMap: Record<EmailBlockType, BlockDefinition>;
  palette: EmailPalette;
  defaultSettings: EmailSettings;
  sampleContext: EmailContext;
  uploadImage?: UploadImage;
  labels: EmailBuilderLabels;
}