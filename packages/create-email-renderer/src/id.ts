// Identificador de bloques/columnas usando la API nativa del navegador,
// sin depender del paquete uuid.
export const newId = (): string => crypto.randomUUID();
