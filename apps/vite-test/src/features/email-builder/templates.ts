import type { EmailBlock } from "create-email-template"

/**
 * Correos ya armados para la demo: plantillas **completas** (varios bloques),
 * no patrones de un bloque. Los patrones por bloque viven en la librería
 * (p. ej. las variantes del bloque Footer vía `FOOTER_VARIANTS`), así que no
 * se duplican acá.
 *
 * Hoy está vacío a propósito: el menú "Plantillas" de la toolbar queda listo
 * para cargar correos completos cuando los haya.
 */
export interface SampleTemplate {
  id: string
  name: string
  /** De dónde viene el patrón (referencia). */
  source: string
  blocks: EmailBlock[]
}

export const SAMPLE_TEMPLATES: SampleTemplate[] = []
